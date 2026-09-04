const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: 'qompyl-507210-536b3ed8dad0.json',
});

const propertyId = '550697247'; 
const dateRanges = [{ startDate: '2026-08-01', endDate: '2026-08-31' }];

async function fetchAccurateGA4Data() {
  try {
    console.log('Fetching Data (Applying Data Discrepancy Fix)...');

    // 1. الطلب الإجمالي (الوحيد الذي يعطي الرقم الدقيق 100% - 200 Users و 5 Leads)
    const [totalsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'engagementRate' },
        { name: 'sessions' }, // نحتاجه للـ Funnel
        { name: 'keyEvents' } // هذا سيعطينا الـ 5 Leads الحقيقية
      ],
    });

    // 2. طلبات منفصلة للجداول لتقليل الـ Thresholding
    // بدلاً من طلب واحد معقد، نطلب جداول مبسطة
    
    // أ. جدول المصادر (Source/Medium)
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    });

    // ب. جدول الدول (Country)
    const [countryResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'keyEvents' }],
    });
    
    // ج. جدول التواريخ (للرسوم البيانية)
    const [dateResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'keyEvents' }],
    });

    // د. جدول الصفحات (لـ Funnel) - لجلب أحداث cta_click و form_start إذا أمكن
    // في غيابها، سنعتمد على التقدير، ولكن يجب جلب الـ pageViews كحد أدنى
    const [pageResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'keyEvents' }],
    });

    // 3. تشكيل البيانات
    
    const extractTotal = (index) => {
        try { return parseFloat(totalsResponse.rows[0].metricValues[index].value); } 
        catch { return 0; }
    };

    const accurateTotals = {
        activeUsers: extractTotal(0), // يجب أن يعطي 200
        engagedSessions: extractTotal(1),
        engagementRate: extractTotal(2),
        sessions: extractTotal(3), // يجب أن يعطي 318
        keyEvents: extractTotal(4) // يجب أن يعطي 5
    };

    const finalData = {
      accurateTotals,
      sourceData: sourceResponse.rows.map(row => ({
          name: row.dimensionValues[0].value,
          users: parseInt(row.metricValues[0].value),
          engaged: parseInt(row.metricValues[1].value),
          leads: parseInt(row.metricValues[2].value)
      })),
      countryData: countryResponse.rows.map(row => ({
          name: row.dimensionValues[0].value,
          users: parseInt(row.metricValues[0].value),
          leads: parseInt(row.metricValues[1].value)
      })),
      dateData: dateResponse.rows.map(row => ({
          date: row.dimensionValues[0].value,
          users: parseInt(row.metricValues[0].value),
          leads: parseInt(row.metricValues[1].value)
      })),
      pageData: pageResponse.rows.map(row => ({
          path: row.dimensionValues[0].value,
          views: parseInt(row.metricValues[0].value),
          users: parseInt(row.metricValues[1].value),
          leads: parseInt(row.metricValues[2].value)
      }))
    };

    fs.writeFileSync('ga4-accurate-data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Data fetched and saved to ga4-accurate-data.json successfully!');

  } catch (error) {
    console.error('❌ Error fetching data:', error);
  }
}

fetchAccurateGA4Data();