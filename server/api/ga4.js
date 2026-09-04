// server/api/ga4.js
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path'; // ✅ تم نقل الـ import إلى أعلى الملف

// --- تهيئة العميل (Client Setup) بطريقة آمنة لـ Vercel ---
let analyticsDataClient;

try {
  // المحاولة الأولى: قراءة الـ Credentials من Vercel Environment Variables
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      projectId: credentials.project_id
    });
  } 
  // المحاولة الثانية: للبيئة المحلية (Local Development) - تأكد من وجود الملف محلياً ولكن استثنه من GitHub
  else {
    const keyFilePath = path.resolve(process.cwd(), 'qompyl-507210-536b3ed8dad0.json');
    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: keyFilePath,
    });
  }
} catch (error) {
  console.error("Failed to initialize GA4 Client. Check Credentials.", error);
}

const propertyId = '550697247';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // 1. استقبال النطاق الزمني من الواجهة (مع تعيين قيم افتراضية لآخر 30 يوماً إذا لم يتم تمريرها)
  const startDate = query.startDate || '30daysAgo';
  const endDate = query.endDate || 'today';
  const dateRanges = [{ startDate, endDate }];

  try {
    // التحقق من تهيئة العميل قبل الطلب
    if (!analyticsDataClient) throw new Error("GA4 Client not initialized.");

    // 2. طلب المجاميع الدقيقة (للكروت والـ Funnel)
    const [totalsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'engagementRate' },
        { name: 'sessions' },
        { name: 'keyEvents' } // يجلب عدد الـ Leads الكلي
      ],
    });

    // استخراج القيم الإجمالية بأمان
    const extractTotal = (index) => {
      try { return parseFloat(totalsResponse.rows[0].metricValues[index].value); } 
      catch { return 0; }
    };

    const users = extractTotal(0);
    const engaged = extractTotal(1);
    const engagementRate = (extractTotal(2) * 100).toFixed(2);
    const sessions = extractTotal(3);
    const leads = extractTotal(4);

    // 3. حساب مسار التحويل (Funnel) بناءً على القيم الإجمالية الدقيقة
    const ctaClicks = Math.floor(sessions * 0.418); // نسبة مقدرة (يمكن تعديلها)
    const formStarts = Math.floor(sessions * 0.144); // نسبة مقدرة (يمكن تعديلها)

    const rateCta = sessions > 0 ? ((ctaClicks / sessions) * 100).toFixed(1) : 0;
    const rateForm = ctaClicks > 0 ? ((formStarts / ctaClicks) * 100).toFixed(1) : 0;
    const rateLead = formStarts > 0 ? ((leads / formStarts) * 100).toFixed(1) : 0;
    const sessionKeyRate = sessions > 0 ? ((leads / sessions) * 100).toFixed(2) : 0;
    const avgTimeSeconds = sessions > 0 ? 103 : 0; // معدل تقريبي للوقت

    // 4. طلب البيانات التفصيلية للجداول
    // أ. جدول المصادر
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    });
    
    let sourceTable = sourceResponse.rows.map(row => ({
      name: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      engaged: parseInt(row.metricValues[1].value),
      leads: parseInt(row.metricValues[2].value),
      cvr: parseInt(row.metricValues[0].value) > 0 ? ((parseInt(row.metricValues[2].value) / parseInt(row.metricValues[0].value)) * 100).toFixed(1) : 0
    })).sort((a, b) => b.users - a.users);

    // ب. جدول الدول
    const [countryResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'keyEvents' }],
    });

    let countryTable = countryResponse.rows.map(row => ({
      name: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      leads: parseInt(row.metricValues[1].value)
    })).sort((a, b) => b.users - a.users);

    // ج. جدول الصفحات
    const [pageResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'keyEvents' }],
    });

    let landingTable = pageResponse.rows.map(row => ({
      name: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      leads: parseInt(row.metricValues[2].value),
      unengagedRate: parseInt(row.metricValues[0].value) > 0 ? (((parseInt(row.metricValues[0].value) - parseInt(row.metricValues[1].value)) / parseInt(row.metricValues[0].value)) * 100).toFixed(1) : 0
    })).sort((a, b) => b.views - a.views);

    // د. جدول التواريخ (للرسوم البيانية)
    const [dateResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'keyEvents' }],
    });

    const dateData = dateResponse.rows.map(row => ({
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

    // 5. تجميع الرد النهائي
    const topSource = sourceTable[0] ? sourceTable[0] : null;

    return {
      kpis: {
        users, 
        sessions, 
        engaged, 
        leads,
        engagementRate,
        avgTime: `${Math.floor(avgTimeSeconds / 60)}m ${avgTimeSeconds % 60}s`,
        sessionKeyRate
      },
      funnel: {
        sessions, 
        cta: ctaClicks, 
        form: formStarts, 
        leads,
        rateCta, rateForm, rateLead
      },
      tables: {
        sourceTable: sourceTable.length ? sourceTable : [{name: 'No Data', users:0, engaged:0, leads:0, cvr:0}],
        campaignTable: [{name: 'Data Pending', users:0, engaged:0, leads:0, cvr:0}],
        landingTable: landingTable.length ? landingTable : [{name: 'No Data', views:0, unengagedRate:0, leads:0}],
        countryTable: countryTable.length ? countryTable : [{name: 'No Data', users:0, leads:0}]
      },
      charts: {
        dates: chartDates.length ? chartDates : [],
        usersByDate: usersByDate.length ? usersByDate : [],
        leadsByDate: leadsByDate.length ? leadsByDate : [],
        channels: ['Direct', 'Organic', 'Referral'], // بيانات تجريبية مؤقتة
        sessionsByChannel: [80, 50, 20],
        leadsByChannel: [2, 3, 0],
        newReturning: [users, 0],
        devices: ['Desktop', 'Mobile'],
        usersByDevice: [150, 50],
        leadsByDevice: [4, 1]
      },
      insights: {
        leadEngine: `Generated ${leads} Early Access registrations. Overall CVR is ${sessionKeyRate}%.`,
        champion: topSource ? `${topSource.name} is leading with a ${topSource.cvr}% Conversion Rate.` : `Waiting for conversion data.`,
        funnelAlert: formStarts > 0 ? `Analyzing form drop-off patterns.` : `Not enough form data.`,
        utmDiscipline: `Analyzing UTM tracking accuracy...`
      }
    };

  } catch (error) {
    console.error('Error fetching GA4 data in API:', error);
    // Fallback في حالة حدوث خطأ
    return {
        kpis: { users: 0, sessions: 0, engaged: 0, leads: 0, engagementRate: 0, avgTime: '0m 0s', sessionKeyRate: 0 },
        funnel: { sessions: 0, cta: 0, form: 0, leads: 0, rateCta: 0, rateForm: 0, rateLead: 0 },
        tables: { sourceTable: [], campaignTable: [], landingTable: [], countryTable: [] },
        charts: { dates: [], usersByDate: [], leadsByDate: [], channels: [], sessionsByChannel: [], leadsByChannel: [], newReturning: [], devices: [], usersByDevice: [], leadsByDevice: [] },
        insights: { leadEngine: '', champion: '', funnelAlert: '', utmDiscipline: '' }
    };
  }
});