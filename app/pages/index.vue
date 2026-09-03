<template>
  <div>
    <!-- 1. TopBar - Trust & Context -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="command" :size="24" style="color: var(--teal-normal);" /> Qompyl Analytics OS</h1>
        <p>Real-time observability across SEO visibility, tracking governance, and UX behavioral friction.</p>
        <div class="system-status">
          <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
          <span :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
            {{ loading ? 'Syncing securely with database...' : 'All systems operational & synced' }}
          </span>
        </div>
      </div>
      <!-- الفلاتر يتم قفلها (Disabled) وتبهيت لونها أثناء التحميل -->
      <div class="filters-group" :class="{ 'disabled-filters': loading }">
        <div class="date-badge">
          <Icon name="calendar" :size="14" /> August 2026 (Baseline)
        </div>
        <button class="action-btn primary" @click="exportReport" :disabled="loading">
          <Icon name="download" :size="14" /> Export Report
        </button>
      </div>
    </header>

    <!-- 🌟 Skeleton Loading State (Enterprise UX) -->
    <div v-if="loading" class="bento-grid">
      <!-- Skeleton Pulse Row -->
      <div class="col-12 pulse-row">
        <div v-for="i in 5" :key="'sk-pulse-'+i" class="bento-card scorecard mini skeleton-card">
          <div class="sk-title" style="width: 50%;"></div>
          <div class="sk-value" style="width: 80%; height: 28px; margin-top: 10px;"></div>
        </div>
      </div>
      <!-- Skeleton Chips -->
      <div class="col-12 chips-container">
        <div v-for="i in 4" :key="'sk-chip-'+i" class="q-chip skeleton-card" style="width: 180px; height: 38px; padding: 0;"></div>
      </div>
      <!-- Skeleton Insights & Memo -->
      <div class="col-8 layout-column">
        <div class="section-header"><div class="sk-title" style="width: 30%; height: 16px;"></div></div>
        <div class="insights-grid">
          <div v-for="i in 3" :key="'sk-insight-'+i" class="bento-card insight-card skeleton-card" style="height: 88px;"></div>
        </div>
      </div>
      <div class="col-4">
         <div class="bento-card skeleton-card" style="height: 100%; min-height: 300px;"></div>
      </div>
      <!-- Skeleton Decision Board -->
      <div class="col-12 bento-card skeleton-card" style="height: 250px;"></div>
    </div>

    <!-- 🚀 Dashboard Content (Live Data) يظهر بـ Fade-in Animation -->
    <div v-else class="bento-grid fade-in">

      <!-- 2. GROWTH PULSE -->
      <div class="col-12 pulse-row">
        <!-- Highlighted Card: تمييز بصري لأهم مقياس -->
        <div class="bento-card scorecard mini highlight-card">
          <span class="score-title" style="color: var(--teal-normal);">Total Leads</span>
          <div class="score-main">
            <p class="score-value" style="color: var(--teal-normal);">142</p>
            <span class="baseline-badge highlight-badge">Baseline Month</span>
          </div>
        </div>
        <div class="bento-card scorecard mini">
          <span class="score-title">Active Users</span>
          <div class="score-main">
            <p class="score-value">8,420</p>
            <span class="baseline-badge muted">Baseline Month</span>
          </div>
        </div>
        <div class="bento-card scorecard mini">
          <span class="score-title">Organic Clicks</span>
          <div class="score-main">
            <p class="score-value" style="color: var(--blue-normal);">36</p>
            <span class="baseline-badge muted">Baseline Month</span>
          </div>
        </div>
        <div class="bento-card scorecard mini">
          <span class="score-title">Lead CVR</span>
          <div class="score-main">
            <p class="score-value">1.6%</p>
            <span class="baseline-badge muted">Baseline Month</span>
          </div>
        </div>
        <div class="bento-card scorecard mini">
          <span class="score-title">Avg. Position</span>
          <div class="score-main">
            <p class="score-value">12.4</p>
            <span class="baseline-badge muted">Baseline Month</span>
          </div>
        </div>
      </div>

      <!-- 3. Question Chips -->
      <div class="col-12 chips-container">
        <NuxtLink to="/ga4" class="q-chip">
          <Icon name="users" :size="14" /> Who's coming from where?
        </NuxtLink>
        <NuxtLink to="/search-console" class="q-chip">
          <Icon name="search" :size="14" /> How does Google see us?
        </NuxtLink>
        <NuxtLink to="/clarity" class="q-chip">
          <Icon name="mouse-pointer" :size="14" /> Where do users struggle?
        </NuxtLink>
        <NuxtLink to="/gtm" class="q-chip">
          <Icon name="shield-check" :size="14" /> Can we trust the data?
        </NuxtLink>
      </div>

      <!-- 4. Auto Insights (Live API logic placeholder) -->
      <div class="col-8 layout-column">
        <div class="section-header">
          <h2 class="section-title"><Icon name="zap" :size="18" style="color: #FBBF24;" /> Live Auto-Insights</h2>
        </div>
        <div class="insights-grid">
          <div class="bento-card insight-card">
            <div class="insight-icon icon-emerald"><Icon name="trending-up" :size="18" /></div>
            <div>
              <h3 class="insight-title">SEO Growth Engine</h3>
              <p class="insight-desc">Non-branded queries are gaining traction on page two. Optimizing meta tags will accelerate conversion.</p>
            </div>
          </div>
          <div class="bento-card insight-card">
            <div class="insight-icon icon-red"><Icon name="alert-octagon" :size="18" /></div>
            <div>
              <h3 class="insight-title">Friction Detected</h3>
              <p class="insight-desc">High rage clicks (105) detected on the product demo video. Immediate UI patch recommended.</p>
            </div>
          </div>
          <div class="bento-card insight-card">
            <div class="insight-icon icon-amber"><Icon name="shield-check" :size="18" /></div>
            <div>
              <h3 class="insight-title">Tracking Integrity</h3>
              <p class="insight-desc">Core conversion event (generate_lead) is verified and firing accurately via GTM.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 📝 Live Data from Supabase: Analyst Memo -->
      <div class="col-4">
        <div class="bento-card memo-card" v-if="latestMemo">
          <div class="memo-header">
            <div class="memo-title-group">
              <Icon name="pen-tool" :size="18" />
              <h3>{{ latestMemo.title }}</h3>
            </div>
            <span class="memo-date">{{ formatDate(latestMemo.publish_date) }}</span>
          </div>
          <div class="memo-content">
            <p><strong>The TL;DR:</strong> {{ latestMemo.tldr_text }}</p>
            <ul class="memo-bullets">
              <li v-for="(bullet, index) in latestMemo.bullets" :key="index">{{ bullet }}</li>
            </ul>
          </div>
          <div class="memo-footer">
            <div class="analyst-info">
              <div class="avatar">{{ latestMemo.avatar_letter }}</div>
              <div>
                <p class="name">{{ latestMemo.author_name }}</p>
                <p class="role">{{ latestMemo.author_role }}</p>
              </div>
            </div>
            <div class="next-read">Next read: {{ formatDate(latestMemo.next_read_date) }}</div>
          </div>
        </div>
        <!-- Fallback if no memo exists -->
        <div v-else class="bento-card memo-card" style="display: flex; align-items: center; justify-content: center;">
          <p style="color: var(--text-tertiary);">No memos published yet.</p>
        </div>
      </div>

      <!-- 🎯 Live Data from Supabase: Decision Board -->
      <div class="col-12 bento-card decision-board">
        <div class="card-header">
          <h3 class="card-title"><Icon name="check-square" :size="18" /> Decision &amp; Action Board</h3>
          <p class="card-desc">Translating insights into accountability and product updates.</p>
        </div>
        <div class="decision-list">
          <div v-for="decision in decisionsList" :key="decision.id" class="decision-item">
            <div class="d-main">
              <h4>{{ decision.task_title }}</h4>
              <span class="d-reason">Reason: {{ decision.reason }}</span>
            </div>
            <div class="d-meta">
              <div class="d-owner">
                <div class="avatar-small" :style="{ background: decision.owner_color || 'var(--teal-normal)' }">
                  {{ decision.owner_initial }}
                </div> 
                {{ decision.owner_name }}
              </div>
              <span class="badge" :class="getBadgeClass(decision.status)">{{ decision.status }}</span>
            </div>
          </div>
          <!-- Fallback if empty -->
          <div v-if="decisionsList.length === 0" style="text-align: center; padding: 20px; color: var(--text-tertiary);">
            No active decisions recorded.
          </div>
        </div>
      </div>

      <!-- 6. Platform Health & Modules -->
      <div class="col-12 table-container bento-card">
        <div class="card-header">
          <h3 class="card-title"><Icon name="server" :size="18" /> Platform Health &amp; Modules</h3>
          <p class="card-desc">System synchronization status and quick deep-links.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Core Function</th>
              <th>Health / Sync Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600; color: #fff;"><Icon name="search" :size="14" style="margin-right:6px; color: var(--blue-normal);"/> Search Console</td>
              <td style="color: var(--text-secondary);">How Google indexes and ranks our pages.</td>
              <td><span class="sync-status good"><span class="dot"></span> Synced 2h ago</span></td>
              <td><NuxtLink to="/search-console" class="table-link">Open →</NuxtLink></td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #fff;"><Icon name="mouse-pointer" :size="14" style="margin-right:6px; color: var(--teal-normal);"/> MS Clarity</td>
              <td style="color: var(--text-secondary);">Where users experience UI/UX friction.</td>
              <td><span class="sync-status good"><span class="dot"></span> Synced 1d ago</span></td>
              <td><NuxtLink to="/clarity" class="table-link">Open →</NuxtLink></td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #fff;"><Icon name="shield-check" :size="14" style="margin-right:6px; color: #FBBF24;"/> Tag Manager</td>
              <td style="color: var(--text-secondary);">Tracking governance and pixel ecosystem.</td>
              <td><span class="sync-status good"><span class="dot"></span> v14.0 Live</span></td>
              <td><NuxtLink to="/gtm" class="table-link">Open →</NuxtLink></td>
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
const loading = ref(true)

