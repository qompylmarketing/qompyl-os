<template>
  <div class="bento-grid col-12">
    <!-- Users vs Leads Chart -->
    <div class="bento-card col-8">
      <div class="card-header">
        <h3 class="card-title"><Icon name="trending-up" :size="18" /> Users vs Leads Trend</h3>
      </div>
      <div class="chart-container">
        <canvas ref="trendChartCanvas"></canvas>
      </div>
    </div>

    <!-- New vs Returning Chart -->
    <div class="bento-card col-4">
      <div class="card-header">
        <h3 class="card-title"><Icon name="pie-chart" :size="18" /> New vs Returning</h3>
      </div>
      <div class="chart-container">
        <canvas ref="newRetChartCanvas"></canvas>
      </div>
    </div>

    <!-- Sessions by Channel -->
    <div class="bento-card col-4">
      <div class="card-header">
        <h3 class="card-title"><Icon name="globe" :size="18" /> Sessions by Channel</h3>
      </div>
      <div class="chart-container">
        <canvas ref="channelChartCanvas"></canvas>
      </div>
    </div>

    <!-- Leads by Channel -->
    <div class="bento-card col-4">
      <div class="card-header">
        <h3 class="card-title"><Icon name="bar-chart-2" :size="18" /> Leads by Channel</h3>
      </div>
      <div class="chart-container">
        <canvas ref="leadsBarCanvas"></canvas>
      </div>
    </div>

    <!-- Device Chart -->
    <div class="bento-card col-4">
      <div class="card-header">
        <h3 class="card-title"><Icon name="smartphone" :size="18" /> Device vs Leads</h3>
      </div>
      <div class="chart-container">
        <canvas ref="deviceChartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import Icon from '~/components/Icon.vue'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const trendChartCanvas = ref(null)
const newRetChartCanvas = ref(null)
const channelChartCanvas = ref(null)
const leadsBarCanvas = ref(null)
const deviceChartCanvas = ref(null)

let charts = {}

function renderCharts() {
  if (!props.chartData) return

  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) chart.destroy()
  })
  charts = {}

  const { dates, usersByDate, leadsByDate, channels, sessionsByChannel, leadsByChannel, newReturning, devices, usersByDevice, leadsByDevice } = props.chartData

  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#5a5f6a', font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#5a5f6a', font: { size: 10 } } }
    }
  }

  // Users vs Leads
  if (trendChartCanvas.value) {
    const ctx = trendChartCanvas.value.getContext('2d')
    charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Users', data: usersByDate, borderColor: '#00D9CF', backgroundColor: 'rgba(0,217,207,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
          { label: 'Leads', data: leadsByDate, borderColor: '#F54DA6', borderDash: [5, 5], tension: 0.4, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'end', labels: { color: '#5a5f6a', boxWidth: 10 } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y1: { position: 'right', grid: { display: false } }
        }
      }
    })
  }

  // New vs Returning (Donut)
  if (newRetChartCanvas.value) {
    charts.newRet = new Chart(newRetChartCanvas.value.getContext('2d'), {
      type: 'doughnut',
      data: { labels: ['New', 'Returning'], datasets: [{ data: newReturning, backgroundColor: ['#0690F9', 'rgba(255,255,255,0.1)'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#5a5f6a', boxWidth: 10 } } } }
    })
  }

  // Sessions by Channel (Donut)
  if (channelChartCanvas.value) {
    charts.channel = new Chart(channelChartCanvas.value.getContext('2d'), {
      type: 'doughnut',
      data: { labels: channels, datasets: [{ data: sessionsByChannel, backgroundColor: ['#3b82f6', '#0a66c2', '#10b981', '#f59e0b', 'rgba(255,255,255,0.1)'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { color: '#5a5f6a', boxWidth: 8 } } } }
    })
  }

  // Leads by Channel (Bar)
  if (leadsBarCanvas.value) {
    charts.leadsBar = new Chart(leadsBarCanvas.value.getContext('2d'), {
      type: 'bar',
      data: { labels: channels, datasets: [{ label: 'Leads', data: leadsByChannel, backgroundColor: '#10b981', borderRadius: 4 }] },
      options: { ...commonOptions, plugins: { legend: { display: false } } }
    })
  }

  // Device UX
  if (deviceChartCanvas.value) {
    charts.device = new Chart(deviceChartCanvas.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: devices,
        datasets: [
          { type: 'bar', label: 'Users', data: usersByDevice, backgroundColor: 'rgba(0, 217, 207, 0.6)', borderRadius: 4 },
          { type: 'bar', label: 'Leads', data: leadsByDevice, backgroundColor: 'rgba(245, 77, 166, 0.6)', borderRadius: 4 }
        ]
      },
      options: { ...commonOptions, plugins: { legend: { display: false } } }
    })
  }
}

watch(() => props.chartData, () => { nextTick(() => { renderCharts() }) }, { deep: true })
onMounted(() => { nextTick(() => { renderCharts() }) })
</script>

<style scoped>
/* نفس التنسيقات المشتركة */
.chart-container { position: relative; height: 200px; width: 100%; margin-top: auto; }
.bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
.bento-card { background: var(--bg-card); backdrop-filter: blur(16px); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px 28px; display: flex; flex-direction: column; transition: all 0.4s; }
.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
.card-header { margin-bottom: 20px; }
.card-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-primary); margin: 0; }
@media (max-width: 900px) { .col-4, .col-8 { grid-column: span 12; } }
</style>