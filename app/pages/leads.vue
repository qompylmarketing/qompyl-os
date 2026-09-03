<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="users" :size="24" style="color: var(--teal-normal);" /> Early Access Leads</h1>
        <p>Manage, filter, and export your waitlist sign-ups directly from the Webflow marketing site.</p>
        <div class="system-status" style="margin-top: 8px;">
           <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
           <span :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
             {{ loading ? 'Syncing securely with database...' : 'Database Synced' }}
           </span>
        </div>
      </div>
      
      <!-- Export Action & Total -->
      <!-- Export Action & Total -->
      <div class="filters-group">
        <div class="date-badge">
          <Icon name="users" :size="14" /> Showing: {{ filteredLeads.length }}
        </div>
        <!-- 🚀 الزر الجديد: تصدير الإيميلات فقط -->
        <button class="action-btn secondary" @click="exportEmailsToCSV" :disabled="loading || filteredLeads.length === 0">
          <Icon name="mail" :size="14" /> Export Emails
        </button>
        <!-- 🚀 تصدير البيانات الكاملة -->
        <button class="action-btn primary" @click="exportToCSV" :disabled="loading || filteredLeads.length === 0">
          <Icon name="download" :size="14" /> Export Full CSV
        </button>
      </div>
    </header>

    <!-- 🚀 Stats Row (Executive Summary) -->
    <div v-if="!loading && allLeads.length > 0" class="bento-grid fade-in" style="margin-bottom: 20px;">
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Total Leads</span>
        <div class="score-main">
          <p class="score-value">{{ globalStats.total }}</p>
          <span class="eval-badge eval-good"><Icon name="trending-up" :size="12" /> All time</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard highlight-card">
        <span class="score-title" style="color: var(--teal-normal);">Leads This Week</span>
        <div class="score-main">
          <p class="score-value highlight-text">+{{ globalStats.thisWeek }}</p>
          <span class="eval-badge eval-warning"><Icon name="clock" :size="12" /> Last 7 days</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Beta Opt-in Rate</span>
        <div class="score-main">
          <p class="score-value">{{ globalStats.betaPct }}%</p>
          <span class="eval-badge eval-good"><Icon name="star" :size="12" /> High Intent</span>
        </div>
      </div>
      <div class="bento-card col-3 scorecard">
        <span class="score-title">Top Country</span>
        <div class="score-main">
          <p class="score-value" style="font-size: 24px; -webkit-text-fill-color: #fff;">{{ globalStats.topCountry }}</p>
          <span class="eval-badge eval-neutral"><Icon name="globe" :size="12" /> Demographics</span>
        </div>
      </div>
    </div>

    <!-- 🚀 Advanced Filters Bar with Search -->
    <div class="bento-card col-12 filter-bar lead-filter-bar">
      <!-- Search Box -->
      <div class="filter-item search-box-container">
        <label>Search Leads</label>
        <div class="search-input-wrap">
          <Icon name="search" :size="14" class="search-icon" />
          <input type="text" v-model="searchQuery" @input="applyFilters" placeholder="Name or email address...">
        </div>
      </div>

      <div class="filter-item">
        <label>Experience Level</label>
        <select v-model="filters.experience" @change="applyFilters">
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
          <option value="Professional">Professional</option>
        </select>
      </div>
      <div class="filter-item">
        <label>Age Range</label>
        <select v-model="filters.age" @change="applyFilters">
          <option value="all">All Ages</option>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55-64">55-64</option>
          <option value="65+">65+</option>
        </select>
      </div>
      <div class="filter-item">
        <label>Country</label>
        <select v-model="filters.country" @change="applyFilters">
          <option value="all">All Countries</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
        </select>
      </div>
      <div class="filter-item checkbox-filter">
        <label>
          <input type="checkbox" v-model="filters.betaOnly" @change="applyFilters"> 
          Beta Testers Only
        </label>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="bento-grid" style="margin-top: 20px;">
      <div class="bento-card col-12 skeleton-card" style="height: 400px;"></div>
    </div>

    <!-- Leads Table -->
    <div v-else class="bento-grid fade-in" style="margin-top: 20px;">
      <div class="bento-card col-12 table-container">
        <table>
          <thead>
            <tr>
              <th>Lead Profile</th>
              <th>Email Address</th>
              <th>Experience & Age</th>
              <th>Strategies (Interests)</th>
              <th>Country</th>
              <th>Beta?</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in filteredLeads" :key="lead.id">
              <!-- Profile -->
              <td style="color:#fff; font-weight: 500;">
                <div class="user-cell">
                  <div class="avatar-small">{{ lead.first_name.charAt(0).toUpperCase() }}</div>
                  {{ lead.first_name }} {{ lead.last_name }}
                </div>
              </td>
              <!-- Email with Copy Button -->
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <a :href="`mailto:${lead.email}`" class="email-link" title="Send Email">{{ lead.email }}</a>
                  <button class="copy-btn" @click="copyEmail(lead.email)" title="Copy to clipboard">
                    <Icon name="copy" :size="12" />
                  </button>
                </div>
              </td>
              <!-- Demographics -->
              <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 12px; color: #fff;">{{ lead.experience_level || 'N/A' }}</span>
                  <span style="font-size: 11px; color: var(--text-tertiary);">Age: {{ lead.age_range || 'N/A' }}</span>
                </div>
              </td>
              <!-- Strategies (Multi-select) -->
              <td style="max-width: 200px;">
                <div class="strategies-wrap" v-if="lead.strategies">
                  <span v-for="(strat, i) in lead.strategies.split(',')" :key="i" class="strat-chip">{{ strat.trim() }}</span>
                </div>
                <span v-else style="color: var(--text-tertiary); font-size: 11px;">Not specified</span>
              </td>
              <!-- Country -->
              <td style="color: var(--text-secondary); font-size: 12.5px;">{{ lead.country || 'N/A' }}</td>
              <!-- Beta Status -->
              <td>
                <span v-if="lead.join_beta_testing" class="badge badge-beta"><Icon name="star" :size="10" /> Beta</span>
                <span v-else style="color: var(--text-tertiary); font-size: 11px;">No</span>
              </td>
              <!-- Date -->
              <td style="color: var(--text-tertiary); font-size: 11.5px; font-family: var(--font-mono);">
                {{ formatDate(lead.created_at) }}
              </td>
            </tr>
            <tr v-if="filteredLeads.length === 0">
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                No leads match your current search or filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🚀 Toast Notifications Container -->
    <div class="toast-container">
      <transition-group name="toast-slide">
        <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="`toast-${toast.type}`">
          <Icon :name="toast.icon" :size="18" class="toast-icon" />
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click="removeToast(toast.id)"><Icon name="x" :size="14" /></button>
        </div>
      </transition-group>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()
