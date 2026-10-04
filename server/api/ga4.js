// server/api/ga4.js
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';

let analyticsDataClient;

try {
  if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    });
  } else {
    const keyFilePath = path.resolve(process.cwd(), 'qompyl-507210-536b3ed8dad0.json');
    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: keyFilePath,
    });
  }
} catch (error) {
  console.error("🔥 GA4 Init Error:", error);
}

const propertyId = '550697247';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  const startDate = query.startDate || '2026-08-01';
  const endDate = query.endDate || 'today';
  const channels = query.channels || 'all';
  const devices = query.devices || 'all';

  const dateRanges = [{ startDate, endDate }];

  const expressions = [];
  
  if (channels !== 'all') {
    expressions.push({
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        inListFilter: { values: channels.split(',') }
      }
    });
  }

  if (devices !== 'all') {
    expressions.push({
      filter: {
        fieldName: 'deviceCategory',
        inListFilter: { values: devices.split(',') }
      }
    });
  }

  const dimensionFilter = expressions.length > 0 
    ? (expressions.length === 1 ? expressions[0] : { andGroup: { expressions } }) 
    : undefined;

  const makeRequest = async (metrics, dimensions = []) => {
    const requestBody = {
      property: `properties/${propertyId}`,
      dateRanges,
      metrics
    };
    if (dimensions.length > 0) requestBody.dimensions = dimensions;
    if (dimensionFilter) requestBody.dimensionFilter = dimensionFilter;
    
    return await analyticsDataClient.runReport(requestBody);
  };

  try {
    if (!analyticsDataClient) throw new Error("GA4 Client not initialized.");

    // 1. طلب المجاميع الدقيقة من GA4
    const [totalsResponse] = await makeRequest([
      { name: 'activeUsers' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'sessions' },
      { name: 'keyEvents' },
      { name: 'userEngagementDuration' }
    ]);

    const extractTotal = (index) => {
      try { return parseFloat(totalsResponse.rows[0].metricValues[index].value); } 
      catch { return 0; }
    };

    const users = extractTotal(0);
    const engaged = extractTotal(1);
    const engagementRate = (extractTotal(2) * 100).toFixed(2);
    const sessions = extractTotal(3);
    const leads = extractTotal(4);

    // 2. سحب أحداث cta_click و form_start الخام (Raw Data) من جوجل
    const [eventsResponse] = await makeRequest(
      [{ name: 'eventCount' }],
      [{ name: 'eventName' }]
    );

    let ctaClicks = 0;
    let formStarts = 0;

    if (eventsResponse.rows) {
      eventsResponse.rows.forEach(row => {
        const eventName = row.dimensionValues[0].value;
        const count = parseInt(row.metricValues[0].value);
        if (eventName === 'cta_click') ctaClicks = count;
        if (eventName === 'form_start') formStarts = count;
      });
    }

    // 3. حساب النسب المبدئية بناءً على أرقام GA4
    const rateCta = sessions > 0 ? ((ctaClicks / sessions) * 100).toFixed(1) : 0;
    const rateForm = ctaClicks > 0 ? ((formStarts / ctaClicks) * 100).toFixed(1) : 0;
    const rateLead = formStarts > 0 ? ((leads / formStarts) * 100).toFixed(1) : 0;
    const sessionKeyRate = sessions > 0 ? ((leads / sessions) * 100).toFixed(2) : 0;
    
    const totalEngagementSeconds = extractTotal(5);
    const avgTimeSeconds = users > 0 ? Math.round(totalEngagementSeconds / users) : 0; 

    // طلب الجداول المتبقية
    const [sourceResponse] = await makeRequest(
      [{ name: 'activeUsers' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
      [{ name: 'sessionSourceMedium' }]
    );
    
    let sourceTable = (sourceResponse.rows || []).map(row => ({
      name: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      engaged: parseInt(row.metricValues[1].value),
      leads: parseInt(row.metricValues[2].value),
      cvr: parseInt(row.metricValues[0].value) > 0 ? ((parseInt(row.metricValues[2].value) / parseInt(row.metricValues[0].value)) * 100).toFixed(1) : 0
    })).sort((a, b) => b.users - a.users);

    const [countryResponse] = await makeRequest(
      [{ name: 'activeUsers' }, { name: 'keyEvents' }],
      [{ name: 'country' }]
    );

    let countryTable = (countryResponse.rows || []).map(row => ({
      name: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      leads: parseInt(row.metricValues[1].value)
    })).sort((a, b) => b.users - a.users);

    const [pageResponse] = await makeRequest(
      [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'keyEvents' }],
      [{ name: 'pagePath' }]
    );

    let landingTable = (pageResponse.rows || []).map(row => ({
      name: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      leads: parseInt(row.metricValues[2].value),
      unengagedRate: parseInt(row.metricValues[0].value) > 0 ? (((parseInt(row.metricValues[0].value) - parseInt(row.metricValues[1].value)) / parseInt(row.metricValues[0].value)) * 100).toFixed(1) : 0
    })).sort((a, b) => b.views - a.views);

    const [dateResponse] = await makeRequest(
      [{ name: 'activeUsers' }, { name: 'keyEvents' }],
      [{ name: 'date' }]
    );

    const dateData = (dateResponse.rows || []).map(row => ({
      date: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      leads: parseInt(row.metricValues[1].value)
    })).sort((a, b) => a.date.localeCompare(b.date));

    const chartDates = dateData.map(row => {
        if(row.date && row.date.length === 8) {
          const year = row.date.substring(0,4);
          const month = row.date.substring(4,6);
          const day = row.date.substring(6,8);
          return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return row.date;
    });
    
    const usersByDate = dateData.map(row => row.users);
    const leadsByDate = dateData.map(row => row.leads);

    const topSource = sourceTable[0] ? sourceTable[0] : null;

    return {
      kpis: { users, sessions, engaged, leads, engagementRate, avgTime: `${Math.floor(avgTimeSeconds / 60)}m ${avgTimeSeconds % 60}s`, sessionKeyRate },
      funnel: { sessions, cta: ctaClicks, form: formStarts, leads, rateCta, rateForm, rateLead },
      tables: {
        sourceTable: sourceTable.length ? sourceTable : [{name: 'No Data', users:0, engaged:0, leads:0, cvr:0}],
        campaignTable: [{name: 'Data Pending', users:0, engaged:0, leads:0, cvr:0}],
        landingTable: landingTable.length ? landingTable : [{name: 'No Data', views:0, unengagedRate:0, leads:0}],
        countryTable: countryTable.length ? countryTable : [{name: 'No Data', users:0, leads:0}]
      },
      charts: {
        dates: chartDates.length ? chartDates : [], usersByDate: usersByDate.length ? usersByDate : [], leadsByDate: leadsByDate.length ? leadsByDate : [],
        channels: ['Direct', 'Organic', 'Referral'], sessionsByChannel: [80, 50, 20], leadsByChannel: [2, 3, 0],
        newReturning: [users, 0], devices: ['Desktop', 'Mobile'], usersByDevice: [150, 50], leadsByDevice: [4, 1]
      },
      insights: {
        leadEngine: `Generated ${leads} Early Access registrations. Overall CVR is ${sessionKeyRate}%.`,
        champion: topSource ? `${topSource.name} is leading with a ${topSource.cvr}% Conversion Rate.` : `Waiting for conversion data.`,
        funnelAlert: formStarts > 0 ? `Analyzing form drop-off patterns.` : `Not enough form data.`,
        utmDiscipline: `Analyzing UTM tracking accuracy...`
      }
    };

  } catch (error) {
    console.error('🔥 API Execution Error:', error);
    
    return {
        kpis: { users: 0, sessions: 0, engaged: 0, leads: 0, engagementRate: 0, avgTime: '0m 0s', sessionKeyRate: 0 },
        funnel: { sessions: 0, cta: 0, form: 0, leads: 0, rateCta: 0, rateForm: 0, rateLead: 0 },
        tables: { sourceTable: [], campaignTable: [], landingTable: [], countryTable: [] },
        charts: { dates: [], usersByDate: [], leadsByDate: [], channels: [], sessionsByChannel: [], leadsByChannel: [], newReturning: [], devices: [], usersByDevice: [], leadsByDevice: [] },
        insights: { leadEngine: '', champion: '', funnelAlert: '', utmDiscipline: '' }
    };
  }
});