// متغيرات البيانات الحية
const latestMemo = ref(null)
const decisionsList = ref([])

onMounted(async () => {
  loading.value = true
  try {
    // 1. جلب أحدث مذكرة من جدول analyst_memos
    const { data: memoData, error: memoErr } = await supabase
      .from('analyst_memos')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()
      
    if (memoData) latestMemo.value = memoData
    if (memoErr && memoErr.code !== 'PGRST116') console.error('Memo Fetch Error:', memoErr)

    // 2. جلب القرارات من جدول decisions_board
    const { data: decisionsData, error: decErr } = await supabase
      .from('decisions_board')
      .select('*')
      .order('created_at', { ascending: false })

    if (decisionsData) decisionsList.value = decisionsData
    if (decErr) console.error('Decisions Fetch Error:', decErr)

  } catch (error) {
    console.error('Unexpected error fetching data:', error)
  } finally {
    // تأخير وهمي بسيط (نصف ثانية) لتشعر الإدارة بسلاسة الأنيميشن وتأثير الـ Skeleton
    setTimeout(() => { loading.value = false }, 500)
  }
})

// دالة تنسيق التواريخ
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// دالة تحديد ألوان بادجات المهام
const getBadgeClass = (status) => {
  if (status === 'In Progress') return 'badge-progress'
  if (status === 'Open') return 'badge-open'
  if (status === 'Done') return 'badge-done'
  return 'badge-open' // الافتراضي
}

