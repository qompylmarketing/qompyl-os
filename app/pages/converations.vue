<template>
  <div>
    <!-- ===== Header ===== -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="activity" :size="24" style="color: var(--teal-normal);" /> Conversion Intelligence</h1>
        <p>Why visitors don't convert — and exactly what we're doing about it. Blended evidence from GA4, Clarity, GTM & Leads.</p>
        <div class="system-status" style="margin-top: 8px; gap: 12px;">
          <span :style="{ color: sync.ga4 ? 'var(--green-normal)' : '#F87171' }">● GA4</span>
          <span :style="{ color: sync.clarity ? 'var(--green-normal)' : '#F87171' }">● Clarity</span>
          <span :style="{ color: sync.gtm ? 'var(--green-normal)' : '#F87171' }">● GTM</span>
          <span :style="{ color: sync.leads ? 'var(--green-normal)' : '#F87171' }">● Leads</span>
        </div>
      </div>
      <div class="filters-group">
        <div class="date-badge"><Icon name="clock" :size="14" /> {{ periodLabel }}</div>
      </div>
    </header>

    <div v-if="loading" class="bento-grid">
      <div v-for="i in 4" :key="'sk-'+i" class="bento-card col-3 skeleton-card"><div class="sk-value" style="width:80%;height:34px;"></div></div>
      <div class="bento-card col-12 skeleton-card" style="height:140px;"></div>
    </div>

    <div v-else class="bento-grid fade-in">

      <!-- ===== 1) Funnel Viz ===== -->
      <div class="bento-card col-12 premium-card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <h3 class="card-title"><Icon name="filter" :size="18" style="color: var(--teal-normal);" /> Conversion Funnel</h3>
            <p class="card-desc">Sessions → cta_click → form_start → generate_lead</p>
          </div>
          <span v-if="drops && drops.worst" class="leak-badge"><Icon name="alert-octagon" :size="13" /> BIGGEST LEAK: {{ worstLabel }} · {{ drops.worst }}% drop</span>
        </div>

        <div class="funnel-container" v-if="funnel">
            <!-- 🚀 إضافة خلفية ديناميكية للمسار -->
            <div class="funnel-flow-background"></div>
            
            <div class="funnel-row">
              <div class="f-step"><p class="f-val">{{ funnel.sessions || 0 }}</p><span class="f-lbl">SESSIONS</span></div>
              <div class="f-arrow" :class="{ worst: drops?.worstKey === 1 }">
                <span class="f-rate">{{ funnel.rateCta || 0 }}%</span>
                <span class="f-lost">-{{ drops?.l1 || 0 }} lost</span>
              </div>
              <div class="f-step"><p class="f-val">{{ funnel.cta || 0 }}</p><span class="f-lbl">CTA_CLICK</span></div>
              <div class="f-arrow" :class="{ worst: drops?.worstKey === 2 }">
                <span class="f-rate">{{ funnel.rateForm || 0 }}%</span>
                <span class="f-lost">-{{ drops?.l2 || 0 }} lost</span>
              </div>
              <div class="f-step" :class="{ 'leak-step': drops?.worstKey === 3 }">
                  <!-- 🚀 تأثير نبض للخلفية إذا كان التسريب الأكبر هنا -->
                  <p class="f-val">{{ funnel.form || 0 }}</p><span class="f-lbl">FORM_START</span>
              </div>
              <div class="f-arrow" :class="{ worst: drops?.worstKey === 3 }">
                <span class="f-rate">{{ funnel.rateLead || 0 }}%</span>
                <span class="f-lost">-{{ drops?.l3 || 0 }} lost</span>
              </div>
              <div class="f-step final" @click="navigateTo('/leads')" title="Open Leads CRM">
                <p class="f-val">{{ funnel.leads || 0 }}</p><span class="f-lbl">GENERATE_LEAD ↗</span>
              </div>
            </div>
        </div>
        <div v-else class="zero-mini" style="margin-top: 16px;">Waiting for GA4 Funnel data...</div>

        <!-- Target strip -->
        <div class="target-strip" v-if="funnel">
          <Icon name="trending-up" :size="14" />
          Form completion: <strong>{{ funnel.rateLead || 0 }}%</strong> → Target: <strong>35%</strong> · Re-measure: Oct 15 · Baseline saved Sep 3
        </div>
      </div>

      <!-- ===== 2) Auto Drop-Off Analysis Cards ===== -->
      <div v-for="card in dropCards" :key="card.step" class="bento-card col-4 glow-card" :class="card.sev === 'red' ? 'card-red' : 'card-amber'">
        <div class="insight-icon" :class="card.sev === 'red' ? 'icon-red' : 'icon-amber'">
          <Icon :name="card.sev === 'red' ? 'alert-octagon' : 'alert-triangle'" :size="20" />
        </div>
        <h3 class="insight-title">{{ card.title }}</h3>
        <p class="insight-desc"><strong style="color:#F87171">-{{ card.lost }} users</strong> lost at this step. {{ card.causes }}</p>
        <div class="evidence-chips">
          <button v-for="ev in card.evidence" :key="ev.label" class="ev-chip" @click="navigateTo(ev.to)">
            <Icon name="eye" :size="12" /> {{ ev.label }}
          </button>
        </div>
      </div>

      <!-- ===== 3) Evidence: Form Friction (Clarity) ===== -->
      <div class="bento-card col-6 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="activity" :size="18" style="color:#F87171" /> Form Friction Evidence — Clarity</h3>
          <p class="card-desc">Rage & dead clicks recorded on the Early Access form.</p>
        </div>
        <table v-if="formFriction.length" class="premium-table">
          <thead><tr><th>Element</th><th>Page</th><th class="num-col">R / D</th><th>Priority</th></tr></thead>
          <tbody>
            <tr v-for="row in formFriction" :key="row.id">
              <td style="color:#fff">{{ row.element }}</td>
              <td style="font-family:var(--font-mono);font-size:11.5px">{{ row.path }}</td>
              <td class="num-col"><span style="color:#F87171">{{ row.rage || 0 }}R</span> <span style="color:#FBBF24">{{ row.dead || 0 }}D</span></td>
              <td><span class="badge" :class="row.priority === 'High' ? 'badge-danger' : 'badge-warning'">{{ row.priority }}</span></td>
            </tr>
          </tbody>
        </table>
        
        <!-- 🚀 Empty State المحسنة -->
        <div v-else class="empty-state">
            <Icon name="shield-check" :size="32" style="color:var(--green-normal); margin-bottom: 8px;" /> 
            <p>No form friction logged.</p>
            <span class="empty-desc">Verify form_start coverage in GTM before trusting the drop rate.</span>
        </div>

        <div class="curated-mini" v-if="formSessions.length">
          <div v-for="s in formSessions.slice(0,2)" :key="s.id" class="curated-row">
            <div><strong>{{ s.journey }}</strong><p>{{ s.analyst_note }}</p></div>
            <a :href="s.session_url" target="_blank" class="watch-btn"><Icon name="play" :size="14" /> Watch</a>
          </div>
        </div>
        <button class="open-page-btn" @click="navigateTo('/clarity')">Open Full Clarity Page →</button>
      </div>

      <!-- ===== 4) Evidence: Handoff (GA4) ===== -->
      <div class="bento-card col-6 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="eye" :size="18" style="color:var(--blue-normal)" /> CTA → Form Handoff — GA4</h3>
          <p class="card-desc">How the Early Access page behaves once traffic lands.</p>
        </div>
        <div class="handoff-grid" v-if="earlyPage">
          <div class="h-stat"><span>Page Views</span><strong>{{ earlyPage.views || 0 }}</strong></div>
          <div class="h-stat"><span>Unengaged (bounce)</span><strong :style="{ color: earlyPage.unengagedRate > 50 ? '#F87171' : '#FBBF24' }">{{ earlyPage.unengagedRate || 0 }}%</strong></div>
          <div class="h-stat"><span>Leads from page</span><strong style="color:var(--green-normal)">{{ earlyPage.leads || 0 }}</strong></div>
        </div>
        
        <!-- 🚀 Empty State المحسنة -->
        <div v-else class="empty-state">
            <Icon name="loader" :size="32" style="color:var(--text-tertiary); margin-bottom: 8px;" class="is-spinning" /> 
            <p>Data Pending from GA4...</p>
        </div>
        
        <!-- 🚀 تقسيم النص التوضيحي -->
        <div class="insight-desc" style="margin-top:14px" v-if="earlyPage">
            <ul class="bullet-list">
                <li v-if="earlyPage.unengagedRate > 50">
                    More than half of visitors leave the page without engaging.
                </li>
                <li v-if="earlyPage.unengagedRate > 50">
                    Likely causes: form is below the fold, or message mismatch with CTA.
                </li>
                <li v-else>
                     Engagement on the page is acceptable. The leak is inside the form itself.
                </li>
            </ul>
        </div>
        <button class="open-page-btn" @click="navigateTo('/google-analytics')">Open Full GA4 Page →</button>
      </div>

      <!-- ===== 5) Data Integrity Card (GTM) ===== -->
      <div class="bento-card col-12 glow-card" :class="formStartOk ? '' : 'card-red'">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="insight-icon" :class="formStartOk ? 'icon-green' : 'icon-red'">
              <Icon :name="formStartOk ? 'shield-check' : 'alert-octagon'" :size="20" />
            </div>
            <div>
              <h3 class="insight-title" style="margin:0">Measurement Integrity: <code>form_start</code> — {{ formStartOk ? 'Active · Verified' : 'INACTIVE · NEEDS FIX' }}</h3>
              <p class="insight-desc" style="margin:4px 0 0">
                {{ formStartOk
                  ? `Last audit: ${formatDate(formStartAudit?.audit_date)} · Env: Production. Funnel drop rates are trustworthy.`
                  : `Last audit: ${formatDate(formStartAudit?.audit_date || null)}. The form drop may be INFLATED by missing measurement — fix tracking before optimizing UX.` }}
              </p>
            </div>
          </div>
          <button class="open-page-btn" style="margin:0" @click="navigateTo('/tag-manager')">Open GTM Audit →</button>
        </div>
      </div>

      <!-- ===== 6) Action Plan Board ===== -->
      <div class="bento-card col-12 table-container">
        <div class="card-header">
          <h3 class="card-title"><Icon name="check-circle" :size="18" style="color:var(--teal-normal)" /> Action Plan — Owners & Status</h3>
          <p class="card-desc">Click the status to advance: Open → In Progress → Done.</p>
        </div>
        <table class="premium-table">
          <thead><tr><th>Action</th><th>Owner</th><th>Funnel Step</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="a in actions" :key="a.id" :class="{ 'row-done': a.status === 'Done' }">
              <td style="color:#fff;max-width:420px">{{ a.action }}</td>
              <td><div class="user-cell"><div class="avatar-small">{{ a.owner ? a.owner.charAt(0) : 'U' }}</div>{{ a.owner || 'Unassigned' }}</div></td>
              <td style="font-family:var(--font-mono);font-size:11.5px">{{ a.step }}</td>
              <td style="color:var(--text-tertiary)">{{ a.due }}</td>
              <td><button class="status-cycle" :class="statusClass(a.status)" @click="advanceStatus(a)">{{ a.status }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== 7) Who Converted ===== -->
      <div class="bento-card col-12">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3 class="card-title"><Icon name="users" :size="18" style="color:var(--teal-normal)" /> The Faces Behind generate_lead</h3>
          <button class="open-page-btn" style="margin:0" @click="navigateTo('/leads')">Open Leads CRM →</button>
        </div>
        
        <div class="converted-row avatar-group">
          <div v-for="l in latestLeads" :key="l.id" class="converted-chip" @click="navigateTo('/leads')">
            <div class="avatar-small">{{ l.first_name ? l.first_name.charAt(0).toUpperCase() : 'U' }}</div>
            <div class="converted-details">
              <strong>{{ l.first_name || 'Unknown' }} {{ l.last_name || 'User' }}</strong>
              <span>{{ l.country || 'N/A' }} <em v-if="l.join_beta_testing" style="color:#FBBF24;font-style:normal">★ Beta</em></span>
            </div>
          </div>
          
          <!-- 🚀 Empty State المحسنة -->
          <div v-if="!latestLeads.length" class="empty-state">
              <p>No conversions yet this period.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()
