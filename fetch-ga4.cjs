const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');

// 1. إعداد الاتصال بمفتاح جوجل السري الخاص بك
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: 'qompyl-507210-536b3ed8dad0.json', // استبدله باسم ملفك إذا تغير
});

const propertyId = '550697247'; // الـ Property ID الخاص بـ Qompyl

async function fetchAccurateGA4Data() {
  try {
    console.log('Fetching Accurate Data (Applying Deduplication Fix)...');

    // الطلب الأول: المجاميع الدقيقة للكروت العلوية (بدون Dimensions)
    const [totalsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-31' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'engagementRate' }
      ],
    });

    // الطلب الثاني: التفاصيل لملء الجداول والرسوم البيانية (مع Dimensions)
    const [detailsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-31' }],
      dimensions: [
        { name: 'date' },
        { name: 'sessionSourceMedium' },
        { name: 'deviceCategory' },
        { name: 'country' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'keyEvents' } // يجلب أحداث التحويل مثل generate_lead
      ],
    });

    // تشكيل البيانات النهائية
    const finalData = {
      // هذه الأرقام ستوضع مباشرة في الكروت العلوية دون أي جمع برمجي
      accurateTotals: {
        activeUsers: parseInt(totalsResponse.rows[0].metricValues[0].value),
        engagedSessions: parseInt(totalsResponse.rows[0].metricValues[1].value),
        engagementRate: parseFloat(totalsResponse.rows[0].metricValues[2].value).toFixed(2)
      },
      // هذه المصفوفة سيتم تفكيكها لملء الجداول السفلية
      detailedRows: detailsResponse.rows.map(row => ({
        date: row.dimensionValues[0].value,
        sourceMedium: row.dimensionValues[1].value,
        device: row.dimensionValues[2].value,
        country: row.dimensionValues[3].value,
        users: parseInt(row.metricValues[0].value),
        engaged: parseInt(row.metricValues[1].value),
        leads: parseInt(row.metricValues[2].value)
      }))
    };

    // حفظ البيانات في ملف محلي ليقرأه ملف الـ HTML/Vue
    fs.writeFileSync('ga4-accurate-data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Data fetched and saved to ga4-accurate-data.json successfully!');

  } catch (error) {
    console.error('❌ Error fetching data:', error);
  }
}

fetchAccurateGA4Data();