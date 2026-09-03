// server/api/dashboard.js
export default defineEventHandler(() => {
  // البيانات الوهمية
  const data = [
    { date: '2026-08-21', country: 'United States', device: 'Desktop', type: 'Branded', query: 'qompyl', path: '/', imp: 120, clicks: 15, pos: 1.0 },
    { date: '2026-08-24', country: 'United States', device: 'Desktop', type: 'Branded', query: 'qompyl company', path: '/about', imp: 45, clicks: 0, pos: 4.5 },
    { date: '2026-08-24', country: 'Brazil', device: 'Mobile', type: 'Branded', query: 'qompyl', path: '/', imp: 50, clicks: 6, pos: 1.2 },
    { date: '2026-08-27', country: 'India', device: 'Desktop', type: 'Non-Branded', query: 'trusted by traders', path: '/product', imp: 7, clicks: 0, pos: 12.7 },
    { date: '2026-08-27', country: 'United States', device: 'Mobile', type: 'Non-Branded', query: 'qombol', path: '/', imp: 6, clicks: 0, pos: 15.1 },
    { date: '2026-08-30', country: 'Brazil', device: 'Desktop', type: 'Branded', query: 'qpyl', path: '/careers', imp: 3, clicks: 0, pos: 4.3 },
    { date: '2026-08-30', country: 'United States', device: 'Desktop', type: 'Branded', query: 'qompyl', path: '/team/romina', imp: 10, clicks: 1, pos: 1.0 },
    { date: '2026-08-24', country: 'India', device: 'Mobile', type: 'Non-Branded', query: 'qelp', path: '/terms-of-service', imp: 16, clicks: 1, pos: 18.5 },
  ]

  // حساب إجمالي الـ Impressions
  const totalImpressions = data.reduce((sum, row) => sum + row.imp, 0)

  return {
    totalImpressions: totalImpressions,
    data: data
  }
})