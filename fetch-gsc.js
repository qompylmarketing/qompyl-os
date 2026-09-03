import fs from 'fs'
import path from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const filePath = path.resolve(process.cwd(), 'gsc-real-data.json')
  let realData = null
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    realData = JSON.parse(rawData)
  } catch (e) {
    return { error: 'GSC Data file not found. Run fetch-gsc.js first.' }
  }

  const db = realData.detailedRows || []
  const accurateTotalsDb = realData.accurateTotals || []
  const { startDate, endDate, countries, devices, queryTypes } = query
  
  // 1. فلترة البيانات التفصيلية
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

  // ترتيب البيانات من الأكبر للأصغر بناءً على عدد مرات الظهور
  const sortedData = [...filteredData].sort((a, b) => b.imp - a.imp)

  // 2. سحب الأرقام الدقيقة 100% (تطابق الشاشة الرسمية)
  const dateFilteredTotals = accurateTotalsDb.filter(r => {
    const rowDate = r.keys[0]; 
    return (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate);
  })

  let totalImp = 0, totalClicks = 0, avgCtr = 0, avgPos = 0;
  const hasDimensionFilters = (countries && countries !== 'all') || (devices && devices !== 'all') || (queryTypes && queryTypes !== 'all');

  // إذا لم يقم المستخدم بتحديد دولة أو جهاز معين، نعرض الأرقام الدقيقة جداً متضمنة الكلمات المجهولة
  if (!hasDimensionFilters && dateFilteredTotals.length > 0) {
    totalImp = dateFilteredTotals.reduce((s, r) => s + r.impressions, 0)
    totalClicks = dateFilteredTotals.reduce((s, r) => s + r.clicks, 0)
    avgCtr = totalImp > 0 ? ((totalClicks / totalImp) * 100).toFixed(1) : 0
    const totalImpPos = dateFilteredTotals.reduce((s, r) => s + (r.position * r.impressions), 0)
    avgPos = totalImp > 0 ? (totalImpPos / totalImp).toFixed(1) : 0
  } else {
    // خلاف ذلك نعتمد على البيانات المفلترة
    totalImp = sortedData.reduce((s, r) => s + r.imp, 0)
    totalClicks = sortedData.reduce((s, r) => s + r.clicks, 0)
    avgCtr = totalImp > 0 ? ((totalClicks / totalImp) * 100).toFixed(1) : 0
    const totalImpPos = sortedData.reduce((s, r) => s + (r.pos * r.imp), 0)
    avgPos = totalImp > 0 ? (totalImpPos / totalImp).toFixed(1) : 0
  }

  const brandedData = sortedData.filter(r => r.type === 'Branded')
  const brandImp = brandedData.reduce((s, r) => s + r.imp, 0)
  const brandClicks = brandedData.reduce((s, r) => s + r.clicks, 0)
  const brandCtr = brandImp > 0 ? ((brandClicks / brandImp) * 100).toFixed(1) : 0
  const brandPosCalc = brandedData.reduce((s, r) => s + (r.pos * r.imp), 0)
  const brandPos = brandImp > 0 ? (brandPosCalc / brandImp).toFixed(1) : 0

  const opportunities = sortedData.filter(r => r.pos >= 11 && r.pos <= 20 && r.type === 'Non-Branded')

  const dates = [...new Set(sortedData.map(r => r.date))].sort()
  const impByDate = dates.map(d => sortedData.filter(r => r.date === d).reduce((s, r) => s + r.imp, 0))
  const clicksByDate = dates.map(d => sortedData.filter(r => r.date === d).reduce((s, r) => s + r.clicks, 0))

  const countryList = [...new Set(sortedData.map(r => r.country))]
  const impByCountry = countryList.map(c => sortedData.filter(r => r.country === c).reduce((s, r) => s + r.imp, 0))
  const clicksByCountry = countryList.map(c => sortedData.filter(r => r.country === c).reduce((s, r) => s + r.clicks, 0))
  const ctrByCountry = countryList.map((c, i) => impByCountry[i] > 0 ? +((clicksByCountry[i] / impByCountry[i]) * 100).toFixed(1) : 0)

  const deviceList = [...new Set(sortedData.map(r => r.device))]
  const impByDevice = deviceList.map(d => sortedData.filter(r => r.device === d).reduce((s, r) => s + r.imp, 0))

  return {
    filteredData: sortedData, // نرسل البيانات مرتبة
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
      indexing: totalImp > 0 ? `Secured ${totalImp} impressions and ${totalClicks} clicks in the selected period. Google is actively crawling the platform.` : `No impressions recorded in the selected period.`,
      brand: brandImp > 0 ? `Your branded queries generated ${brandImp} impressions with an avg position of ${brandPos} and a CTR of ${brandCtr}%.` : `No branded searches detected in this timeframe.`,
      opportunities: opportunities.length > 0 ? `Found ${opportunities.length} non-branded queries ranking on page 2. Optimize landing pages to push these queries to page one.` : `No page 2 opportunities found.`
    }
  }
})