<template>
  <div @click="closeDropdowns">
    <!-- Header -->
    <header class="header">
      <div class="brand-title" style="display: flex; width:100%; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1><Icon name="mouse-pointer" :size="24" style="color: var(--blue-normal);" /> Behavior & UX Analytics</h1>
          <p>Qualitative behavioral data, friction detection, and curated session playbacks.</p>
          <div class="system-status" style="margin-top: 8px;">
             <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
             <span v-if="loading" style="color: var(--text-tertiary)">Analyzing user sessions...</span>
             <span v-else-if="data && data.is_live_data" style="color: var(--green-normal)">API Sync: Live Data (Connected)</span>
             <span v-else style="color: #F87171">API Sync: Fallback Data (Connection Failed)</span>
          </div>
        </div>

        <div class="date-filter" v-if="data">
          <span class="filter-label"><Icon name="calendar" :size="14" /> Date Range:</span>
          <div class="custom-select" @click.stop="toggleSelect('dateRange')">
            <div class="select-trigger" :class="{ 'open': openSelect === 'dateRange' }">
              <span>{{ rangeLabels[selectedRange] }}</span>
              <Icon name="chevron-down" :size="16" class="chevron" />
            </div>
            <ul class="select-menu" v-if="openSelect === 'dateRange'">
              <li v-for="(label, key) in rangeLabels" :key="key" 
                  @click.stop="setRange(key)" 
                  :class="{ 'selected': selectedRange === key }">
                {{ label }}
                <Icon v-if="selectedRange === key" name="check" :size="14" class="check-icon"/>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loading" class="bento-grid">
      <div v-for="i in 4" :key="'sk-kpi-'+i" class="bento-card col-3 skeleton-card">
        <div class="sk-title" style="width: 50%; height: 12px; margin-bottom: 12px;"></div>
        <div class="sk-value" style="width: 80%; height: 34px;"></div>
      </div>
      <div v-for="i in 3" :key="'sk-insight-'+i" class="bento-card col-4 skeleton-card" style="height: 120px;"></div>
      <div class="bento-card col-12 skeleton-card" style="height: 300px;"></div>
    </div>

    <div v-else-if="data" class="bento-grid fade-in">
      
      <!-- 🚀 Behavioral KPIs (Search Console Structure + Clarity Logic) -->
      
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Recorded Sessions</span>
        <div class="score-main">
          <p class="score-value">{{ formatNumber(currentKPIs.sessions) }}</p>
          <span class="eval-badge eval-neutral"><Icon name="activity" :size="12" /> Volume</span> 
        </div>
      </div>

      <!-- 🚀 Highlighted Card (Matched with Search Console Total Clicks style) -->
      <div class="bento-card col-3 scorecard highlight-card">
        <span class="score-title" style="color: var(--teal-normal);">Rage Clicks</span>
        <div class="score-main">
          <p class="score-value highlight-text">{{ formatNumber(currentKPIs.rageClicks) }}</p>
          <span class="eval-badge" :class="getFrictionEvalClass(currentKPIs.rageClicks)">
            <Icon :name="getFrictionEvalIcon(currentKPIs.rageClicks)" :size="12" />
            {{ getFrictionEvalText(currentKPIs.rageClicks) }}
          </span>
        </div>
      </div>

      <div class="bento-card col-3 scorecard">
        <span class="score-title">Dead Clicks</span>
        <div class="score-main">
          <p class="score-value">{{ formatNumber(currentKPIs.deadClicks) }}</p>
          <span class="eval-badge" :class="getFrictionEvalClass(currentKPIs.deadClicks)">
            <Icon :name="getFrictionEvalIcon(currentKPIs.deadClicks)" :size="12" />
            {{ getFrictionEvalText(currentKPIs.deadClicks) }}
          </span>
        </div>
      </div>

      <div class="bento-card col-3 scorecard">
        <span class="score-title">Quick Backs</span>
        <div class="score-main">
          <p class="score-value">{{ formatNumber(currentKPIs.quickBacks) }}</p>
          <span class="eval-badge" :class="getQuickBacksEvalClass(currentKPIs.quickBacks)">
            <Icon :name="getQuickBacksEvalIcon(currentKPIs.quickBacks)" :size="12" />
            {{ getQuickBacksEvalText(currentKPIs.quickBacks) }}
          </span>
        </div>
      </div>

      <!-- Actionable Insights -->
      <div class="bento-card col-4">
        <div class="insight-icon icon-red"><Icon name="alert-octagon" :size="20" /></div>
        <h3 class="insight-title">Rage Click Alert</h3>
        <p class="insight-desc">
          {{ frictionLogs.length > 0 ? `Highest friction element: "${frictionLogs[0].element}" on ${frictionLogs[0].path}.` : 'No rage click elements reported currently.' }}
        </p>
      </div>
      <div class="bento-card col-4">
        <div class="insight-icon icon-amber"><Icon name="x-circle" :size="20" /></div>
        <h3 class="insight-title">Dead Clicks Alert</h3>
        <p class="insight-desc">
          {{ frictionLogs.length > 0 ? `Check the "${frictionLogs[0].element}" element for unresponsive dead clicks.` : 'No dead click elements reported currently.' }}
        </p>
      </div>
      <div class="bento-card col-4">
        <div class="insight-icon icon-blue"><Icon name="eye" :size="20" /></div>
        <h3 class="insight-title">Curator Watchlist</h3>
        <p class="insight-desc">You have {{ curatedSessions.length }} hand-picked session recordings flagged for immediate review.</p>
      </div>

      <!-- Curated Sessions -->
      <div class="bento-card col-12 premium-card">
        <div class="card-header">
          <h3 class="card-title"><Icon name="play-circle" :size="18" style="color: var(--blue-normal);" /> Curated Sessions of the Month</h3>
          <p class="card-desc">Hand-picked critical user journeys reviewed by the product team. Watch these to understand the 'why' behind the numbers.</p>
        </div>
        <div class="curated-list">
          <div v-for="session in curatedSessions" :key="session.id" class="curated-item">
            <div class="session-info">
              <div class="session-journey"><Icon name="map" :size="14" /> {{ session.journey }}</div>
              <div class="session-note"><strong>Analyst Note:</strong> {{ session.analyst_note }}</div>
              <div class="session-tags">
                <span class="badge friction-badge" :class="getBadgeClass(session.friction_type)">{{ session.friction_type }}</span>
                <span class="session-id">ID: {{ session.session_id }}</span>
              </div>
            </div>
            <div class="session-action">
              <a :href="session.session_url" target="_blank" class="watch-btn">
                <Icon name="play" :size="16" /> Watch Recording
              </a>
            </div>
          </div>
          <div v-if="curatedSessions.length === 0" style="text-align: center; padding: 20px; color: var(--text-tertiary);">
            No curated sessions available at the moment.
          </div>
        </div>
      </div>

      <!-- API Diagnostics: Friction Log -->
      <div class="bento-card col-12 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="activity" :size="18" /> Element Friction Log</h3>
          <p class="card-desc">Documented detection of user frustration by element and page.</p>
        </div>
        
        <div v-if="frictionLogs.length === 0" class="zero-state-container">
          <div class="zero-state-icon"><Icon name="shield-check" :size="48" style="color: var(--green-normal);" /></div>
          <h4 style="color: #fff; margin: 16px 0 8px 0; font-size: 18px;">Zero Friction Detected!</h4>
          <p style="color: var(--text-secondary); max-width: 400px; line-height: 1.6; font-size: 14px;">Your UI architecture is rock-solid. No rage clicks or dead clicks have been logged recently. Outstanding clean code! 🚀</p>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Element</th>
              <th class="num-col">Metrics (R/D)</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in frictionLogs" :key="row.id" :class="{ 'row-resolved': row.status === 'Resolved' }">
              <td><span style="color:#fff;font-family:var(--font-mono)">{{ row.path }}</span></td>
              <td style="color: var(--text-secondary); font-weight: 500;">{{ row.element }}</td>
              <td class="num-col">
                 <span style="color: #F87171; margin-right: 8px;" title="Rage Clicks">{{ row.rage }}R</span>
                 <span style="color: #FBBF24;" title="Dead Clicks">{{ row.dead }}D</span>
              </td>
              <td>
                <span class="badge" :class="getPriorityClass(row.priority)">
                   <span v-if="row.priority === 'High'">🔥</span>
                   <span v-else-if="row.priority === 'Medium'">⚡</span>
                   <span v-else>💤</span>
                   {{ row.priority }}
                </span>
              </td>
              <td>
                 <div class="user-cell" v-if="row.owner">
                    <div class="avatar-small">{{ row.owner.charAt(0).toUpperCase() }}</div>
                    {{ row.owner }}
                 </div>
                 <span v-else style="color: var(--text-tertiary); font-style: italic;">Unassigned</span>
              </td>
              <td>
                <div class="status-indicator" :class="getStatusIndicatorClass(row.status)">
                  <div class="pulse-dot" v-if="row.status !== 'Resolved'"></div> {{ row.status }}
                </div>
              </td>
              <td>
                <button v-if="row.status !== 'Resolved'" class="resolve-btn" @click="markAsResolved('clarity_friction_log', row.id)" title="Mark as Resolved">
                  <Icon name="check" :size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- API Diagnostics: JS Errors -->
      <div class="bento-card col-12 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="terminal" :size="18" /> Client-Side JS Errors</h3>
          <p class="card-desc">Errors affecting user experience, ranked by occurrences.</p>
        </div>

        <div v-if="jsErrors.length === 0" class="zero-state-container">
          <div class="zero-state-icon"><Icon name="shield-check" :size="48" style="color: var(--green-normal);" /></div>
          <h4 style="color: #fff; margin: 16px 0 8px 0; font-size: 18px;">Zero Script Errors!</h4>
          <p style="color: var(--text-secondary); max-width: 400px; line-height: 1.6; font-size: 14px;">The console is perfectly clean. No critical JavaScript errors are disrupting the user journey. Excellent work! 💻</p>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>Error Message</th>
              <th>Page</th>
              <th class="num-col">Count</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="error in jsErrors" :key="error.id" :class="{ 'row-resolved': error.status === 'Resolved' }">
              <td style="color:#fff; font-size: 12.5px; font-family:var(--font-mono); max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="error.message">
                {{ error.message }}
              </td>
              <td style="font-family:var(--font-mono); font-size: 11.5px;">{{ error.path }}</td>
              <td class="num-col" style="color: #F87171; font-weight: bold;">{{ error.count }}</td>
              <td>
                <span class="badge" :class="getPriorityClass(error.priority)">
                   <span v-if="error.priority === 'High'">🔥</span>
                   <span v-else-if="error.priority === 'Medium'">⚡</span>
                   <span v-else>💤</span>
                   {{ error.priority }}
                </span>
              </td>
              <td>
                 <div class="user-cell" v-if="error.owner">
                    <div class="avatar-small">{{ error.owner.charAt(0).toUpperCase() }}</div>
                    {{ error.owner }}
                 </div>
                 <span v-else style="color: var(--text-tertiary); font-style: italic;">Unassigned</span>
              </td>
              <td>
                <div class="status-indicator" :class="getStatusIndicatorClass(error.status)">
                  <div class="pulse-dot" v-if="error.status !== 'Resolved'"></div> {{ error.status }}
                </div>
              </td>
              <td>
                <button v-if="error.status !== 'Resolved'" class="resolve-btn" @click="markAsResolved('clarity_js_errors', error.id)" title="Mark as Resolved">
                  <Icon name="check" :size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()
