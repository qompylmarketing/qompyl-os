<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="shield-check" :size="24" style="color: #FBBF24;" /> Tracking Health & Governance</h1>
        <p>Container Configuration, Event Audit Trail, and Data Integrity.</p>
        <div class="system-status" style="margin-top: 8px;">
           <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
           <span :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
             {{ loading ? 'Auditing Tag Manager Configuration...' : 'System Audit: Just now' }}
           </span>
        </div>
      </div>
    </header>

    <!-- 🌟 Skeleton Loading State -->
    <div v-if="loading" class="bento-grid">
      <!-- KPIs Skeletons -->
      <div v-for="i in 4" :key="'sk-kpi-'+i" class="bento-card col-3 skeleton-card">
        <div class="sk-title" style="width: 60%; height: 12px; margin-bottom: 12px;"></div>
        <div class="sk-value" style="width: 70%; height: 28px;"></div>
      </div>
      <!-- Audit List Skeleton -->
      <div class="bento-card col-12 skeleton-card" style="height: 250px;"></div>
      <!-- Tables Skeletons -->
      <div class="bento-card col-6 skeleton-card" style="height: 300px;"></div>
      <div class="bento-card col-6 skeleton-card" style="height: 300px;"></div>
    </div>

    <!-- 🚀 Dashboard Content (Live Data) -->
    <div v-else-if="data" class="bento-grid fade-in">
      
      <!-- KPIs Scorecards (Top Row) -->
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Live Container ID</span>
        <div class="score-main">
          <p class="score-value" style="font-size: 24px;">{{ data.kpis.container.id }}</p>
          <span class="baseline-badge" style="color: var(--green-normal); background: rgba(33, 196, 94, 0.1); border-color: rgba(33, 196, 94, 0.15);">
            ● {{ data.kpis.container.status }}
          </span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Published Version</span>
        <div class="score-main">
          <p class="score-value" style="font-size: 28px;">{{ data.kpis.version.number }}</p>
          <span class="baseline-badge muted">Deployed: {{ data.kpis.version.date }}</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Last Published By</span>
        <div class="score-main" style="align-items: center; justify-content: flex-start; gap: 12px; margin-top: 8px;">
          <div class="user-avatar">{{ data.kpis.governance.publisher.charAt(0) }}</div>
          <div>
            <p style="color: #fff; font-weight: 600; font-size: 14px; margin: 0;">{{ data.kpis.governance.publisher }}</p>
            <p style="color: var(--text-tertiary); font-size: 11px; margin: 2px 0 0 0;">{{ data.kpis.governance.role }}</p>
          </div>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Workspace Size</span>
        <div class="score-main">
          <div class="workspace-stats">
            <div><span class="stat-num">{{ data.kpis.workspace.tags }}</span> <span class="stat-label">Tags</span></div>
            <div><span class="stat-num">{{ data.kpis.workspace.triggers }}</span> <span class="stat-label">Triggers</span></div>
            <div><span class="stat-num">{{ data.kpis.workspace.variables }}</span> <span class="stat-label">Vars</span></div>
          </div>
        </div>
      </div>

      <!-- 📝 THE HUMAN LAYER: Core Conversion Events Audit (Live from Supabase) -->
      <div class="bento-card col-12">
        <div class="card-header">
          <h3 class="card-title"><Icon name="check-square" :size="18" style="color: var(--green-normal);" /> Core Conversion Events Audit</h3>
          <p class="card-desc">Manual & automated verification of primary tracking events. Ensures data accuracy for downstream reporting.</p>
        </div>
        
        <div class="audit-list">
          <div v-for="event in auditEvents" :key="event.id" class="audit-item" :class="{ 'inactive': event.status.includes('Inactive') }">
            <div class="audit-core">
              <Icon :name="event.icon_name || 'zap'" :size="20" :style="{ color: event.color_hex || '#10B981' }" />
              <span class="event-name">{{ event.event_name }}</span>
              <span class="badge" :style="{ color: event.color_hex, borderColor: event.color_hex, background: 'transparent' }">{{ event.status }}</span>
            </div>
            <div class="audit-meta">
              <div class="meta-item"><Icon name="calendar" :size="12" /> Last Audit: {{ formatDate(event.audit_date) }}</div>
              <div class="meta-item"><Icon name="server" :size="12" /> Env: {{ event.environment }}</div>
            </div>
          </div>
           <!-- Fallback if empty -->
          <div v-if="auditEvents.length === 0" style="text-align: center; padding: 20px; color: var(--text-tertiary);">
            No audit events recorded yet.
          </div>
        </div>
      </div>

      <!-- Tables Section (Inventory) -->
      
      <!-- Tags Ecosystem (Half Width) -->
      <div class="bento-card col-6 table-container" style="align-self: start;">
        <div class="card-header">
          <h3 class="card-title"><Icon name="tag" :size="18" /> Active Tags Ecosystem</h3>
          <p class="card-desc">Inventory of marketing pixels and scripts.</p>
        </div>
        <table>
          <thead>
            <tr><th>Tag Name</th><th>Type</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="tag in data.tags" :key="tag.name">
              <td style="color:#fff; font-weight: 500;">
                {{ tag.name }}
                <div style="font-family: var(--font-mono); font-size: 10.5px; color: var(--text-tertiary); margin-top: 4px;">Trigger: {{ tag.trigger }}</div>
              </td>
              <td><span class="badge" :class="tag.badgeClass">{{ tag.type }}</span></td>
              <td>
                <div class="status-indicator" :class="{ 'status-active': tag.status === 'Active', 'status-paused': tag.status === 'Paused' }">
                  <div class="pulse-dot"></div> {{ tag.status }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Triggers & Rules (Half Width) -->
      <div class="bento-card col-6 table-container" style="align-self: start;">
        <div class="card-header">
          <h3 class="card-title"><Icon name="zap" :size="18" /> Triggers & Firing Rules</h3>
          <p class="card-desc">Conditions under which tags are executed.</p>
        </div>
        <table>
          <thead>
            <tr><th>Trigger Name</th><th>Event Type</th><th>Conditions</th></tr>
          </thead>
          <tbody>
            <tr v-for="trigger in data.triggers" :key="trigger.name">
              <td style="color:#fff; font-weight: 500;">{{ trigger.name }}</td>
              <td><span class="badge muted">{{ trigger.type }}</span></td>
              <td style="font-family: var(--font-mono); font-size: 11.5px;">{{ trigger.conditions }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

// تهيئة عميل Supabase
const supabase = useSupabaseClient()
const data = ref(null)
const auditEvents = ref([])
const loading = ref(true)

// دالة تنسيق التواريخ
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  loading.value = true
  try {
    // 1. جلب البيانات الثابتة/الديناميكية من الـ API المقلد
    const response = await $fetch('/api/gtm')
    data.value = response

    // 2. جلب سجلات التدقيق من Supabase
    const { data: auditsData, error } = await supabase
      .from('gtm_audits')
      .select('*')
      .order('audit_date', { ascending: false })

    if (auditsData) auditEvents.value = auditsData
    if (error) console.error('Audits Fetch Error:', error)

  } catch (error) {
    console.error('Error fetching GTM data:', error)
  } finally {
     // تأخير وهمي بسيط لتشغيل أنيميشن الـ Skeleton بشكل مريح للعين
    setTimeout(() => { loading.value = false }, 500)
  }
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

/* UX Enhancements: Animations */
.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
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

/* Header Additions */
.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}


/* Scorecard overrides for Governance Page */
.scorecard .score-value { color: #FBBF24; } /* Amber color for GTM theme */
.baseline-badge.muted { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-tertiary); }

.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FBBF24, #F59E0B); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #000; }

.workspace-stats { display: flex; gap: 16px; margin-top: 8px; }
.stat-num { font-size: 18px; font-weight: 700; color: #fff; font-family: var(--font-mono); }
.stat-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }

/* Audit List Styles */
.audit-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.audit-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); transition: background 0.2s; }
.audit-item:hover { background: rgba(255,255,255,0.04); }
.audit-item.inactive { opacity: 0.6; }
.audit-core { display: flex; align-items: center; gap: 12px; }
.event-name { font-family: var(--font-mono); font-size: 15px; font-weight: 600; color: #fff; }
.audit-meta { display: flex; gap: 24px; }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-tertiary); }

/* Badges for Tag Types */
.badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-ga4 { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.15); }
.badge-linkedin { background: rgba(10, 102, 194, 0.1); color: #0a66c2; border: 1px solid rgba(10, 102, 194, 0.15); }
.badge-html { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.15); }
.badge.muted { background: transparent; color: var(--text-tertiary); border: 1px solid var(--border-subtle); }

/* Status Indicator (Pulse) */
.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
.status-active { color: var(--green-normal); }
.status-paused { color: var(--text-tertiary); }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-active .pulse-dot { background: var(--green-normal); box-shadow: 0 0 8px var(--green-normal); animation: pulse 2s infinite; }
.status-paused .pulse-dot { background: var(--text-tertiary); }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(33, 196, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0); }
}

@media (max-width: 900px) {
  .audit-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .audit-meta { flex-direction: column; gap: 8px; }
}
</style>