// server/api/clarity.js
// 🚀 استيراد البيانات الحقيقية من ملف JSON مباشرة لدعم بيئة Vercel
import realData from '../../clarity-real-data.json'

export default defineEventHandler((event) => {
  
 // في ملف server/api/clarity.js
// استبدل كائن safeReports بالكامل بهذا الكود:

  const safeReports = {
    '1': realData.reports?.['1'] || { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 },
    '3': realData.reports?.['3'] || { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 },
    '7': realData.reports?.['7'] || { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 },
    '14': realData.reports?.['14'] || { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 },
    '30': realData.reports?.['30'] || { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 }
  };

  // 2. الجداول السفلية (كما اتفقنا، هذه بيانات ثابتة للتصميم حالياً لحين ربطها بـ Supabase)
  const frictionLog = [
    { path: '/', element: 'Hero Slider', rage: 85, dead: 120 },
    { path: '/pricing', element: 'FAQ Accordion', rage: 64, dead: 15 },
    { path: '/early-access', element: 'Submit Button', rage: 42, dead: 88 }
  ];

  const jsErrors = [
    { message: 'Uncaught TypeError: Cannot read property "length" of undefined', count: 342, path: '/early-access' },
    { message: 'ReferenceError: gtag is not defined', count: 185, path: '/product' },
    { message: 'NetworkError: Failed to fetch API resource', count: 56, path: '/checkout' }
  ];

  const worstRageElement = [...frictionLog].sort((a, b) => b.rage - a.rage)[0]
  const worstDeadElement = [...frictionLog].sort((a, b) => b.dead - a.dead)[0]

  // 3. بناء الكائن النهائي المرسل للواجهة الأمامية
  return {
    is_live_data: realData.is_live_data,
    reports: safeReports, // 🚀 تمرير التقرير الآمن الذي يحتوي على الفترات الثلاث
    insights: {
      rageAlert: `Highest friction element: "${worstRageElement.element}" on the ${worstRageElement.path} page (${worstRageElement.rage} rage clicks).`,
      deadAlert: `Critical UX flaw: "${worstDeadElement.element}" on the ${worstDeadElement.path} page is registering high dead clicks.`,
      watchlist: `Hand-picked session recordings flagged for immediate review.`
    },
    frictionLog,
    jsErrors
  }
})