const loading = ref(true)
const periodLabel = ref('Last 30 Days (Dynamic)')

const ga4 = ref(null)
const clarity = ref(null)
const gtm = ref(null)
const leads = ref([])
const frictionLogs = ref([])
const curatedSessions = ref([])
const actions = ref([])
const sync = ref({ ga4: false, clarity: false, gtm: false, leads: false })

/* ===== Funnel math ===== */
const funnel = computed(() => ga4.value?.funnel || null)
const drops = computed(() => {
  const f = funnel.value
  if (!f || !f.sessions) return null 
  
  const d1 = +(100 - (f.rateCta || 0)).toFixed(1)
  const d2 = +(100 - (f.rateForm || 0)).toFixed(1)
  const d3 = +(100 - (f.rateLead || 0)).toFixed(1)
  const worst = Math.max(d1, d2, d3)
  
  return { 
    d1, d2, d3, 
    l1: (f.sessions || 0) - (f.cta || 0), 
    l2: (f.cta || 0) - (f.form || 0), 
    l3: (f.form || 0) - (f.leads || 0), 
    worst, 
    worstKey: worst === d3 ? 3 : worst === d2 ? 2 : 1 
  }
})
const worstLabel = computed(() => ({ 1: 'Sessions → CTA', 2: 'CTA → Form', 3: 'Form Completion' })[drops.value?.worstKey || 3])

