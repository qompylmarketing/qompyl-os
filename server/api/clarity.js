// server/api/clarity.js
import fs from 'fs'
import path from 'path'

export default defineEventHandler((event) => {
  const filePath = path.resolve(process.cwd(), 'clarity-real-data.json')
  let realData = null
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    realData = JSON.parse(rawData)
  } catch (e) {
    return { error: 'Clarity Data file not found. Run fetch-clarity.js first.' }
  }

  // الجداول السفلية (كما اتفقنا، هذه بيانات ثابتة للتصميم حالياً لحين ربطها بـ Supabase)
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

  const worstRageElement = frictionLog.sort((a, b) => b.rage - a.rage)[0]
  const worstDeadElement = frictionLog.sort((a, b) => b.dead - a.dead)[0]

  return {
    is_live_data: realData.is_live_data,
    reports: realData.reports, // 🚀 تمرير التقرير الذي يحتوي على الفترات الثلاث
    insights: {
      rageAlert: `Highest friction element: "${worstRageElement.element}" on the ${worstRageElement.path} page (${worstRageElement.rage} rage clicks).`,
      deadAlert: `Critical UX flaw: "${worstDeadElement.element}" on the ${worstDeadElement.path} page is registering high dead clicks.`,
      watchlist: `Hand-picked session recordings flagged for immediate review.`
    },
    frictionLog,
    jsErrors
  }
})