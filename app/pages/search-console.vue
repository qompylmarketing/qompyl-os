<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1> <Icon name="folder-search" :size="24" style="color: var(--teal-normal);" /> Search Console Overview</h1>
        <p>{{ periodLabel }}</p>
        <div class="system-status" style="margin-top: 8px;">
           <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
           <span :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
             {{ loading ? 'Syncing with Search Console API...' : 'API Sync: Just now' }}
           </span>
        </div>
      </div>

      <!-- الفلاتر يتم قفلها أثناء التحميل لمنع الـ Spam Clicks -->
      <div class="filters-group" :class="{ 'disabled-filters': loading }">
        <!-- Date Range -->
        <div class="date-range-control">
          <input type="date" v-model="filters.startDate" @change="applyFilters">
          <span class="date-arrow">→</span>
          <input type="date" v-model="filters.endDate" @change="applyFilters">
        </div>

        <!-- Country Filter (Global) -->
        <div class="filter-dropdown" ref="countryDropdown">
          <div class="filter-trigger" @click="toggleDropdown('country')">
            <Icon name="globe" :size="14" />
            <span class="trigger-label">{{ countryLabel }}</span>
            <span class="trigger-badge">{{ countryBadge }}</span>
            <i data-lucide="chevron-down" class="chevron" :class="{ open: openDropdown === 'country' }"></i>
          </div>
          <div class="dropdown-menu" :class="{ open: openDropdown === 'country' }">
            <div class="menu-label">Countries</div>
            <div v-for="country in countryOptions" :key="country.value" 
                 class="checkbox-item" :class="{ checked: isCountryChecked(country.value) }"
                 @click="toggleCountry(country.value)">
              <span class="custom-check"><i data-lucide="check"></i></span>
              <span class="item-label">{{ country.label }}</span>
            </div>
          </div>
        </div>

        <!-- Device Filter (Global) -->
        <div class="filter-dropdown" ref="deviceDropdown">
          <div class="filter-trigger" @click="toggleDropdown('device')">
            <i data-lucide="monitor-smartphone"></i>
            <span class="trigger-label">{{ deviceLabel }}</span>
            <span class="trigger-badge">{{ deviceBadge }}</span>
            <i data-lucide="chevron-down" class="chevron" :class="{ open: openDropdown === 'device' }"></i>
          </div>
          <div class="dropdown-menu" :class="{ open: openDropdown === 'device' }">
            <div class="menu-label">Devices</div>
            <div v-for="device in deviceOptions" :key="device.value"
                 class="checkbox-item" :class="{ checked: isDeviceChecked(device.value) }"
                 @click="toggleDevice(device.value)">
              <span class="custom-check"><i data-lucide="check"></i></span>
              <span class="item-label">{{ device.label }}</span>
            </div>
          </div>
        </div>

        <!-- Query Type Filter (Global) -->
        <div class="filter-dropdown" ref="queryDropdown">
          <div class="filter-trigger" @click="toggleDropdown('query')">
            <i data-lucide="search"></i>
            <span class="trigger-label">{{ queryLabel }}</span>
            <span class="trigger-badge">{{ queryBadge }}</span>
            <i data-lucide="chevron-down" class="chevron" :class="{ open: openDropdown === 'query' }"></i>
          </div>
          <div class="dropdown-menu" :class="{ open: openDropdown === 'query' }">
            <div class="menu-label">Query Types</div>
            <div v-for="type in queryOptions" :key="type.value"
                 class="checkbox-item" :class="{ checked: isQueryChecked(type.value) }"
                 @click="toggleQuery(type.value)">
              <span class="custom-check"><i data-lucide="check"></i></span>
              <span class="item-label">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 🌟 Skeleton Loading State (Enterprise UX) -->
    <div v-if="loading" class="bento-grid">
      <!-- KPIs Skeletons -->
      <div v-for="i in 4" :key="'sk-kpi-'+i" class="bento-card col-3 skeleton-card">
        <div class="sk-title" style="width: 50%; height: 12px; margin-bottom: 12px;"></div>
        <div class="sk-value" style="width: 80%; height: 34px;"></div>
      </div>
      <!-- Insights Skeletons -->
      <div v-for="i in 3" :key="'sk-insight-'+i" class="bento-card col-4 skeleton-card" style="height: 140px;"></div>
      <!-- Chart Skeleton -->
      <div class="bento-card col-12 skeleton-card" style="height: 380px;"></div>
      <!-- Tables Skeletons -->
      <div class="bento-card col-12 skeleton-card" style="height: 250px;"></div>
      <div class="bento-card col-12 skeleton-card" style="height: 250px;"></div>
    </div>

    <!-- 🚀 Dashboard Content (Live Data) يظهر بـ Fade-in Animation -->
    <div v-else-if="data" class="bento-grid fade-in">
      <!-- KPI Scorecards -->
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Total Impressions</span>
        <div class="score-main">
          <p class="score-value">{{ data.summary.totalImpressions }}</p>
             <span class="baseline-badge"><Icon name="minus" :size="12" /> Selected Period</span>
        </div>
      </div>
      
      <!-- Highlighted Card: تمييز بصري لأهم مقياس (Total Clicks) -->
      <div class="bento-card col-3 scorecard highlight-card">
        <span class="score-title" style="color: var(--teal-normal);">Total Clicks</span>
        <div class="score-main">
          <p class="score-value highlight-text">{{ data.summary.totalClicks }}</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Selected Period</span>
        </div>
      </div>

      <div class="bento-card col-3 scorecard">
        <span class="score-title">Average CTR</span>
        <div class="score-main">
          <p class="score-value">{{ data.summary.averageCtr }}%</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Selected Period</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Avg. Position</span>
        <div class="score-main">
          <p class="score-value">{{ data.summary.averagePosition }}</p>
          <span class="baseline-badge"><Icon name="minus" :size="12" /> Selected Period</span>
        </div>
      </div>

      <!-- Dynamic Insights -->
      <div class="bento-card col-4">
        <div class="insight-icon icon-emerald"><Icon name="activity" :size="20" /></div>
        <h3 class="insight-title">Indexing &amp; Visibility</h3>
        <p class="insight-desc">{{ data.insightTexts.indexing }}</p>
      </div>
      <div class="bento-card col-4">
        <div class="insight-icon icon-blue"><Icon name="shield-check" :size="20" /></div>
        <h3 class="insight-title">Brand Dominance</h3>
        <p class="insight-desc">{{ data.insightTexts.brand }}</p>
      </div>
      <div class="bento-card  col-4">
        <div class="insight-icon icon-purple"><Icon name="rocket" :size="20" /></div>
        <h3 class="insight-title">Growth Opportunities</h3>
        <p class="insight-desc">{{ data.insightTexts.opportunities }}</p>
      </div>

      <!-- Charts Component -->
      <Charts :chart-data="data.charts" />

      <!-- Landing Pages Performance -->
      <div class="bento-card col-12 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="layout" :size="18" /> Landing Pages Performance</h3>
          <p class="card-desc">Identifies which pages are successfully indexed and driving traffic. Prioritize UX improvements on high-impression pages.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Landing Page URL</th>
              <th class="num-col">Impressions</th>
              <th class="num-col">Clicks</th>
              <th class="num-col">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in aggregatedLandingPages.slice(0, 10)" :key="row.path">
              <td><span style="color:var(--text-tertiary)">qompyl.com</span><span style="color:#fff;font-family:var(--font-mono)">{{ row.path }}</span></td>
              <td class="num-col">{{ row.imp }}</td>
              <td class="num-col" :style="{ color: row.clicks > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.clicks }}</td>
              <td class="num-col">{{ row.imp > 0 ? ((row.clicks / row.imp) * 100).toFixed(1) : 0 }}%</td>
            </tr>
            <tr v-if="aggregatedLandingPages.length === 0">
              <td colspan="4" style="text-align:center;padding:30px;color:var(--text-tertiary);">No data matches your filters</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Search Query Analysis -->
      <div class="bento-card col-12 table-container">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 class="card-title"><Icon name="search" :size="18" /> Search Query Analysis</h3>
            <p class="card-desc">Separates Branded intent from Non-Branded intent. Identify your primary targets for SEO growth below.</p>
          </div>
          <button class="action-btn" @click="toggleOpportunities">
            <i data-lucide="target"></i> 
            {{ showOpportunities ? 'Clear Opportunities Filter' : 'View Opportunities (Pos 11-20)' }}
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Query</th>
              <th>Query Type</th>
              <th class="num-col">Impressions</th>
              <th class="num-col">Clicks</th>
              <th class="num-col">Avg. Position</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in aggregatedQueries.slice(0, 10)" :key="row.query">
              <td style="color:#fff;font-weight:500;">{{ row.query }}</td>
              <td><span class="badge" :class="row.type === 'Branded' ? 'branded' : 'non-branded'">{{ row.type }}</span></td>
              <td class="num-col">{{ row.imp }}</td>
              <td class="num-col" :style="{ color: row.clicks > 0 ? 'var(--teal-normal)' : 'inherit' }">{{ row.clicks }}</td>
              <td class="num-col">{{ row.pos.toFixed(1) }}</td>
            </tr>
            <tr v-if="aggregatedQueries.length === 0">
              <td colspan="5" style="text-align:center;padding:30px;color:var(--text-tertiary);">No matching queries found in this range.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Charts from '~/components/Charts.vue'
