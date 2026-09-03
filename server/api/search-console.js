import fs from 'fs'
import path from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // 1. قراءة البيانات الحقيقية من الملف الذي استخرجه السكريبت
  const filePath = path.resolve(process.cwd(), 'gsc-real-data.json')
  let realData = null
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    realData = JSON.parse(rawData)
  } catch (e) {
    return { error: 'GSC Data file not found. Run fetch-gsc.js first.' }
  }

  // 2. استخدام البيانات الحقيقية المفصلة بدلاً من المصفوفة الوهمية
  const db = realData.detailedRows || []

  // 3. تطبيق الفلاتر القادمة من الواجهة (Query Parameters)
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

  // 4. الحسابات الأساسية للكروت العلوية
  const totalImp = filteredData.reduce((s, r) => s + r.imp, 0)
  const totalClicks = filteredData.reduce((s, r) => s + r.clicks, 0)
  const avgCtr = totalImp > 0 ? ((totalClicks / totalImp) * 100).toFixed(1) : 0
  
  // حساب متوسط المركز (المركز * مرات الظهور / إجمالي الظهور)
  const totalImpPos = filteredData.reduce((s, r) => s + (r.pos * r.imp), 0)
  const avgPos = totalImp > 0 ? (totalImpPos / totalImp).toFixed(1) : 0

  // 5. حسابات الكلمات المرتبطة بالعلامة التجارية (Branded)
  const brandedData = filteredData.filter(r => r.type === 'Branded')
  const brandImp = brandedData.reduce((s, r) => s + r.imp, 0)
  const brandClicks = brandedData.reduce((s, r) => s + r.clicks, 0)
  const brandCtr = brandImp > 0 ? ((brandClicks / brandImp) * 100).toFixed(1) : 0
  const brandPosCalc = brandedData.reduce((s, r) => s + (r.pos * r.imp), 0)
  const brandPos = brandImp > 0 ? (brandPosCalc / brandImp).toFixed(1) : 0

  // 6. فرص النمو (كلمات في الصفحة الثانية: المراكز من 11 لـ 20)
  const opportunities = filteredData.filter(r => r.pos >= 11 && r.pos <= 20 && r.type === 'Non-Branded')

  // 7. تجهيز الرسوم البيانية (استخراج بيانات ديناميكية بالكامل)
  const dates = [...new Set(filteredData.map(r => r.date))].sort()
  const impByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.imp, 0))
  const clicksByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.clicks, 0))

  // استخراج قائمة الدول الحقيقية الموجودة في الداتا (بدل كتابتها يدوياً)
  const countryList = [...new Set(filteredData.map(r => r.country))]
  const impByCountry = countryList.map(c => filteredData.filter(r => r.country === c).reduce((s, r) => s + r.imp, 0))
  const clicksByCountry = countryList.map(c => filteredData.filter(r => r.country === c).reduce((s, r) => s + r.clicks, 0))
  const ctrByCountry = countryList.map((c, i) => impByCountry[i] > 0 ? +((clicksByCountry[i] / impByCountry[i]) * 100).toFixed(1) : 0)

  // استخراج قائمة الأجهزة الحقيقية
  const deviceList = [...new Set(filteredData.map(r => r.device))]
  const impByDevice = deviceList.map(d => filteredData.filter(r => r.device === d).reduce((s, r) => s + r.imp, 0))

  return {
    filteredData,
    summary: {
      totalImpressions: totalImp,
      totalClicks: totalClicks,
      averageCtr: avgCtr,
      averagePosition: avgPos
    },
    brand: {
      impressions: brandImp,
      clicks: brandClicks,
      ctr: brandCtr,
      position: brandPos,
      hasData: brandImp > 0
    },
    opportunities: {
      count: opportunities.length,
      data: opportunities
    },
    charts: {
      dates: dates.map(d => {
        const dateObj = new Date(d + 'T00:00:00')
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      impressionsByDate: impByDate,
      clicksByDate: clicksByDate,
      countries: countryList, // سيتم رسم الدونتشارت بناءً على الدول الحقيقية
      impressionsByCountry: impByCountry,
      ctrByCountry: ctrByCountry,
      devices: deviceList,
      impressionsByDevice: impByDevice
    },
    insightTexts: {
      indexing: totalImp > 0 ? 
        `Secured ${totalImp} impressions and ${totalClicks} clicks in the selected period. Google is actively crawling the platform.` :
        `No impressions recorded in the selected period. Check the date range or indexing status.`,
      brand: brandImp > 0 ?
        `Your branded queries generated ${brandImp} impressions with an average position of ${brandPos} and a CTR of ${brandCtr}%.` :
        `No branded searches detected in this timeframe based on your current filters.`,
      opportunities: opportunities.length > 0 ?
        `Found ${opportunities.length} non-branded queries ranking on page 2. Optimize landing pages to push these queries to page one.` :
        `No page 2 opportunities found in the current selection. Expand your date range or target new keywords.`
    }
  }
})