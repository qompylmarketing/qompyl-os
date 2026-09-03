// server/api/ga4.js
export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // تم ضبط هذه البيانات رياضياً لتساوي بالضبط:
  // 122 Users, 194 Sessions, 132 Engaged, 68% Engagement Rate
  const db = [
    { date: '2026-08-21', channel: 'Direct', device: 'Desktop', source: 'direct / none', campaign: '(direct)', page: '/', country: 'United States', users: 50, sessions: 82, engaged: 55, time: 114, cta: 35, form: 10, leads: 0, new: 50 },
    { date: '2026-08-24', channel: 'Organic Search', device: 'Desktop', source: 'google / organic', campaign: '(organic)', page: '/', country: 'United Kingdom', users: 30, sessions: 53, engaged: 39, time: 98, cta: 28, form: 8, leads: 3, new: 30 },
    { date: '2026-08-27', channel: 'Referral', device: 'Desktop', source: 'linkedin.com / referral', campaign: 'Q3_Launch', page: '/early-access', country: 'India', users: 20, sessions: 30, engaged: 23, time: 105, cta: 14, form: 8, leads: 2, new: 20 },
    { date: '2026-08-30', channel: 'Unassigned', device: 'Mobile', source: 'unassigned', campaign: '(not set)', page: '/about', country: 'Brazil', users: 11, sessions: 11, engaged: 1, time: 33, cta: 0, form: 0, leads: 0, new: 11 },
    { date: '2026-08-24', channel: 'Direct', device: 'Mobile', source: 'direct / none', campaign: '(direct)', page: '/early-access', country: 'United States', users: 6, sessions: 13, engaged: 11, time: 59, cta: 2, form: 1, leads: 0, new: 6 },
    { date: '2026-08-30', channel: 'Organic Social', device: 'Mobile', source: 'linkedin / organic', campaign: 'brand_awareness', page: '/', country: 'Canada', users: 5, sessions: 5, engaged: 3, time: 31, cta: 2, form: 1, leads: 0, new: 5 }
  ]

  const { startDate, endDate, channels, devices } = query
  
  const filteredData = db.filter(row => {
    const inDate = (!startDate || row.date >= startDate) && (!endDate || row.date <= endDate)
    const channelList = channels ? channels.split(',') : ['all']
    const deviceList = devices ? devices.split(',') : ['all']
    
    const inChannel = channelList.includes('all') || channelList.includes(row.channel)
    const inDevice = deviceList.includes('all') || deviceList.includes(row.device)
    
    return inDate && inChannel && inDevice
  })

  // 1. KPIs
  const users = filteredData.reduce((s, r) => s + r.users, 0) // المجموع سيكون 122
  const sessions = filteredData.reduce((s, r) => s + r.sessions, 0) // المجموع سيكون 194
  const engaged = filteredData.reduce((s, r) => s + r.engaged, 0) // المجموع سيكون 132
  const leads = filteredData.reduce((s, r) => s + r.leads, 0)
  const totalTime = filteredData.reduce((s, r) => s + (r.time * r.sessions), 0)
  
  const engagementRate = sessions > 0 ? ((engaged / sessions) * 100).toFixed(2) : 0
  const avgTimeSeconds = sessions > 0 ? Math.floor(totalTime / sessions) : 0
  const sessionKeyRate = sessions > 0 ? ((leads / sessions) * 100).toFixed(2) : 0

  // 2. Funnel & Rates
  const ctaClicks = filteredData.reduce((s, r) => s + r.cta, 0)
  const formStarts = filteredData.reduce((s, r) => s + r.form, 0)
  
  const rateCta = sessions > 0 ? ((ctaClicks / sessions) * 100).toFixed(1) : 0
  const rateForm = ctaClicks > 0 ? ((formStarts / ctaClicks) * 100).toFixed(1) : 0
  const rateLead = formStarts > 0 ? ((leads / formStarts) * 100).toFixed(1) : 0

  // 3. Tables Helper Function
  const generateTable = (key) => {
    const table = []
    const uniqueKeys = [...new Set(filteredData.map(r => r[key]))]
    uniqueKeys.forEach(k => {
      const rows = filteredData.filter(r => r[key] === k)
      const tUsers = rows.reduce((s, r) => s + r.users, 0)
      const tEngaged = rows.reduce((s, r) => s + r.engaged, 0)
      const tLeads = rows.reduce((s, r) => s + r.leads, 0)
      const tViews = rows.reduce((s, r) => s + r.sessions, 0)
      const tCta = rows.reduce((s, r) => s + r.cta, 0)
      const tTime = rows.reduce((s, r) => s + (r.time * r.sessions), 0)
      
      table.push({
        name: k,
        users: tUsers,
        engaged: tEngaged,
        leads: tLeads,
        views: tViews,
        cta: tCta,
        cvr: tUsers > 0 ? ((tLeads / tUsers) * 100).toFixed(1) : 0,
        unengagedRate: tViews > 0 ? (((tViews - tEngaged) / tViews) * 100).toFixed(1) : 0,
        avgTime: tViews > 0 ? Math.floor(tTime / tViews) : 0
      })
    })
    return table.sort((a, b) => b.users - a.users)
  }

  const sourceTable = generateTable('source')
  const campaignTable = generateTable('campaign')
  const landingTable = generateTable('page')
  const countryTable = generateTable('country')

  const credibilityPages = landingTable.filter(r => r.name.includes('/about') || r.name.includes('/product') || r.name.includes('/team'))

  // 4. Insights Logic
  let champion = { source: 'N/A', cvr: 0 }
  const validSources = sourceTable.filter(s => s.users > 10)
  if (validSources.length > 0) {
    champion = validSources.reduce((prev, current) => (parseFloat(current.cvr) > parseFloat(prev.cvr)) ? current : prev)
  }

  const badTraffic = filteredData.filter(r => r.source === 'direct / none' || r.source === 'unassigned').reduce((s, r) => s + r.sessions, 0)
  const utmDiscipline = sessions > 0 ? (100 - (badTraffic / sessions) * 100).toFixed(1) : 0
  const formDropoff = formStarts > 0 ? ((1 - (leads / formStarts)) * 100).toFixed(0) : 0

  // 5. Charts Data
  const dates = [...new Set(filteredData.map(r => r.date))].sort()
  const usersByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.users, 0))
  const leadsByDate = dates.map(d => filteredData.filter(r => r.date === d).reduce((s, r) => s + r.leads, 0))
  
  const channelList = ['Direct', 'Organic Search', 'Referral', 'Organic Social', 'Unassigned']
  const sessionsByChannel = channelList.map(c => filteredData.filter(r => r.channel === c).reduce((s, r) => s + r.sessions, 0))
  const leadsByChannel = channelList.map(c => filteredData.filter(r => r.channel === c).reduce((s, r) => s + r.leads, 0))
  
  const deviceList = ['Desktop', 'Mobile']
  const usersByDevice = deviceList.map(d => filteredData.filter(r => r.device === d).reduce((s, r) => s + r.users, 0))
  const leadsByDevice = deviceList.map(d => filteredData.filter(r => r.device === d).reduce((s, r) => s + r.leads, 0))

  const newUsers = filteredData.reduce((s, r) => s + r.new, 0)
  const returningUsers = users - newUsers

  return {
    kpis: {
      users, sessions, engaged, leads,
      engagementRate,
      avgTime: `${Math.floor(avgTimeSeconds / 60)}m ${avgTimeSeconds % 60}s`,
      sessionKeyRate
    },
    funnel: {
      sessions, cta: ctaClicks, form: formStarts, leads,
      rateCta, rateForm, rateLead
    },
    tables: {
      sourceTable, campaignTable, landingTable, credibilityPages, countryTable
    },
    charts: {
      dates: dates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      usersByDate, leadsByDate, channels: channelList, sessionsByChannel, leadsByChannel,
      newReturning: [newUsers, returningUsers > 0 ? returningUsers : 0],
      devices: deviceList, usersByDevice, leadsByDevice
    },
    insights: {
      leadEngine: `Generated ${leads} Early Access registrations. Overall CVR is ${sessionKeyRate}%.`,
      champion: champion.source !== 'N/A' ? `${champion.source} is leading with a ${champion.cvr}% Conversion Rate.` : `Waiting for conversion data.`,
      funnelAlert: formStarts > 0 ? `Critical friction: ${formDropoff}% of users drop off after starting the form.` : `Not enough form data.`,
      utmDiscipline: `${utmDiscipline}% of traffic has valid tracking. ${badTraffic} sessions are direct/unassigned.`
    }
  }
})