import Icon from '~/components/Icon.vue'

// ===== State =====
const data = ref(null)
const loading = ref(true) // Start with loading true
const showOpportunities = ref(false)
const openDropdown = ref(null)

// ===== Filters =====
const filters = ref({
  startDate: '2026-08-01', endDate: '2026-08-31', countries: ['all'], devices: ['all'], queryTypes: ['all']
})

// ===== Dropdown Options =====
const countryOptions = [ { value: 'all', label: 'All Countries' }, { value: 'United States', label: 'United States' }, { value: 'Brazil', label: 'Brazil' }, { value: 'India', label: 'India' }, { value: 'United Kingdom', label: 'United Kingdom' } ]
const deviceOptions = [ { value: 'all', label: 'All Devices' }, { value: 'Desktop', label: 'Desktop' }, { value: 'Mobile', label: 'Mobile' }, { value: 'Tablet', label: 'Tablet' } ]
const queryOptions = [ { value: 'all', label: 'All Query Types' }, { value: 'Branded', label: 'Branded' }, { value: 'Non-Branded', label: 'Non-Branded' } ]

// ===== Computed Labels =====
const periodLabel = computed(() => {
  if (!filters.value.startDate || !filters.value.endDate) return ''
  const s = new Date(filters.value.startDate + 'T00:00:00')
  const e = new Date(filters.value.endDate + 'T00:00:00')
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})
const countryLabel = computed(() => { const selected = filters.value.countries.filter(c => c !== 'all'); return selected.length === 0 || filters.value.countries.includes('all') ? 'All Countries' : selected.join(', ') })
const countryBadge = computed(() => { const selected = filters.value.countries.filter(c => c !== 'all'); return selected.length === 0 || filters.value.countries.includes('all') ? '0' : selected.length.toString() })
const deviceLabel = computed(() => { const selected = filters.value.devices.filter(d => d !== 'all'); return selected.length === 0 || filters.value.devices.includes('all') ? 'All Devices' : selected.join(', ') })
const deviceBadge = computed(() => { const selected = filters.value.devices.filter(d => d !== 'all'); return selected.length === 0 || filters.value.devices.includes('all') ? '0' : selected.length.toString() })
const queryLabel = computed(() => { const selected = filters.value.queryTypes.filter(q => q !== 'all'); return selected.length === 0 || filters.value.queryTypes.includes('all') ? 'All Query Types' : selected.join(', ') })
const queryBadge = computed(() => { const selected = filters.value.queryTypes.filter(q => q !== 'all'); return selected.length === 0 || filters.value.queryTypes.includes('all') ? '0' : selected.length.toString() })