const allLeads = ref([])
const filteredLeads = ref([])
const loading = ref(true)

// Filters State
const searchQuery = ref('')
const filters = ref({
  experience: 'all',
  age: 'all',
  country: 'all',
  betaOnly: false
})

// 🚀 Toast Management System
const toasts = ref([])
let toastCounter = 0
const showToast = (title, message, type = 'success') => {
  const id = toastCounter++
  const icon = type === 'success' ? 'check-circle' : 'info'
  toasts.value.push({ id, title, message, type, icon })
  setTimeout(() => removeToast(id), 3500)
}
const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

// استخراج الدول المتاحة ديناميكياً للفلاتر
const uniqueCountries = computed(() => {
  const countries = allLeads.value.map(l => l.country).filter(c => c)
  return [...new Set(countries)].sort()
})

// 🚀 حسابات شريط الإحصائيات (Stats Row)
const globalStats = computed(() => {
  const total = allLeads.value.length;
  if (total === 0) return { total: 0, thisWeek: 0, betaPct: 0, topCountry: 'N/A' };

  // حساب ليدات هذا الأسبوع (آخر 7 أيام)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = allLeads.value.filter(l => new Date(l.created_at) >= oneWeekAgo).length;

  // نسبة البيتا
  const betaCount = allLeads.value.filter(l => l.join_beta_testing).length;
  const betaPct = ((betaCount / total) * 100).toFixed(0);

  // أعلى دولة
  const countryCounts = {};
  let topCountry = 'N/A';
  let maxCount = 0;
  allLeads.value.forEach(l => {
    if (l.country) {
      countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
      if (countryCounts[l.country] > maxCount) {
        maxCount = countryCounts[l.country];
        topCountry = l.country;
      }
    }
  });

  return { total, thisWeek, betaPct, topCountry };
})

