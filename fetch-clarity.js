import fs from 'fs';

// 🛑 ضع التوكن الخاص بك هنا
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxYTBlYjA4Yi1mMzY0LTRmMjItODBhMS02OWEzZTNjZTc2MGUiLCJzdWIiOiIzNDY3MDcxNjg2OTQ5NjIwIiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc4ODI2NDI2OSwiZXhwIjo0OTQxODY0MjY5LCJpYXQiOjE3ODgyNjQyNjksImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ.O3ZM9LK-FUpMZJFkfEwRTy-iAooqC23txUqqvL7Sbys4lANwoMNMkK2USxufAhyl1mDsBkrIRlTuJ_sLJCL7qlChVij7uH1UnKhtJhAHv8R4QO4sCj-noSvRN2q0KIbhf4c6g4lEubfG0ujPp8x2C7gUvJRWMJVEUMwlEF_OKtvILjI1U3l2g2O6d05V3LX60OT1caCDAg3zc_12caJHsipvSoY3TwXJucipKGro0c64LMrqnyAmm1E3_uB0lwDe-_xQKWBY2x2keb2p6DYVWfWwN4Eki1jKWiU2PBXfiark4M8Z8UVDMfFSwfypbH1XoLMZae6dgzJVuaXw3AkT3Q'; 

async function fetchClarityData() {
  console.log(`🚀 Contacting Microsoft Clarity API for multiple date ranges...`);

  try {
    let reports = {};
    let isLiveData = false;
    
    // الفترات التي نريد جلبها: آخر يوم، آخر 3 أيام، آخر 7 أيام
    const ranges = [1, 3, 7];

    for (const days of ranges) {
      const url = `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${days}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
           const apiData = await response.json();
           
           const getMetric = (metricName, keyName) => {
              const item = apiData.find(m => m.metricName === metricName);
              return item && item.information && item.information[0] ? item.information[0][keyName] : 0;
           };
           
           reports[days] = {
              sessions: getMetric('Traffic', 'totalSessionCount'),
              rageClicks: getMetric('RageClickCount', 'subTotal'),
              deadClicks: getMetric('DeadClickCount', 'subTotal'),
              quickBacks: getMetric('QuickbackClick', 'subTotal')
           };

           isLiveData = true;
           console.log(`✅ Data for Last ${days} Days fetched successfully!`);
        } else {
           console.warn(`⚠️ API Rejected request for ${days} days. Status: ${response.status}`);
        }
      } catch (e) {
         console.warn(`⚠️ Network error for ${days} days:`, e.message);
      }
      
      // تأخير لمدة ثانية بين كل طلب لتجنب حظر الخادم (Rate Limiting)
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!isLiveData) {
       reports = {
         1: { sessions: 53, rageClicks: 0, deadClicks: 0, quickBacks: 8 },
         3: { sessions: 79, rageClicks: 0, deadClicks: 0, quickBacks: 11 },
         7: { sessions: 210, rageClicks: 4, deadClicks: 2, quickBacks: 25 }
       };
       console.log("⚠️ Using fallback metrics.");
    }

    const clarityData = {
      is_live_data: isLiveData,
      reports: reports,
      frictionLog: [], 
      jsErrors: []
    };

    fs.writeFileSync('clarity-real-data.json', JSON.stringify(clarityData, null, 2));
    console.log('✅ File clarity-real-data.json updated.');

  } catch (error) {
    console.error('❌ Script Error:', error.message);
  }
}

fetchClarityData();