// ===== Data Aggregation =====
const aggregatedLandingPages = computed(() => {
  if (!data.value || !data.value.filteredData) return []
  const grouped = {}
  data.value.filteredData.forEach(r => {
    if (!grouped[r.path]) grouped[r.path] = { path: r.path, imp: 0, clicks: 0 }
    grouped[r.path].imp += r.imp; grouped[r.path].clicks += r.clicks
  })
  return Object.values(grouped).sort((a, b) => b.imp - a.imp)
})

const aggregatedQueries = computed(() => {
  if (!data.value || !data.value.filteredData) return []
  let queries = data.value.filteredData
  if (showOpportunities.value) queries = queries.filter(r => r.pos >= 11 && r.pos <= 20 && r.type === 'Non-Branded')
  const grouped = {}
  queries.forEach(r => {
    if (!grouped[r.query]) grouped[r.query] = { query: r.query, type: r.type, imp: 0, clicks: 0, posSum: 0 }
    grouped[r.query].imp += r.imp; grouped[r.query].clicks += r.clicks; grouped[r.query].posSum += (r.pos * r.imp)
  })
  return Object.values(grouped).map(g => ({ query: g.query, type: g.type, imp: g.imp, clicks: g.clicks, pos: g.imp > 0 ? (g.posSum / g.imp) : 0 })).sort((a, b) => b.imp - a.imp)
})