/* ===== Rule-based drop cards ===== */
const dropCards = computed(() => {
  const d = drops.value
  if (!d) return []
  const cards = []
  if (d.d3 > 70) cards.push({
    step: 'form→lead', sev: 'red', lost: d.l3,
    title: `Form Completion — ${d.d3}% drop`,
    causes: 'Likely: form length, validation errors, mobile UX, or missing trust signals.',
    evidence: [
      { label: 'Clarity: form friction', to: '/clarity' },
      { label: 'GTM: form_start audit', to: '/tag-manager' },
      { label: 'Leads: who made it', to: '/leads' },
    ],
  })
  if (d.d2 > 50) cards.push({
    step: 'cta→form', sev: 'amber', lost: d.l2,
    title: `CTA → Form handoff — ${d.d2}% drop`,
    causes: 'Likely: CTA target below the fold, message mismatch, or slow page load.',
    evidence: [
      { label: 'GA4: landing page behavior', to: '/google-analytics' },
      { label: 'Clarity: dead clicks on CTA', to: '/clarity' },
    ],
  })
  if (d.d1 > 70) cards.push({
    step: 'sessions→cta', sev: 'amber', lost: d.l1,
    title: `CTA visibility — ${d.d1}% drop`,
    causes: 'Likely: CTA placement or copy weakness on entry pages.',
    evidence: [{ label: 'GA4: cta_click by location', to: '/google-analytics' }],
  })
  return cards
})