const fetchLeads = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (data) {
      allLeads.value = data
      applyFilters()
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  const q = searchQuery.value.toLowerCase().trim()
  
  filteredLeads.value = allLeads.value.filter(lead => {
    // 🚀 تطبيق البحث بالاسم أو الإيميل
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase()
    const email = (lead.email || '').toLowerCase()
    const matchSearch = !q || fullName.includes(q) || email.includes(q)

    const matchExp = filters.value.experience === 'all' || lead.experience_level === filters.value.experience
    const matchAge = filters.value.age === 'all' || lead.age_range === filters.value.age
    const matchCountry = filters.value.country === 'all' || lead.country === filters.value.country
    const matchBeta = !filters.value.betaOnly || lead.join_beta_testing === true
    
    return matchSearch && matchExp && matchAge && matchCountry && matchBeta
  })
}

const exportToCSV = () => {
  const headers = ['First Name', 'Last Name', 'Email', 'Experience', 'Age Range', 'Country', 'Strategies', 'Beta Tester', 'Registration Date']
  const csvRows = filteredLeads.value.map(lead => [
    `"${lead.first_name}"`,
    `"${lead.last_name}"`,
    `"${lead.email}"`,
    `"${lead.experience_level || ''}"`,
    `"${lead.age_range || ''}"`,
    `"${lead.country || ''}"`,
    `"${lead.strategies || ''}"`,
    lead.join_beta_testing ? 'Yes' : 'No',
    `"${new Date(lead.created_at).toISOString()}"`
  ])
  
  let csvContent = [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `Qompyl_Filtered_Leads_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyEmail = async (email) => {
  try {
    await navigator.clipboard.writeText(email)
    showToast('Email Copied', `${email} copied to clipboard!`, 'success')
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchLeads()
})

const exportEmailsToCSV = () => {
  // عمود واحد فقط
  const headers = ['Email']
  
  // جلب الإيميلات فقط من الليدات المفلترة
  const csvRows = filteredLeads.value.map(lead => [
    `"${lead.email}"`
  ])
  
  let csvContent = [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `Qompyl_Emails_Only_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // إشعار نجاح العملية لتجربة مستخدم أفضل
  showToast('Export Successful', 'Emails list exported successfully for campaigns.', 'success')
}
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}

/* 🚀 Scorecard Styles (Stats Row) */
.col-3 { grid-column: span 3; }
.scorecard { padding: 22px 24px; justify-content: space-between; background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005)); }
.scorecard .score-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); margin-bottom: 12px; display: block; }
.scorecard .score-main { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.scorecard .score-value {
  font-size: 34px; font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.5px;
  line-height: 1; background: var(--gradient-primary); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
}
.highlight-card {
  background: linear-gradient(135deg, rgba(0, 217, 207, 0.08), rgba(255, 255, 255, 0.005)) !important;
  border-color: rgba(0, 217, 207, 0.3) !important;
  box-shadow: 0 0 20px rgba(0, 217, 207, 0.05);
}
.highlight-text { background: none !important; -webkit-text-fill-color: var(--teal-normal) !important; color: var(--teal-normal) !important; }

/* 🚀 Eval Badges for Scorecards */
.eval-badge { font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; letter-spacing: 0.02em; text-transform: uppercase; }
.eval-good { background: rgba(33, 196, 94, 0.06); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.15); }
.eval-warning { background: rgba(251, 191, 36, 0.06); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.15); }
.eval-neutral { background: rgba(255, 255, 255, 0.03); color: var(--text-secondary); border: 1px solid var(--border-subtle); }