const data = ref(null)

const curatedSessions = ref([])
const frictionLogs = ref([])
const jsErrors = ref([])
const loading = ref(true)

const selectedRange = ref('3') 
const openSelect = ref(null)
const rangeLabels = {
  '1': 'Last 24 Hours',
  '3': 'Last 3 Days',
  '7': 'Last 7 Days',
  '14': 'Last 14 Days', // 🚀 الخيار الجديد
  '30': 'Last 30 Days'  // 🚀 الخيار الجديد
}



const currentKPIs = computed(() => {
  if (!data.value || !data.value.reports) return { sessions: 0, rageClicks: 0, deadClicks: 0, quickBacks: 0 }
  return data.value.reports[selectedRange.value] || data.value.reports['1']
})

const toggleSelect = (selectId) => {
  openSelect.value = openSelect.value === selectId ? null : selectId
}

const setRange = (key) => {
  selectedRange.value = key
  openSelect.value = null
}

const closeDropdowns = () => {
  openSelect.value = null
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num || 0)
}

const getBadgeClass = (type) => {
  if (!type) return 'badge-info';
  if (type.includes('Rage') || type.includes('Error')) return 'badge-danger';
  if (type.includes('Quick Back')) return 'badge-warning';
  return 'badge-info';
}

// 🚀 Logic for UX Evaluation Badges (Based on User's Rules)