// ===== Dropdown Toggles & Filter Actions =====
function toggleDropdown(type) { openDropdown.value = openDropdown.value === type ? null : type }
function isCountryChecked(value) { return filters.value.countries.includes(value) }
function toggleCountry(value) {
  if (value === 'all') filters.value.countries = ['all']
  else {
    const index = filters.value.countries.indexOf(value)
    if (index > -1) filters.value.countries.splice(index, 1)
    else { filters.value.countries = filters.value.countries.filter(c => c !== 'all'); filters.value.countries.push(value) }
    if (filters.value.countries.length === 0) filters.value.countries = ['all']
  }
  applyFilters()
}
function isDeviceChecked(value) { return filters.value.devices.includes(value) }
function toggleDevice(value) {
  if (value === 'all') filters.value.devices = ['all']
  else {
    const index = filters.value.devices.indexOf(value)
    if (index > -1) filters.value.devices.splice(index, 1)
    else { filters.value.devices = filters.value.devices.filter(d => d !== 'all'); filters.value.devices.push(value) }
    if (filters.value.devices.length === 0) filters.value.devices = ['all']
  }
  applyFilters()
}
function isQueryChecked(value) { return filters.value.queryTypes.includes(value) }
function toggleQuery(value) {
  if (value === 'all') filters.value.queryTypes = ['all']
  else {
    const index = filters.value.queryTypes.indexOf(value)
    if (index > -1) filters.value.queryTypes.splice(index, 1)
    else { filters.value.queryTypes = filters.value.queryTypes.filter(q => q !== 'all'); filters.value.queryTypes.push(value) }
    if (filters.value.queryTypes.length === 0) filters.value.queryTypes = ['all']
  }
  applyFilters()
}
function toggleOpportunities() { showOpportunities.value = !showOpportunities.value }

// ===== Fetch Data API =====
async function applyFilters() {
  loading.value = true
  openDropdown.value = null
  
  try {
    const response = await $fetch('/api/search-console', {
      params: {
        startDate: filters.value.startDate, endDate: filters.value.endDate,
        countries: filters.value.countries.join(','), devices: filters.value.devices.join(','), queryTypes: filters.value.queryTypes.join(',')
      }
    })
    data.value = response
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    // محاكاة تأخير بسيط للـ UX لإظهار السكيليتون
    setTimeout(() => { loading.value = false }, 500)
  }
}

function handleClickOutside(event) {
  const dropdowns = document.querySelectorAll('.filter-dropdown')
  let clickedInside = false
  dropdowns.forEach(el => { if (el.contains(event.target)) clickedInside = true })
  if (!clickedInside) openDropdown.value = null
}

onMounted(() => { document.addEventListener('click', handleClickOutside); applyFilters() })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

/* UX Enhancements: Loading & Animations */
.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.disabled-filters { opacity: 0.5; pointer-events: none; transition: opacity 0.3s ease; }
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* Skeleton Loader Styles */
.skeleton-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  display: flex; flex-direction: column; gap: 16px;
  animation: pulseSk 1.5s infinite ease-in-out;
}
.sk-title { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
.sk-value { background: rgba(255, 255, 255, 0.08); border-radius: 6px; }
@keyframes pulseSk { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Highlight Card Style (لتمييز Total Clicks) */
.highlight-card {
  background: linear-gradient(135deg, rgba(0, 217, 207, 0.08), rgba(255, 255, 255, 0.005)) !important;
  border-color: rgba(0, 217, 207, 0.3) !important;
  box-shadow: 0 0 20px rgba(0, 217, 207, 0.05);
}
.highlight-badge {
  background: rgba(0, 217, 207, 0.15) !important;
  color: var(--teal-normal) !important;
  border: 1px solid rgba(0, 217, 207, 0.3) !important;
}
/* Overriding the text gradient for the highlighted card to ensure it stays Teal */
.highlight-text {
  background: none !important;
  -webkit-text-fill-color: var(--teal-normal) !important;
  color: var(--teal-normal) !important;
}

/* Header Additions */
.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}

/* Animations for dropdown chevron */
.chevron { transition: transform 0.3s ease; }
.chevron.open { transform: rotate(180deg); }

/* Dropdown styling */
.filter-dropdown { position: relative; display: inline-block; }
.dropdown-menu {
  position: absolute; top: calc(100% + 6px); left: 0; min-width: 200px;
  background: rgba(17, 22, 31, 0.96); backdrop-filter: blur(24px);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  padding: 8px 4px; box-shadow: var(--shadow-hover);
  opacity: 0; visibility: hidden; transform: translateY(-8px) scale(0.98);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); z-index: 100;
  max-height: 260px; overflow-y: auto;
}
.dropdown-menu.open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }

