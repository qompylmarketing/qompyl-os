// server/api/search-console.js
// 🚀 استيراد البيانات الحقيقية مباشرة ليتم دمجها في Vercel
import realData from '../../gsc-real-data.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // لا نحتاج لـ fs بعد الآن، البيانات جاهزة في المتغير realData
  const db = realData.detailedRows || []

  // تطبيق الفلاتر
  const { startDate, endDate, countries, devices, queryTypes } = query
  
  const filteredData = db.filter(row => {
    const inDate = (!startDate || row.date >= startDate) && (!endDate || row.date <= endDate)
    const countryList = countries ? countries.split(',') : ['all']
    const deviceList = devices ? devices.split(',') : ['all']
    const queryList = queryTypes ? queryTypes.split(',') : ['all']
    
    const inCountry = countryList.includes('all') || countryList.includes(row.country)
    const inDevice = deviceList.includes('all') || deviceList.includes(row.device)
    const inQuery = queryList.includes('all') || queryList.includes(row.type)
    
    return inDate && inCountry && inDevice && inQuery
  })

  // الحسابات الأساسية للكروت العلوية
  const totalImp = filteredData.reduce((s, r) => s + r.imp, 0)
  const totalClicks = filteredData.reduce((s, r) => s + r.clicks, 0)
  const avgCtr = totalImp > 0 ? ((totalClicks / totalImp) * 100).toFixed(1) : 0
  
  const totalImpPos = filteredData.reduce((s, r) => s + (r.pos * r.imp), 0)
  const avgPos = totalImp > 0 ? (totalImpPos / totalImp).toFixed(1) : 0

  // حسابات الـ Branded
  const brandedData = filteredData.filter(r => r.type === 'Branded')
  const brandImp = brandedData.reduce((s, r) => s + r.imp, 0)
  const brandClicks = brandedData.reduce((s, r) => s + r.clicks, 0)
  const brandCtr = brandImp > 0 ? ((brandClicks / brandImp) * 100).toFixed(1) : 0
  const brandPosCalc = brandedData.reduce((s, r) => s + (r.pos * r.imp), 0)
  const brandPos = brandImp > 0 ? (brandPosCalc / brandImp).toFixed(1) : 0

  // فرص النمو
  const opportunities = filteredData.filter(r => r.pos >= 11 && r.pos <= 20 && r.type === 'Non-Branded')

  // تجهيز الرسوم البيانية
  const dates = [...new Set(filteredData.map(r => r.date))].sort()
  const impByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.imp, 0))
  const clicksByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.clicks, 0))

  const countryList = [...new Set(filteredData.map(r => r.country))]
  const impByCountry = countryList.map(c => filteredData.filter(r => r.country === c).reduce((s, r) => s + r.imp, 0))
  const clicksByCountry = countryList.map(c => filteredData.filter(r => r.country === c).reduce((s, r) => s + r.clicks, 0))
  const ctrByCountry = countryList.map((c, i) => impByCountry[i] > 0 ? +((clicksByCountry[i] / impByCountry[i]) * 100).toFixed(1) : 0)

  const deviceList = [...new Set(filteredData.map(r => r.device))]
  const impByDevice = deviceList.map(d => filteredData.filter(r => r.device === d).reduce((s, r) => s + r.imp, 0))

  return {
    filteredData,
    summary: { totalImpressions: totalImp, totalClicks: totalClicks, averageCtr: avgCtr, averagePosition: avgPos },
    brand: { impressions: brandImp, clicks: brandClicks, ctr: brandCtr, position: brandPos, hasData: brandImp > 0 },
    opportunities: { count: opportunities.length, data: opportunities },
    charts: {
      dates: dates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      impressionsByDate: impByDate, clicksByDate: clicksByDate,
      countries: countryList, impressionsByCountry: impByCountry, ctrByCountry: ctrByCountry,
      devices: deviceList, impressionsByDevice: impByDevice
    },
    insightTexts: {
      indexing: totalImp > 0 ? `Secured ${totalImp} impressions and ${totalClicks} clicks.` : `No data recorded.`,
      brand: brandImp > 0 ? `Branded queries generated ${brandImp} impressions.` : `No branded searches detected.`,
      opportunities: opportunities.length > 0 ? `Found ${opportunities.length} non-branded queries on page 2.` : `No page 2 opportunities found.`
    }
  }
})