// For Rage & Dead Clicks (0: Perfect, 1-5: Warning, >5: Critical)
const getFrictionEvalText = (count) => {
  if (count === 0) return 'Perfect';
  if (count <= 5) return 'Warning';
  return 'Critical';
}

const getFrictionEvalClass = (count) => {
  if (count === 0) return 'eval-good';
  if (count <= 5) return 'eval-warning';
  return 'eval-bad';
}

const getFrictionEvalIcon = (count) => {
  if (count === 0) return 'check-circle';
  if (count <= 5) return 'alert-triangle';
  return 'x-octagon';
}

// For Quick Backs (<10: Healthy, 10-20: Monitor, >20: High Friction)
const getQuickBacksEvalText = (count) => {
  if (count < 10) return 'Healthy';
  if (count <= 20) return 'Monitor';
  return 'High Friction';
}

const getQuickBacksEvalClass = (count) => {
  if (count < 10) return 'eval-good';
  if (count <= 20) return 'eval-warning';
  return 'eval-bad';
}

const getQuickBacksEvalIcon = (count) => {
  if (count < 10) return 'check-circle';
  if (count <= 20) return 'eye';
  return 'alert-octagon';
}

// 🚀 Logic for Tables
const getPriorityClass = (priority) => {
  if (priority === 'High') return 'badge-danger';
  if (priority === 'Medium') return 'badge-warning';
  return 'badge-muted';
}

