<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="line-chart" :size="24" style="color: var(--teal-normal);" /> Growth & Conversion</h1>
        <p>{{ periodLabel }}</p>
        <div class="last-updated" :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
           <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" /> GA4 API sync: {{ loading ? 'Syncing...' : 'Just now' }}
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-group" :class="{ 'disabled-filters': loading }">
        <div class="date-range-control">
          <Icon name="calendar" :size="14" />
          <input type="date" v-model="filters.startDate" @change="applyFilters">
          <span class="date-arrow">→</span>
          <input type="date" v-model="filters.endDate" @change="applyFilters">
        </div>
        <div class="filter-dropdown" ref="channelDropdown">
          <div class="filter-trigger" @click="toggleDropdown('channel')">
            <Icon name="globe" :size="14" />
            <span class="trigger-label">{{ channelLabel }}</span>
            <span class="trigger-badge">{{ channelBadge }}</span>
            <Icon name="chevron-down" class="chevron" :class="{ open: openDropdown === 'channel' }" :size="14" />
          </div>
          <div class="dropdown-menu" :class="{ open: openDropdown === 'channel' }">
            <div class="menu-label">Channels</div>
            <div v-for="ch in channelOptions" :key="ch.value" class="checkbox-item" :class="{ checked: isChannelChecked(ch.value) }" @click="toggleChannel(ch.value)">
              <span class="custom-check"><Icon name="check" :size="12" /></span><span class="item-label">{{ ch.label }}</span>
            </div>
          </div>
        </div>
        <div class="filter-dropdown" ref="deviceDropdown">
          <div class="filter-trigger" @click="toggleDropdown('device')">
            <Icon name="smartphone" :size="14" />
            <span class="trigger-label">{{ deviceLabel }}</span>
            <span class="trigger-badge">{{ deviceBadge }}</span>
            <Icon name="chevron-down" class="chevron" :class="{ open: openDropdown === 'device' }" :size="14" />
          </div>
          <div class="dropdown-menu" :class="{ open: openDropdown === 'device' }">
            <div class="menu-label">Devices</div>
            <div v-for="dev in deviceOptions" :key="dev.value" class="checkbox-item" :class="{ checked: isDeviceChecked(dev.value) }" @click="toggleDevice(dev.value)">
              <span class="custom-check"><Icon name="check" :size="12" /></span><span class="item-label">{{ dev.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 🌟 Skeleton Loading State (Enterprise UX) -->
    <div v-if="loading" class="bento-grid">
      <div v-for="i in 4" :key="'sk-kpi-'+i" class="bento-card col-3 skeleton-card">
        <div class="sk-title"></div>
        <div class="sk-value"></div>
      </div>
      <div v-for="i in 4" :key="'sk-ins-'+i" class="bento-card col-3 skeleton-card insight-sk">
        <div class="sk-icon"></div>
        <div class="sk-title" style="width: 60%;"></div>
        <div class="sk-text" style="width: 90%;"></div>
        <div class="sk-text" style="width: 70%;"></div>
      </div>
      <div class="bento-card col-12 skeleton-card" style="height: 180px;"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="data" class="bento-grid fade-in">
      
      <!-- KPIs Scorecards -->
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Active Users</span>
        <div class="score-main">
          <p class="score-value">{{ data.kpis.users }}</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Baseline Month 1</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Engaged Sessions</span>
        <div class="score-main">
          <p class="score-value">{{ data.kpis.engaged }}</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Baseline Month 1</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Engagement Rate</span>
        <div class="score-main">
          <p class="score-value">{{ data.kpis.engagementRate }}%</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Baseline Month 1</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Avg. Time</span>
        <div class="score-main">
          <p class="score-value">{{ data.kpis.avgTime }}</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Baseline Month 1</span>
        </div>
      </div>

      <!-- 4 Insights Cards -->
      <div class="bento-card col-3 insight-card">
        <div class="insight-icon icon-teal"><Icon name="zap" :size="20" /></div>
        <h3 class="insight-title">Lead Engine</h3>
        <p class="insight-desc">{{ data.insights.leadEngine }}</p>
      </div>
      <div class="bento-card col-3 insight-card">
        <div class="insight-icon icon-blue"><Icon name="award" :size="20" /></div>
        <h3 class="insight-title">Champion Channel</h3>
        <p class="insight-desc">{{ data.insights.champion }}</p>
      </div>
      <div class="bento-card col-3 insight-card">
        <div class="insight-icon icon-purple"><Icon name="shield-check" :size="20" /></div>
        <h3 class="insight-title">UTM Discipline</h3>
        <p class="insight-desc">{{ data.insights.utmDiscipline }}</p>
      </div>
      <div class="bento-card col-3 insight-card">
        <div class="insight-icon icon-pink"><Icon name="alert-triangle" :size="20" /></div>
        <h3 class="insight-title">Funnel Alert</h3>
        <p class="insight-desc">{{ data.insights.funnelAlert }}</p>
      </div>

      <!-- Funnel Block with Percentages -->
      <div class="bento-card col-12">
        <div class="card-header">
          <h3 class="card-title"><Icon name="funnel" :size="18" /> Conversion Funnel</h3>
          <p class="card-desc">Sessions → cta_click → form_start → generate_lead</p>
        </div>
        <div class="funnel-container">
          <div class="funnel-step">
            <div class="step-value">{{ data.funnel.sessions }}</div>
            <div class="step-label">Sessions</div>
          </div>
          <div class="funnel-connector">
             <span class="funnel-rate">{{ data.funnel.rateCta }}%</span>
             <span class="funnel-arrow">→</span>
          </div>
          <div class="funnel-step">
            <div class="step-value">{{ data.funnel.cta }}</div>
            <div class="step-label">cta_click</div>
          </div>
          <div class="funnel-connector">
             <span class="funnel-rate">{{ data.funnel.rateForm }}%</span>
             <span class="funnel-arrow">→</span>
          </div>
          <div class="funnel-step">
            <div class="step-value">{{ data.funnel.form }}</div>
            <div class="step-label">form_start</div>
          </div>
          <div class="funnel-connector">
             <span class="funnel-rate">{{ data.funnel.rateLead }}%</span>
             <span class="funnel-arrow">→</span>
          </div>
          <div class="funnel-step highlight-step">
            <div class="step-value">{{ data.funnel.leads }}</div>
            <div class="step-label">generate_lead</div>
          </div>
        </div>
      </div>

      <!-- GA4 Charts Component -->
      <GA4Charts :chart-data="data.charts" />

      <!-- TABLES SECTION -->
      
      <!-- 1. Source / Medium (Full Width) -->
      <div class="bento-card col-6 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="layout" :size="18" /> Source / Medium Performance</h3>
          <p class="card-desc">Acquisition metrics combined with conversion rates.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Source / Medium</th><th class="num-col">Users</th><th class="num-col">Engaged</th><th class="num-col">Leads</th><th class="num-col">CVR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.tables.sourceTable" :key="row.name">
              <td style="color:#fff; font-weight: 500;">{{ row.name }}</td>
              <td class="num-col">{{ row.users }}</td>
              <td class="num-col">{{ row.engaged }}</td>
              <td class="num-col" :style="{ color: row.leads > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.leads }}</td>
              <td class="num-col"><span class="badge" :class="{ muted: row.cvr == 0 }">{{ row.cvr }}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. Campaigns UTM (Half Width) -->
      <div class="bento-card col-6 table-container" style="align-self: start;">
        <div class="card-header">
          <h3 class="card-title"><Icon name="tag" :size="18" /> Campaigns (UTM)</h3>
          <p class="card-desc">Campaign level performance and conversions.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Campaign</th><th class="num-col">Users</th><th class="num-col">Engaged</th><th class="num-col">Leads</th><th class="num-col">CVR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.tables.campaignTable" :key="row.name">
              <td style="color:#fff; font-weight: 500;">{{ row.name }}</td>
              <td class="num-col">{{ row.users }}</td>
              <td class="num-col">{{ row.engaged }}</td>
              <td class="num-col" :style="{ color: row.leads > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.leads }}</td>
              <td class="num-col"><span class="badge" :class="{ muted: row.cvr == 0 }">{{ row.cvr }}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Landing Pages (Half Width) -->
      <div class="bento-card col-6 table-container" style="align-self: start;">
        <div class="card-header">
          <h3 class="card-title"><Icon name="file-text" :size="18" /> Landing Pages</h3>
          <p class="card-desc">Where traffic lands vs where it converts.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Page Path</th><th class="num-col">Views</th><th class="num-col">Unengaged %</th><th class="num-col">Leads</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.tables.landingTable" :key="row.name">
              <td style="color:#fff; font-family: var(--font-mono)">{{ row.name }}</td>
              <td class="num-col">{{ row.views }}</td>
              <td class="num-col">{{ row.unengagedRate }}%</td>
              <td class="num-col" :style="{ color: row.leads > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.leads }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 4. Top Countries (Half Width) -->
      <div class="bento-card col-6 table-container" style="align-self: start;">
        <div class="card-header">
          <h3 class="card-title"><Icon name="map-pin" :size="18" /> Top Countries</h3>
          <p class="card-desc">User distribution by region.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Country</th><th class="num-col">Users</th><th class="num-col">Leads</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.tables.countryTable.slice(0,5)" :key="row.name">
              <td style="color:#fff; font-weight: 500;">{{ row.name }}</td>
              <td class="num-col">{{ row.users }}</td>
              <td class="num-col" :style="{ color: row.leads > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.leads }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GA4Charts from '~/components/GA4Charts.vue'
import Icon from '~/components/Icon.vue'

const data = ref(null)
const loading = ref(true)
const openDropdown = ref(null)

const filters = ref({
  startDate: '2026-08-01', endDate: '2026-08-31', channels: ['all'], devices: ['all']
})

const channelOptions = [
  { value: 'all', label: 'All Channels' }, { value: 'Direct', label: 'Direct' },
  { value: 'Organic Search', label: 'Organic Search' }, { value: 'Referral', label: 'Referral' },
  { value: 'Organic Social', label: 'Organic Social' }, { value: 'Unassigned', label: 'Unassigned' }
]

const deviceOptions = [
  { value: 'all', label: 'All Devices' }, { value: 'Desktop', label: 'Desktop' }, { value: 'Mobile', label: 'Mobile' }
]

const periodLabel = computed(() => {
  if (!filters.value.startDate || !filters.value.endDate) return ''
  const s = new Date(filters.value.startDate + 'T00:00:00')
  const e = new Date(filters.value.endDate + 'T00:00:00')
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

const channelLabel = computed(() => {
  const selected = filters.value.channels.filter(c => c !== 'all')
  return selected.length === 0 || filters.value.channels.includes('all') ? 'All Channels' : selected.join(', ')
})
const channelBadge = computed(() => filters.value.channels.includes('all') ? '0' : filters.value.channels.filter(c => c !== 'all').length.toString())

const deviceLabel = computed(() => {
  const selected = filters.value.devices.filter(d => d !== 'all')
  return selected.length === 0 || filters.value.devices.includes('all') ? 'All Devices' : selected.join(', ')
})
const deviceBadge = computed(() => filters.value.devices.includes('all') ? '0' : filters.value.devices.filter(d => d !== 'all').length.toString())

function toggleDropdown(type) { openDropdown.value = openDropdown.value === type ? null : type }
function isChannelChecked(val) { return filters.value.channels.includes(val) }
function isDeviceChecked(val) { return filters.value.devices.includes(val) }

function toggleChannel(value) {
  if (value === 'all') filters.value.channels = ['all']
  else {
    const idx = filters.value.channels.indexOf(value)
    if (idx > -1) filters.value.channels.splice(idx, 1)
    else { filters.value.channels = filters.value.channels.filter(c => c !== 'all'); filters.value.channels.push(value) }
    if (filters.value.channels.length === 0) filters.value.channels = ['all']
  }
  applyFilters()
}

function toggleDevice(value) {
  if (value === 'all') filters.value.devices = ['all']
  else {
    const idx = filters.value.devices.indexOf(value)
    if (idx > -1) filters.value.devices.splice(idx, 1)
    else { filters.value.devices = filters.value.devices.filter(d => d !== 'all'); filters.value.devices.push(value) }
    if (filters.value.devices.length === 0) filters.value.devices = ['all']
  }
  applyFilters()
}

async function applyFilters() {
  loading.value = true; openDropdown.value = null
  try {
    const response = await $fetch('/api/ga4', {
      params: { startDate: filters.value.startDate, endDate: filters.value.endDate, channels: filters.value.channels.join(','), devices: filters.value.devices.join(',') }
    })
    data.value = response
  } catch (error) { console.error(error) } finally { loading.value = false }
}

function handleClickOutside(e) { if (!e.target.closest('.filter-dropdown')) openDropdown.value = null }
onMounted(() => { document.addEventListener('click', handleClickOutside); applyFilters() })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css'; 

/* UX Enhancements */
.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.disabled-filters { opacity: 0.5; pointer-events: none; transition: opacity 0.3s ease; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Skeleton Loader Styles */
.skeleton-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  display: flex; flex-direction: column; gap: 16px;
  animation: pulseSk 1.5s infinite ease-in-out;
}
.sk-title { height: 12px; width: 40%; background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
.sk-value { height: 32px; width: 60%; background: rgba(255, 255, 255, 0.08); border-radius: 6px; }
.insight-sk .sk-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); margin-bottom: 8px; }
.insight-sk .sk-text { height: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 4px; margin-bottom: 4px; }
@keyframes pulseSk { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Scorecards & Insights Overrides */
.scorecard .score-value { color: var(--teal-normal); }
.insight-card { padding: 24px 28px; }
.insight-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
.icon-teal { color: var(--teal-normal); border-color: rgba(0, 217, 207, 0.2); }
.icon-blue { color: var(--blue-normal); border-color: rgba(6, 144, 249, 0.2); }
.icon-purple { color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
.icon-pink { color: var(--pink-normal); border-color: rgba(245, 77, 166, 0.2); }
.insight-title { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; color: #fff; }
.insight-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

/* Funnel Refinements */
.funnel-container { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
.funnel-step { flex: 1; text-align: center; padding: 16px 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); transition: transform 0.2s ease; }
.funnel-step:hover { transform: translateY(-2px); background: rgba(255,255,255,0.04); }
.highlight-step { background: rgba(0, 217, 207, 0.05); border-color: rgba(0, 217, 207, 0.2); }
.highlight-step .step-value { color: var(--teal-normal) !important; }
.step-value { font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: #fff; }
.step-label { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; margin-top: 6px; letter-spacing: 0.04em;}
.funnel-connector { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 0 10px; }
.funnel-rate { font-size: 11px; font-weight: 600; color: var(--teal-normal); font-family: var(--font-mono); }
.funnel-arrow { color: var(--text-tertiary); font-size: 16px; opacity: 0.3; line-height: 1;}

/* Badges & Tables */
.badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: rgba(0, 217, 207, 0.1); color: var(--teal-normal); border: 1px solid rgba(0, 217, 207, 0.15); }
.badge.muted { background: transparent; color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
.table-container { height: 100%; }

@media (max-width: 900px) {
  .funnel-container { flex-direction: column; gap: 10px; }
  .funnel-connector { flex-direction: row; gap: 10px; margin: 4px 0; }
  .funnel-arrow { transform: rotate(90deg); }
}
</style>