// في قسم <script setup> في ملف index.vue
const exportReport = () => {
  // 1. يمكنك إضافة أي منطق تحضيري هنا (مثل إخفاء عناصر معينة قبل الطباعة)
  
  // 2. استدعاء نافذة الطباعة
  window.print();
  
  // 3. اختياري: إضافة إشعار (Toast) إذا كان لديك نظام إشعارات مفعل في هذه الصفحة
  console.log('Executive report export initiated.');
}

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
.sk-title { height: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
.sk-value { background: rgba(255, 255, 255, 0.08); border-radius: 6px; }
@keyframes pulseSk { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Highlight Card Style (لتمييز الـ Total Leads) */
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

/* Header Additions */
.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-top: 8px; font-family: var(--font-mono); font-weight: 500;}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.green { background: var(--green-normal); box-shadow: 0 0 8px rgba(33, 196, 94, 0.4); }
.date-badge { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 6px 12px; border-radius: 100px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

/* Pulse Row (5 Columns) */
.pulse-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
.scorecard.mini { padding: 18px 20px; }
.scorecard.mini .score-value { font-size: 28px; }

/* Question Chips */
.chips-container { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.q-chip {
  background: rgba(17, 22, 31, 0.6); border: 1px solid var(--border-subtle);
  color: var(--text-secondary); padding: 10px 18px; border-radius: 100px;
  font-size: 13px; font-weight: 500; text-decoration: none;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;
}
.q-chip:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: var(--border-hover); transform: translateY(-1px); }

/* Auto Insights */
.layout-column { display: flex; flex-direction: column; gap: 16px; }
.section-header { padding-bottom: 4px; }
.section-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; }
.insights-grid { display: flex; flex-direction: column; gap: 16px; }
.insight-card { display: flex; flex-direction: row; align-items: flex-start; gap: 16px; padding: 20px; }
.insight-icon { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.icon-emerald { color: var(--green-normal); background: rgba(33, 196, 94, 0.08); border-color: rgba(33, 196, 94, 0.15); }
.icon-red { color: #F87171; background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.15); }
.icon-amber { color: #FBBF24; background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.15); }
.insight-title { font-size: 14px; font-weight: 600; margin: 0 0 6px 0; }
.insight-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; }

/* Analyst Memo */
.memo-card {
  background: linear-gradient(180deg, rgba(17, 22, 31, 1) 0%, rgba(0, 217, 207, 0.02) 100%);
  border-color: rgba(0, 217, 207, 0.2); height: 100%; justify-content: space-between;
}
.memo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.memo-title-group { display: flex; align-items: center; gap: 8px; color: var(--teal-normal); }
.memo-title-group h3 { margin: 0; font-size: 15px; font-weight: 600; }
.memo-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.memo-content p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-top: 0; }
.memo-bullets { padding-left: 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
.memo-bullets li { margin-bottom: 6px; }
.memo-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
.analyst-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), var(--blue-normal)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.analyst-info .name { font-size: 13px; font-weight: 600; color: #fff; margin: 0; }
.analyst-info .role { font-size: 11px; color: var(--text-tertiary); margin: 2px 0 0 0; }
.next-read { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }

/* Decision Board */
.decision-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.decision-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}
.d-main h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 500; color: #fff; }
.d-reason { font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono); }
.d-meta { display: flex; align-items: center; gap: 24px; }
.d-owner { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
.avatar-small { width: 20px; height: 20px; border-radius: 50%; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; }
.badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-progress { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }
.badge-open { background: rgba(248, 113, 113, 0.1); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.2); }
.badge-done { background: rgba(33, 196, 94, 0.1); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.2); }