const getStatusIndicatorClass = (status) => {
  if (status === 'Resolved') return 'status-resolved';
  if (status === 'Investigating') return 'status-investigating';
  return 'status-active'; 
}

const markAsResolved = async (tableName, id) => {
  try {
    const { error } = await supabase.from(tableName).update({ status: 'Resolved' }).eq('id', id)
    if (error) throw error
    
    if (tableName === 'clarity_friction_log') {
      const idx = frictionLogs.value.findIndex(item => item.id === id)
      if (idx !== -1) frictionLogs.value[idx].status = 'Resolved'
    } else {
      const idx = jsErrors.value.findIndex(item => item.id === id)
      if (idx !== -1) jsErrors.value[idx].status = 'Resolved'
    }
  } catch (err) {
    alert("Failed to mark as resolved: " + err.message)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/clarity')
    data.value = response

    const { data: sessionsData } = await supabase
      .from('clarity_sessions')
      .select('*')
      .eq('is_active', true) 
      .order('created_at', { ascending: false })
    if (sessionsData) curatedSessions.value = sessionsData

    const { data: frictionData } = await supabase
      .from('clarity_friction_log')
      .select('*')
      .order('priority', { ascending: false }) 
      .order('rage', { ascending: false })
    if (frictionData) frictionLogs.value = frictionData

    const { data: errorsData } = await supabase
      .from('clarity_js_errors')
      .select('*')
      .order('priority', { ascending: false })
      .order('count', { ascending: false })
    if (errorsData) jsErrors.value = errorsData

  } catch (error) {
    console.error('Error fetching Clarity data:', error)
  } finally {
    setTimeout(() => { loading.value = false }, 500)
  }
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.skeleton-card { background: rgba(255, 255, 255, 0.02); border-color: rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 16px; animation: pulseSk 1.5s infinite ease-in-out; }
.sk-title { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
.sk-value { background: rgba(255, 255, 255, 0.08); border-radius: 6px; }
@keyframes pulseSk { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}

.date-filter { display: flex; align-items: center; gap: 12px; }
.filter-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.custom-select { position: relative; width: 160px; cursor: pointer; user-select: none; }
.select-trigger { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); color: #fff; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; transition: all 0.2s ease; }
.select-trigger.open { border-color: var(--teal-normal); box-shadow: 0 0 0 2px rgba(0, 217, 207, 0.1); }
.select-trigger .chevron { transition: transform 0.2s ease; color: var(--text-tertiary); }
.select-trigger.open .chevron { transform: rotate(180deg); }
.select-menu { position: absolute; top: calc(100% + 4px); right: 0; width: 100%; margin: 0; padding: 6px; list-style: none; background: rgba(17, 22, 31, 0.98); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); z-index: 1000; animation: dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes dropdownFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.select-menu li { padding: 10px 12px; border-radius: 4px; color: var(--text-secondary); font-size: 13px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
.select-menu li:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.select-menu li.selected { color: #fff; font-weight: 500; }
.select-menu .check-icon { color: var(--teal-normal); }


/* 🚀 Scorecard styles (Matched Exactly with Search Console) */
.scorecard { padding: 22px 24px; justify-content: space-between; background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005)); }
.scorecard .score-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); margin-bottom: 12px; display: block; }
.scorecard .score-main { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.scorecard .score-value {
  font-size: 34px; font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.5px;
  line-height: 1; background: var(--gradient-primary); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
}

/* Highlight Card Style (For Rage Clicks) */
.highlight-card {
  background: linear-gradient(135deg, rgba(0, 217, 207, 0.08), rgba(255, 255, 255, 0.005)) !important;
  border-color: rgba(0, 217, 207, 0.3) !important;
  box-shadow: 0 0 20px rgba(0, 217, 207, 0.05);
}
.highlight-text {
  background: none !important;
  -webkit-text-fill-color: var(--teal-normal) !important;
  color: var(--teal-normal) !important;
}

/* 🚀 Dynamic Eval Badges (Pill Shape matched with Search Console Baseline Badge) */
.eval-badge { font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.02em; text-transform: uppercase; }
.eval-good { background: rgba(33, 196, 94, 0.06); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.15); }
.eval-warning { background: rgba(251, 191, 36, 0.06); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.15); }
.eval-bad { background: rgba(248, 113, 113, 0.06); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.15); }
.eval-neutral { background: rgba(255, 255, 255, 0.03); color: var(--text-secondary); border: 1px solid var(--border-subtle); }