/* 🚀 Filter Bar & Search Styles */
.filter-bar {
  display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;
  padding: 20px 24px; background: rgba(255,255,255,0.01);
}
.lead-filter-bar { flex-direction: row; }
.filter-item { display: flex; flex-direction: column; gap: 6px; min-width: 160px; flex-grow: 1; }
.filter-item label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; }
.filter-item select {
  background: rgba(17, 22, 31, 0.8); border: 1px solid var(--border-subtle); color: #fff;
  padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; outline: none;
  font-family: var(--font); cursor: pointer;
}
.filter-item select:focus { border-color: var(--teal-normal); }

.search-input-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--text-tertiary); }
.search-input-wrap input {
  width: 100%; background: rgba(17, 22, 31, 0.8); border: 1px solid var(--border-subtle);
  color: #fff; padding: 10px 12px 10px 36px; border-radius: var(--radius-sm); font-size: 13px;
  outline: none; font-family: var(--font); transition: border-color 0.2s;
}
.search-input-wrap input:focus { border-color: var(--teal-normal); }

.checkbox-filter { flex-direction: row; align-items: center; height: 38px; flex-grow: 0; }
.checkbox-filter label { display: flex; align-items: center; gap: 8px; font-size: 13px; text-transform: none; color: #fff; cursor: pointer; }
.checkbox-filter input[type="checkbox"] { accent-color: #FBBF24; width: 16px; height: 16px; cursor: pointer; }

/* Table Styles */
.table-container { overflow-x: auto; width: 100%; padding: 0; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); }
td { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); color: var(--text-secondary); vertical-align: top; }
tr:hover td { background: rgba(255, 255, 255, 0.02); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-small { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), var(--blue-normal)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }

.email-link { font-family: var(--font-mono); font-size: 12.5px; color: var(--blue-normal); text-decoration: none; transition: color 0.2s; }
.email-link:hover { color: #3b82f6; text-decoration: underline; }
.copy-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: var(--text-secondary); width: 26px; height: 26px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.copy-btn:hover { background: rgba(0,217,207,0.1); color: var(--teal-normal); border-color: rgba(0,217,207,0.3); }

.badge { padding: 4px 10px; border-radius: 100px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.badge-beta { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }

.strategies-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.strat-chip { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 3px 8px; border-radius: 4px; font-size: 11px; color: var(--text-secondary); }

.action-btn.primary { background: var(--teal-normal); color: #000; padding: 8px 16px; border: none; border-radius: 100px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s; }
.action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 217, 207, 0.3); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.date-badge { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 6px 12px; border-radius: 100px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

/* 🚀 Toast Notifications Styles */
.toast-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; pointer-events: none; }
.toast-item { display: flex; align-items: flex-start; gap: 12px; width: 320px; background: rgba(17, 22, 31, 0.98); backdrop-filter: blur(10px); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: auto; position: relative; overflow: hidden; }
.toast-item::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
.toast-success::before { background: var(--green-normal); }
.toast-success .toast-icon { color: var(--green-normal); }
.toast-content { flex-grow: 1; }
.toast-title { margin: 0 0 4px 0; color: #fff; font-size: 14px; font-weight: 600; }
.toast-message { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.4; }
.toast-close { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s; }
.toast-close:hover { color: #fff; background: rgba(255,255,255,0.05); }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-enter-from { opacity: 0; transform: translateX(100%); }
.toast-slide-leave-to { opacity: 0; transform: translateY(-20px) scale(0.95); }

@media (max-width: 1200px) { .col-3 { grid-column: span 6; } }
@media (max-width: 900px) { .col-3 { grid-column: span 12; } .filter-item { min-width: 100%; } }

.action-btn.secondary { 
  background: transparent; 
  border: 1px solid var(--border-subtle); 
  color: var(--text-secondary); 
}
.action-btn.secondary:hover:not(:disabled) { 
  background: rgba(255,255,255,0.05); 
  color: #fff; 
  border-color: var(--text-tertiary); 
}
</style>