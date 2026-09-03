<template>
  <div class="bento-grid col-12">
    <!-- Impressions Chart -->
    <div class="bento-card col-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="eye" :size="18" />
          Impressions Trend
        </h3>
      </div>
      <div class="chart-container">
        <canvas ref="impChartCanvas"></canvas>
      </div>
    </div>

    <!-- Clicks Chart -->
    <div class="bento-card col-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="mouse-pointer-click" :size="18" />
          Clicks Trend
        </h3>
      </div>
      <div class="chart-container">
        <canvas ref="clicksChartCanvas"></canvas>
      </div>
    </div>

    <!-- Country Chart -->
    <div class="bento-card col-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="globe" :size="18" />
          Top Countries
        </h3>
      </div>
      <div class="chart-container chart-container-large">
        <canvas ref="countryChartCanvas"></canvas>
      </div>
    </div>

    <!-- Device Chart -->
    <div class="bento-card col-6">
      <div class="card-header">
        <h3 class="card-title">
          <Icon name="monitor-smartphone" :size="18" />
          Device Breakdown
        </h3>
      </div>
      <div class="chart-container chart-container-large">
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

const impChartCanvas = ref(null)
const clicksChartCanvas = ref(null)
const countryChartCanvas = ref(null)
const deviceChartCanvas = ref(null)

let charts = {}

function renderCharts() {
  if (!props.chartData) return

  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) chart.destroy()
  })
  charts = {}

  const { dates, impressionsByDate, clicksByDate, countries, impressionsByCountry, ctrByCountry, devices, impressionsByDevice } = props.chartData

  // Impressions Chart
  if (impChartCanvas.value) {
    const ctx = impChartCanvas.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 200)
    gradient.addColorStop(0, 'rgba(0, 217, 207, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 217, 207, 0)')

    charts.imp = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Impressions',
          data: impressionsByDate,
          borderColor: '#00D9CF',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#0b0e14',
          pointBorderColor: '#00D9CF',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          }
        }
      }
    })
  }

  // Clicks Chart
  if (clicksChartCanvas.value) {
    const ctx = clicksChartCanvas.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 200)
    gradient.addColorStop(0, 'rgba(6, 144, 249, 0.4)')
    gradient.addColorStop(1, 'rgba(6, 144, 249, 0)')

    charts.clicks = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Clicks',
          data: clicksByDate,
          borderColor: '#0690F9',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#0b0e14',
          pointBorderColor: '#0690F9',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          }
        }
      }
    })
  }

  // Country Chart
  if (countryChartCanvas.value) {
    const ctx = countryChartCanvas.value.getContext('2d')

    charts.country = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Impressions',
            data: impressionsByCountry,
            backgroundColor: [
              'rgba(0, 217, 207, 0.6)',
              'rgba(245, 77, 166, 0.6)',
              'rgba(6, 144, 249, 0.6)'
            ],
            borderRadius: 6,
            borderSkipped: false,
            order: 1
          },
          {
            type: 'line',
            label: 'CTR %',
            data: ctrByCountry,
            borderColor: '#ffffff',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'y1',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#0b0e14',
            pointBorderWidth: 2,
            pointRadius: 3,
            order: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          }
        }
      }
    })
  }

  // Device Chart
  if (deviceChartCanvas.value) {
    const ctx = deviceChartCanvas.value.getContext('2d')

    charts.device = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: devices,
        datasets: [{
          label: 'Impressions',
          data: impressionsByDevice,
          backgroundColor: [
            'rgba(0, 217, 207, 0.6)',
            'rgba(6, 144, 249, 0.6)'
          ],
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { color: '#5a5f6a', font: { size: 10 } }
          }
        }
      }
    })
  }
}

// Update charts when data changes
watch(() => props.chartData, () => {
  nextTick(() => {
    renderCharts()
  })
}, { deep: true })

// Render on mount
onMounted(() => {
  nextTick(() => {
    renderCharts()
  })
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
  margin-top: auto;
}

.chart-container-large {
  height: 240px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.bento-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bento-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover), var(--shadow-glow);
  background: rgba(255, 255, 255, 0.04);
}

.col-6 {
  grid-column: span 6;
}

.col-12 {
  grid-column: span 12;
}

.card-header {
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px 0;
  letter-spacing: -0.2px;
  color: var(--text-primary);
}

@media (max-width: 900px) {
  .col-6 {
    grid-column: span 12;
  }
}
</style>