/* ===== Cross-source evidence ===== */
const formFriction = computed(() => (frictionLogs.value || []).filter(r => (r.path || '').includes('early-access')).slice(0, 4))
const formSessions = computed(() => (curatedSessions.value || []).filter(s => /form|rage/i.test((s.friction_type || '') + (s.journey || ''))))
const earlyPage = computed(() => (ga4.value?.tables?.landingTable || []).find(r => (r.name || '').includes('early-access')) || null)
const formStartAudit = computed(() => {
  if (!gtm.value || !gtm.value.events) return null;
  return gtm.value.events.find(e => e.event_name === 'form_start') || null;
})
const formStartOk = computed(() => formStartAudit.value?.status?.toLowerCase().includes('active') || false)
const latestLeads = computed(() => [...(leads.value || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5))

/* ===== Actions board ===== */
const statusClass = (s) => s === 'Done' ? 'st-done' : s === 'In Progress' ? 'st-progress' : 'st-open'
const advanceStatus = async (a) => {
  const next = a.status === 'Open' ? 'In Progress' : a.status === 'In Progress' ? 'Done' : 'Open'
  const { error } = await supabase.from('conversion_actions').update({ status: next }).eq('id', a.id)
  if (!error) a.status = next
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Sync'

onMounted(async () => {
  loading.value = true
  
  // 1. جلب بيانات APIs بطريقة آمنة
  try {
    const [g, c, t] = await Promise.allSettled([
      $fetch('/api/ga4').catch(e => { console.error('GA4 API Error:', e); return null; }), 
      $fetch('/api/clarity').catch(e => { console.error('Clarity API Error:', e); return null; }), 
      $fetch('/api/gtm').catch(e => { console.error('GTM API Error:', e); return null; })
    ])
    
    if (g.status === 'fulfilled' && g.value) { ga4.value = g.value; sync.value.ga4 = true }
    if (c.status === 'fulfilled' && c.value) { clarity.value = c.value; sync.value.clarity = true }
    if (t.status === 'fulfilled' && t.value) { gtm.value = t.value; sync.value.gtm = true }
  } catch (apiError) {
    console.error('Error fetching APIs:', apiError)
  }

  // 2. جلب بيانات Supabase بطريقة آمنة
  try {
    const [l, f, s, a] = await Promise.allSettled([
      supabase.from('leads').select('*').limit(10), 
      supabase.from('clarity_friction_log').select('*').order('rage', { ascending: false }).limit(10),
      supabase.from('clarity_sessions').select('*').eq('is_active', true).limit(5),
      supabase.from('conversion_actions').select('*').order('id'),
    ])
    
    if (l.status === 'fulfilled' && l.value.data) { leads.value = l.value.data; sync.value.leads = true }
    if (f.status === 'fulfilled' && f.value.data) frictionLogs.value = f.value.data
    if (s.status === 'fulfilled' && s.value.data) curatedSessions.value = s.value.data
    if (a.status === 'fulfilled' && a.value.data) actions.value = a.value.data
  } catch (dbError) {
    console.error('Error fetching from Supabase:', dbError)
  }

  setTimeout(() => { loading.value = false }, 400)
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

/* 🎨 1. العمق والطبقات (Depth & Glassmorphism) */
.bento-card {
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.05); /* تقليل قسوة الحدود */
  border-top: 1px solid rgba(255, 255, 255, 0.08); /* Inner Glow/Highlight */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* تظليل خفيف لإعطاء عمق */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.fade-in { animation: fadeIn .5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.skeleton-card { background: rgba(255,255,255,.02); display:flex; flex-direction:column; gap:16px; animation: pulseSk 1.5s infinite; }
.sk-value { background: rgba(255,255,255,.08); border-radius: 6px; }
@keyframes pulseSk { 0%,100% { opacity: 1; } 50% { opacity: .5; } }

.system-status { display:flex; align-items:center; font-size:12px; font-family:var(--font-mono); font-weight:500; }

/* 🎨 2. إعادة تصميم الـ Funnel */
.funnel-container {
    position: relative;
    padding: 20px 0;
}

.funnel-flow-background {
    position: absolute;
    top: 50%;
    left: 10%;
    right: 10%;
    height: 4px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
    transform: translateY(-50%);
    z-index: 0;
    border-radius: 2px;
}

.funnel-row { 
    display:flex; 
    align-items:stretch; 
    gap:8px; 
    flex-wrap:wrap; 
    position: relative;
    z-index: 1;
}

.f-step { 
    flex:1; 
    min-width:130px; 
    background:rgba(20, 24, 34, 0.8); /* لون خلفية أغمق لزيادة التباين */
    backdrop-filter: blur(10px);
    border:1px solid rgba(255, 255, 255, 0.08); 
    border-radius:var(--radius-md); 
    padding:24px 16px; 
    text-align:center; 
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.f-step:hover {
    transform: scale(1.02);
    border-color: rgba(255, 255, 255, 0.15);
}

.f-step .f-val { 
    font-size:36px; /* 🚀 أرقام ضخمة */
    font-weight:900; 
    font-family:var(--font-mono); 
    color:#ffffff; 
    margin:0; 
    text-shadow: 0 2px 10px rgba(255,255,255,0.1);
}

.f-step .f-lbl { 
    font-size:10px; 
    letter-spacing: 2px; /* 🚀 تباعد أكبر */
    color:var(--text-tertiary); 
    text-transform:uppercase; 
    display: block;
    margin-top: 8px;
}

.f-step.final { 
    border-color:rgba(0,217,207,.4); 
    background:rgba(0,217,207,.05); 
    cursor:pointer; 
}
.f-step.final .f-val { color:var(--teal-normal); text-shadow: 0 2px 15px rgba(0,217,207,0.3); }

/* 🚀 تظليل التسريب (Leak) */
.leak-step {
    background: radial-gradient(circle, rgba(248,113,113,0.15) 0%, rgba(20,24,34,0.8) 70%);
    border-color: rgba(248,113,113,0.3);
    animation: pulseLeak 2s infinite alternate;
}
@keyframes pulseLeak {
    0% { box-shadow: 0 0 0 0 rgba(248,113,113,0.2); }
    100% { box-shadow: 0 0 15px 5px rgba(248,113,113,0.05); }
}

.f-arrow { display:flex; flex-direction:column; justify-content:center; align-items:center; min-width:74px; gap:4px; }
.f-arrow .f-rate { font-family:var(--font-mono); font-size:14px; font-weight:800; color:var(--teal-normal); }
.f-arrow .f-lost { font-size:11px; color:var(--text-tertiary); font-family:var(--font-mono); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;}
.f-arrow::after { content:'→'; color:var(--text-tertiary); font-size:16px; margin-top: 4px;}
.f-arrow.worst .f-rate { color:#F87171; }
.f-arrow.worst .f-lost { color:#F87171; font-weight:700; background: rgba(248,113,113,0.1); }
.f-arrow.worst::after { color:#F87171; }

/* 🎨 4. لمسات الـ Micro-UI (التفاصيل الصغيرة) */
.leak-badge { 
    display:inline-flex; 
    align-items:center; 
    gap:6px; 
    background:rgba(248,113,113,.1); 
    backdrop-filter: blur(4px); /* خلفية زجاجية */
    border:1px solid rgba(248,113,113,.2); 
    color:#F87171; 
    font-size:11px; 
    font-weight:700; 
    padding:4px 10px; /* أصغر قليلاً */
    border-radius:100px; 
    letter-spacing:.04em; 
}

.target-strip { margin-top:20px; display:flex; align-items:center; gap:8px; background:rgba(0,217,207,.05); border:1px dashed rgba(0,217,207,.2); border-radius:var(--radius-sm); padding:12px 16px; font-size:13px; color:var(--text-secondary); font-family:var(--font-mono); }
.target-strip strong { color:var(--teal-normal); }

/* 🎨 3. كروت التنبيهات (Red / Amber Cards) */
.glow-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.05) !important; /* إزالة الحدود الملونة الصلبة */
}

.card-red::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(248,113,113,0.15) 0%, rgba(248,113,113,0) 70%);
    z-index: 0;
}

.card-amber::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0) 70%);
    z-index: 0;
}

.glow-card > * { position: relative; z-index: 1; }

.icon-green { color:var(--green-normal); background:transparent; }
.icon-red { color:#F87171; background:transparent; }
.icon-amber { color:#FBBF24; background:transparent; }
.insight-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:flex-start; margin-bottom:12px; }
.insight-title { font-size:16px; font-weight:700; color:#fff; margin:0 0 8px; letter-spacing: -0.02em;}
.insight-desc { font-size:13.5px; color:var(--text-secondary); line-height:1.6; margin:0; }

/* 🚀 تقسيم النص التوضيحي */
.bullet-list {
    margin: 0;
    padding-left: 20px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.6;
}
.bullet-list li { margin-bottom: 4px; }

.evidence-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
.ev-chip { display:inline-flex; align-items:center; gap:6px; background:rgba(6,144,249,.05); border:1px solid rgba(6,144,249,.2); color:var(--blue-normal); font-size:11.5px; font-weight:600; padding:6px 12px; border-radius:100px; cursor:pointer; transition:all .2s ease; }
.ev-chip:hover { background:rgba(6,144,249,.15); transform:translateY(-2px); box-shadow: 0 4px 10px rgba(6,144,249,0.1); }

/* Evidence panels */
.handoff-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:16px; }
.h-stat { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-sm); padding:16px; display:flex; flex-direction:column; gap:8px; }
.h-stat span { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--text-tertiary); }
.h-stat strong { font-size:24px; font-family:var(--font-mono); color:#fff; font-weight: 800;}

/* 🎨 5. الـ Empty States */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    text-align: center;
    background: rgba(255,255,255,0.01);
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: var(--radius-sm);
    margin-top: 16px;
}
.empty-state p { color: #fff; font-size: 14px; font-weight: 600; margin: 0 0 4px 0; }
.empty-state .empty-desc { color: var(--text-tertiary); font-size: 12.5px; }

.zero-mini { display:flex; align-items:center; justify-content: center; gap:10px; padding:18px; color:var(--text-secondary); font-size:13px; background:rgba(255,255,255,.01); border:1px dashed var(--border-subtle); border-radius:var(--radius-sm); margin-top:14px; }

.curated-mini { display:flex; flex-direction:column; gap:10px; margin-top:14px; }
.curated-row { display:flex; justify-content:space-between; align-items:center; gap:14px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-sm); padding:12px 14px; transition: transform 0.2s ease;}
.curated-row:hover { transform: translateX(4px); border-color: rgba(255,255,255,0.1); }
.curated-row strong { color:#fff; font-size:13px; }
.curated-row p { margin:4px 0 0; font-size:12px; color:var(--text-secondary); }
.watch-btn { display:inline-flex; align-items:center; gap:6px; background:var(--blue-normal); color:#fff; padding:8px 16px; border-radius:100px; font-size:12px; font-weight:600; text-decoration:none; flex-shrink:0; transition: background 0.2s; }
.watch-btn:hover { background: #3b82f6; }

.open-page-btn { margin-top:20px; background:transparent; border:1px solid rgba(0,217,207,0.2); color:var(--teal-normal); font-size:12px; font-weight:700; padding:10px 18px; border-radius:100px; cursor:pointer; transition:all .2s ease; }
.open-page-btn:hover { border-color:var(--teal-normal); background:rgba(0,217,207,.08); box-shadow: 0 4px 12px rgba(0,217,207,0.15);}

/* Actions board */
.status-cycle { font-family:var(--font-mono); font-size:11px; font-weight:700; padding:6px 14px; border-radius:100px; cursor:pointer; border:1px solid; transition:all .2s ease; }
.status-cycle:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(255,255,255,0.05);}
.st-open { color:#F87171; border-color:rgba(248,113,113,.2); background:rgba(248,113,113,.05); }
.st-progress { color:#FBBF24; border-color:rgba(251,191,36,.2); background:rgba(251,191,36,.05); }
.st-done { color:var(--green-normal); border-color:rgba(33,196,94,.2); background:rgba(33,196,94,.05); }
.row-done td { opacity:.3; }

/* 🎨 4. وجوه المستخدمين (Avatars) */
.avatar-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.converted-row { margin-top:16px; }
.converted-chip { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-md); padding:12px 18px; cursor:pointer; transition:all .2s ease; }
.converted-chip:hover { border-color:rgba(0,217,207,.3); background: rgba(0,217,207,0.02); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2);}
.converted-chip strong { display:block; color:#fff; font-size:13.5px; margin-bottom: 2px;}
.converted-chip span { font-size:11.5px; color:var(--text-tertiary); }

.user-cell { display:flex; align-items:center; gap:10px; color:#fff; font-size:13px; font-weight: 500;}
.avatar-small { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--teal-normal),var(--blue-normal)); color:#000; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; flex-shrink:0; box-shadow: 0 2px 6px rgba(0,0,0,0.3);}

/* 🎨 الجداول */
.premium-table { width:100%; border-collapse:separate; border-spacing: 0; font-size:13.5px; margin-top:16px; }
.premium-table th { font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--text-tertiary); text-align:left; padding:16px 14px; border-bottom:1px solid rgba(255,255,255,0.05); }
.premium-table td { padding:16px 14px; border-bottom:1px solid rgba(255,255,255,.02); color:var(--text-secondary); vertical-align:middle; transition: background 0.3s ease;}
.premium-table tbody tr:hover td { background: rgba(255,255,255,0.02); } /* Hover Effect */
.num-col { font-family:var(--font-mono); }
.badge { padding:4px 12px; border-radius:100px; font-size:10.5px; font-weight:700; }
.badge-danger { background:rgba(248,113,113,.1); color:#F87171; border:1px solid rgba(248,113,113,.2); }
.badge-warning { background:rgba(251,191,36,.1); color:#FBBF24; border:1px solid rgba(251,191,36,.2); }

@media (max-width: 1100px) { .col-4, .col-6 { grid-column: span 12; } }
</style>