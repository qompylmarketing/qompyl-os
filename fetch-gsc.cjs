// fetch-gsc.cjs
const fs = require('fs');
const path = require('path');
const { searchconsole } = require('@googleapis/searchconsole');
const { GoogleAuth } = require('google-auth-library');

async function fetchGSCData() {
  console.log('🚀 Fetching live GSC data (from August 2026 to Today)...');
  
  // ⚠️ تأكد من أن هذا الرابط يطابق موقعك المسجل في Search Console تماماً
  const siteUrl = 'https://qompyl.com/'; 

  try {
    // 1. إعداد المصادقة باستخدام ملف الـ JSON الخاص بـ Service Account
    const auth = new GoogleAuth({
      keyFile: 'qompyl-507210-536b3ed8dad0.json', // مسار ملف المفتاح
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    const authClient = await auth.getClient();
    const gsc = searchconsole({ version: 'v1', auth: authClient });

    // 2. إعداد التواريخ
    const startDate = '2026-08-01';
    const endDate = new Date().toISOString().split('T')[0]; // تاريخ اليوم

    // 3. جلب الإجماليات الدقيقة
    console.log('Fetching accurate totals...');
    const totalsResponse = await gsc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
      },
    });
    const accurateTotals = totalsResponse.data.rows || [];

    // 4. جلب البيانات التفصيلية 
    console.log('Fetching detailed rows...');
    const detailedResponse = await gsc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'date', 'country', 'device'],
        rowLimit: 5000,
      },
    });

    // 5. تنسيق البيانات التفصيلية لتناسب الواجهة
    const detailedRows = (detailedResponse.data.rows || []).map(row => ({
      query: row.keys[0],
      date: row.keys[1],
      country: row.keys[2],
      device: row.keys[3] ? row.keys[3].replace(/^./, str => str.toUpperCase()) : 'Unknown', // Capitalize device (Desktop, Mobile)
      imp: row.impressions,
      clicks: row.clicks,
      pos: row.position,
      type: row.keys[0].toLowerCase().includes('qompyl') ? 'Branded' : 'Non-Branded' // ⚠️ عدل qompyl لاسم البراند
    }));

    // 6. حفظ البيانات في ملف gsc-real-data.json
    const finalData = { accurateTotals, detailedRows };
    fs.writeFileSync('gsc-real-data.json', JSON.stringify(finalData, null, 2));
    
    console.log('✅ GSC Data saved to gsc-real-data.json successfully! Total Rows:', detailedRows.length);

  } catch (error) {
    console.error('❌ Error fetching GSC data:', error.message);
  }
}

fetchGSCData();