/* Table & Health Modules */
.table-container { padding: 20px 24px 24px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); padding: 12px; border-bottom: 1px solid var(--border-subtle); }
td { padding: 16px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }
.sync-status { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; }
.sync-status.good { color: var(--green-normal); }
.sync-status .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 6px currentColor; }
.table-link { color: var(--blue-normal); font-weight: 600; text-decoration: none; }
.table-link:hover { text-decoration: underline; }

.action-btn.primary { background: var(--teal-normal); color: #000; border: none; padding: 8px 16px; border-radius: 100px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s ease; }
.action-btn.primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0, 217, 207, 0.3); }

/* Responsive */
@media (max-width: 1200px) { .pulse-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { 
  .pulse-row { grid-template-columns: repeat(2, 1fr); }
  .col-8, .col-4 { grid-column: span 12; }
  .decision-item { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (max-width: 600px) { .pulse-row { grid-template-columns: 1fr; } }

/* 🚀 Print Styles for PDF Export (Optimized for A4) */
@media print {
  /* 1. إخفاء العناصر غير المطلوبة (القائمة الجانبية، الأزرار، والروابط) */
  .sidebar, 
  .action-btn,
  .q-chip,
  .table-link {
    display: none !important;
  }

  /* إخفاء عمود الـ Action بالكامل من الجدول (الرأس والخلية) */
  th:last-child, 
  td:last-child {
    display: none !important;
  }

  /* 2. إعادة ضبط الصفحة بالكامل وإلغاء الـ Layout الأساسي */
  body, 
  .layout-wrapper, 
  .main-content {
    background: #fff !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important; /* إلغاء الـ Flex الأساسي */
  }

  /* 3. إلغاء الـ CSS Grid القاتل للطباعة */
  .bento-grid {
    display: block !important;
  }

  /* 4. جعل كل الكروت تأخذ عرض الصفحة بالكامل لتجنب تداخل النصوص */
  .col-8, .col-4, .col-12 {
    width: 100% !important;
    display: block !important;
    margin-bottom: 24px !important;
  }

  /* 5. تصميم الكروت (Bento Cards) للطباعة */
  .bento-card {
    background: transparent !important;
    border: 1px solid #e2e8f0 !important; /* حدود رمادية فاتحة جداً */
    box-shadow: none !important;
    break-inside: avoid !important; /* 🚀 منع انقسام الكارت بين صفحتين */
    page-break-inside: avoid !important;
    margin-bottom: 24px !important;
  }

  /* 6. حل مشكلة الـ KPIs (Pulse Row) */
  .pulse-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 15px !important;
  }
  .scorecard.mini {
    width: calc(33.333% - 10px) !important; /* عرض 3 كروت في السطر بدلاً من 5 */
    margin-bottom: 0 !important;
    padding: 16px !important;
    flex-grow: 1;
  }

  /* 7. إجبار الألوان (Badges & Icons) على الطباعة بدقة */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 8. توحيد ألوان النصوص بالأسود والرمادي الداكن للقراءة */
  h1, h2, h3, h4, .score-title, .insight-title, .card-title, th {
    color: #111 !important;
  }
  
  .score-value {
    color: #000 !important;
    -webkit-text-fill-color: #000 !important; /* إزالة التدرج اللوني الذي يشوه الطباعة */
    font-size: 24px !important; /* تصغير الأرقام قليلاً لتناسب الورق */
  }

  p, td, .desc, .text-secondary, .text-tertiary {
    color: #333 !important;
  }

  /* 9. تحسين شكل جدول القرارات لتجنب تداخل النص */
  .decision-item {
    break-inside: avoid !important;
    border: 1px solid #f1f5f9 !important;
    align-items: flex-start !important; /* محاذاة لليسار بدلاً من الوسط */
  }

  /* إعدادات حجم الورقة (A4) وهوامشها */
  @page {
    size: A4 portrait;
    margin: 1.5cm;
  }
}
</style>