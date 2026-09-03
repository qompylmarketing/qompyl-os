// server/utils/filterData.js
export function filterDashboardData(data, filters) {
  const { startDate, endDate, countries, devices, queryTypes } = filters
  
  return data.filter(row => {
    const inDate = (!startDate || row.date >= startDate) && (!endDate || row.date <= endDate)
    const inCountry = countries.includes('all') || countries.includes(row.country)
    const inDevice = devices.includes('all') || devices.includes(row.device)
    const inQuery = queryTypes.includes('all') || queryTypes.includes(row.type)
    return inDate && inCountry && inDevice && inQuery
  })
}