.icon-red { color: #F87171; background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.15); }
.icon-amber { color: #FBBF24; background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.15); }
.icon-blue { color: var(--blue-normal); background: rgba(6, 144, 249, 0.08); border-color: rgba(6, 144, 249, 0.15); }

.premium-card { border: 1px solid rgba(6, 144, 249, 0.25); box-shadow: 0 8px 32px rgba(6, 144, 249, 0.06); background: linear-gradient(180deg, rgba(17, 22, 31, 1) 0%, rgba(6, 144, 249, 0.02) 100%); }
.curated-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.curated-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); transition: all 0.3s ease; }
.curated-item:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(6, 144, 249, 0.4); }
.session-info { display: flex; flex-direction: column; gap: 10px; max-width: 75%; }
.session-journey { color: #fff; font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.session-note { color: var(--text-secondary); font-size: 13.5px; line-height: 1.6; }
.session-note strong { color: var(--blue-normal); }
.session-tags { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.friction-badge { font-size: 11px; padding: 4px 10px; border-radius: 100px; font-weight: 600; }
.badge-danger { background: rgba(248, 113, 113, 0.1); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.2); }
.badge-warning { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }
.badge-info { background: rgba(6, 144, 249, 0.1); color: var(--blue-normal); border: 1px solid rgba(6, 144, 249, 0.2); }
.session-id { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.watch-btn { display: flex; align-items: center; gap: 8px; background: var(--blue-normal); color: #fff; padding: 10px 20px; border-radius: 100px; font-weight: 600; font-size: 13px; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 14px rgba(6, 144, 249, 0.3); }
.watch-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 144, 249, 0.4); background: #3b82f6; }

.table-container { overflow-x: auto; width: 100%; }
.zero-state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; background: rgba(255,255,255,0.01); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.05); margin-top: 20px; }
.zero-state-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(33, 196, 94, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }

.user-cell { display: flex; align-items: center; gap: 8px; color: #fff; font-weight: 500; font-size: 13px;}
.avatar-small { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), #0690f9); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }

.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
.status-active { color: #F87171; }
.status-investigating { color: #FBBF24; }
.status-resolved { color: var(--text-tertiary); text-decoration: line-through; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-active .pulse-dot { background: #F87171; box-shadow: 0 0 8px #F87171; animation: pulseRed 2s infinite; }
.status-investigating .pulse-dot { background: #FBBF24; box-shadow: 0 0 8px #FBBF24; }
@keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); } 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); } }

.resolve-btn { background: transparent; border: 1px solid var(--border-subtle); color: var(--green-normal); width: 30px; height: 30px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.resolve-btn:hover { background: rgba(33, 196, 94, 0.1); border-color: rgba(33, 196, 94, 0.3); }

.row-resolved td { opacity: 0.4; }
.row-resolved:hover td { opacity: 0.8; }

@media (max-width: 900px) {
  .curated-item { flex-direction: column; align-items: flex-start; gap: 20px; }
  .session-info { max-width: 100%; }
}
</style>