.checkbox-item {
  display: flex; align-items: center; gap: 10px; padding: 7px 12px;
  border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;
  color: var(--text-secondary); font-size: 13px; font-weight: 400;
}
.checkbox-item:hover { background: rgba(255, 255, 255, 0.04); color: #fff; }
.checkbox-item .custom-check {
  width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid var(--border-subtle);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.2s ease; background: transparent;
}
.checkbox-item .custom-check i {
  width: 12px; height: 12px; opacity: 0; transform: scale(0.6);
  transition: all 0.2s ease; color: #fff;
}
.checkbox-item.checked .custom-check { background: var(--teal-normal); border-color: var(--teal-normal); box-shadow: 0 0 20px rgba(0, 217, 207, 0.2); }
.checkbox-item.checked .custom-check i { opacity: 1; transform: scale(1); }
.checkbox-item.checked .item-label { color: #fff; }

#deviceDropdown .checkbox-item.checked .custom-check { background: var(--blue-normal); border-color: var(--blue-normal); box-shadow: 0 0 20px rgba(6, 144, 249, 0.2); }
#queryDropdown .checkbox-item.checked .custom-check { background: var(--pink-normal); border-color: var(--pink-normal); box-shadow: 0 0 20px rgba(245, 77, 166, 0.2); }

.menu-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); padding: 6px 12px 4px; }

@media (max-width: 900px) {
  .filters-group { flex-wrap: wrap; }
  .filter-dropdown .filter-trigger { font-size: 11px; padding: 6px 12px; min-height: 32px; }
}

/* Bento grid styles */
.bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
.bento-card {
  background: var(--bg-card); backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
  padding: 24px 28px; display: flex; flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
}
.bento-card::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
.bento-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: var(--shadow-hover), var(--shadow-glow); background: rgba(255, 255, 255, 0.04); }

.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-12 { grid-column: span 12; }

/* Scorecard styles */
.scorecard { padding: 22px 24px; justify-content: space-between; background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005)); }
.scorecard .score-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); margin-bottom: 12px; display: block; }
.scorecard .score-main { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.scorecard .score-value {
  font-size: 34px; font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.5px;
  line-height: 1; background: var(--gradient-primary); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
}
.baseline-badge { background: rgba(0, 217, 207, 0.06); color: var(--teal-normal); border: 1px solid rgba(0, 217, 207, 0.1); font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.02em; }

/* Insights styles */
.insight-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(0, 217, 207, 0.06); border: 1px solid rgba(0, 217, 207, 0.08); transition: all 0.3s; }
.bento-card:hover .insight-icon { border-color: var(--border-hover); background: rgba(0, 217, 207, 0.08); box-shadow: var(--shadow-teal); }
.icon-emerald { color: var(--green-normal); }
.icon-blue { color: var(--blue-normal); }
.icon-purple { color: var(--pink-normal); }
.insight-title { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.2px; }
.insight-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

/* Table styles */
.table-container { overflow-x: auto; overflow-y: auto;  padding: 0 24px 24px; }
.table-container .card-header { margin-top: 24px; margin-bottom: 16px; position: sticky; top: 0;  z-index: 11; padding-bottom: 10px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { position: sticky; top: 70px;  backdrop-filter: blur(12px); z-index: 10; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); padding: 12px 12px 10px; border-bottom: 1px solid var(--border-subtle); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
td { padding: 12px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); color: var(--text-secondary); font-weight: 400; }
tr:hover td { background: rgba(255, 255, 255, 0.02); }
.num-col { text-align: right; font-family: var(--font-mono); font-size: 12.5px; }

.badge { padding: 4px 12px; border-radius: 100px; font-size: 10.5px; font-weight: 600; display: inline-block; letter-spacing: 0.02em; }
.badge.branded { background: rgba(6, 144, 249, 0.1); color: var(--blue-normal); border: 1px solid rgba(6, 144, 249, 0.12); }
.badge.non-branded { background: rgba(255, 255, 255, 0.03); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }

.action-btn { background: rgba(245, 77, 166, 0.06); border: 1px solid rgba(245, 77, 166, 0.1); color: var(--pink-normal); padding: 8px 18px; border-radius: 100px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-family: var(--font); }
.action-btn:hover { background: rgba(245, 77, 166, 0.1); border-color: rgba(245, 77, 166, 0.2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245, 77, 166, 0.08); }

@media (max-width: 1200px) { .col-3 { grid-column: span 6; } }
@media (max-width: 900px) { .col-3, .col-4 { grid-column: span 12; } }
@media (max-width: 480px) { .bento-card { padding: 14px 16px; border-radius: var(--radius-md); } .scorecard .score-value { font-size: 24px; } }
</style>