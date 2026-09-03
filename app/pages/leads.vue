<template>
  <div @click="closeDropdowns">
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="users" :size="24" style="color: var(--teal-normal);" /> Early Access Leads</h1>
        <p>Manage, filter, and track your waitlist sign-ups pipeline directly from the marketing site.</p>
        <div class="system-status" style="margin-top: 8px;">
           <Icon name="refresh-ccw" :size="13" :class="{ 'is-spinning': loading }" style="color: var(--text-tertiary);" />
           <span :style="{ color: loading ? 'var(--text-tertiary)' : 'var(--green-normal)' }">
             {{ loading ? 'Syncing securely with database...' : 'Database Synced' }}
           </span>
        </div>
      </div>
      
      <!-- Export Action & Total -->
      <div class="filters-group">
        <div class="date-badge">
          <Icon name="users" :size="14" /> Showing: {{ filteredLeads.length }}
        </div>
        <button class="action-btn secondary" @click="exportEmailsToCSV" :disabled="loading || filteredLeads.length === 0" title="Exports emails of the currently filtered view">
          <Icon name="mail" :size="14" /> Export Emails
        </button>
        <button class="action-btn primary" @click="exportToCSV" :disabled="loading || filteredLeads.length === 0" title="Exports all details of the currently filtered view">
          <Icon name="download" :size="14" /> Export Filtered CSV
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

    <!-- 🚀 Advanced Filters Bar with Search & Date Range -->
    <div class="bento-card col-12 filter-bar lead-filter-bar">
      <!-- Search Box -->
      <div class="filter-item search-box-container">
        <label>Search Leads</label>
        <div class="search-input-wrap">
          <Icon name="search" :size="14" class="search-icon" />
          <input type="text" v-model="searchQuery" @input="applyFilters" placeholder="Name or email...">
        </div>
      </div>
      
      <!-- Date Range Filter -->
      <div class="filter-item">
        <label>Date Range</label>
        <select v-model="filters.dateRange" @change="applyFilters">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">This Month</option>
        </select>
      </div>

      <div class="filter-item">
        <label>Status Pipeline</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Beta Invited">Beta Invited</option>
          <option value="Converted">Converted</option>
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
          Beta Only
        </label>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="bento-grid" style="margin-top: 20px;">
      <div class="bento-card col-12 skeleton-card" style="height: 400px;"></div>
    </div>

    <!-- Leads Table (CRM View) -->
    <div v-else class="bento-grid fade-in" style="margin-top: 20px;">
      <div class="bento-card col-12 table-container">
        <table>
          <thead>
            <tr>
              <th @click="sortBy('first_name')" class="sortable-th">
                Lead Profile <Icon :name="getSortIcon('first_name')" :size="12" class="sort-icon" />
              </th>
              <th @click="sortBy('email')" class="sortable-th">
                Email Address <Icon :name="getSortIcon('email')" :size="12" class="sort-icon" />
              </th>
              <th @click="sortBy('status')" class="sortable-th">
                Pipeline Status <Icon :name="getSortIcon('status')" :size="12" class="sort-icon" />
              </th>
              <th>Strategies (Interests)</th>
              <th @click="sortBy('country')" class="sortable-th">
                Country <Icon :name="getSortIcon('country')" :size="12" class="sort-icon" />
              </th>
              <th @click="sortBy('created_at')" class="sortable-th">
                Registration Date <Icon :name="getSortIcon('created_at')" :size="12" class="sort-icon" />
              </th>
              <!-- 🚀 Action Column Header -->
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- 🚀 Row Click opens Drawer -->
            <tr v-for="lead in filteredLeads" :key="lead.id" class="clickable-row" @click="openDrawer(lead)">
              <!-- Profile -->
              <td style="color:#fff; font-weight: 500;">
                <div class="user-cell">
                  <div class="avatar-small">{{ lead.first_name.charAt(0).toUpperCase() }}</div>
                  <div>
                    {{ lead.first_name }} {{ lead.last_name }}
                    <div style="font-size: 10px; color: var(--text-tertiary); font-weight: normal; margin-top: 2px;">
                      {{ lead.experience_level || 'Unknown Exp' }} • {{ lead.age_range || 'Unknown Age' }}
                    </div>
                  </div>
                </div>
              </td>
              <!-- Email with Copy Button (stopPropagation so row doesn't click) -->
              <td>
                <div style="display: flex; align-items: center; gap: 8px;" @click.stop>
                  <a :href="`mailto:${lead.email}`" class="email-link" title="Send Email">{{ lead.email }}</a>
                  <button class="copy-btn" @click="copyEmail(lead.email)" title="Copy to clipboard">
                    <Icon name="copy" :size="12" />
                  </button>
                </div>
              </td>
              <!-- CRM Status Pipeline -->
              <td>
                <span class="status-pill" :class="getStatusClass(lead.status)">
                  {{ lead.status || 'New' }}
                </span>
                <span v-if="lead.join_beta_testing" class="badge badge-beta" style="margin-left: 6px;" title="Beta Tester Opt-in"><Icon name="star" :size="10" /></span>
              </td>
              <!-- Strategies (Multi-select) -->
              <td style="max-width: 200px;">
                <div class="strategies-wrap" v-if="lead.strategies">
                  <span v-for="(strat, i) in lead.strategies.split(',').slice(0, 2)" :key="i" class="strat-chip">{{ strat.trim() }}</span>
                  <span v-if="lead.strategies.split(',').length > 2" class="strat-chip" style="background: transparent; border-color: transparent;">+{{ lead.strategies.split(',').length - 2 }}</span>
                </div>
                <span v-else style="color: var(--text-tertiary); font-size: 11px;">Not specified</span>
              </td>
              <!-- Country -->
              <td style="color: var(--text-secondary); font-size: 12.5px;">
                {{ lead.country || 'N/A' }}
              </td>
              <!-- Date -->
              <td style="color: var(--text-tertiary); font-size: 11.5px; font-family: var(--font-mono);">
                {{ formatDate(lead.created_at) }}
              </td>
              <!-- 🚀 Action Column (View Details CTA) -->
              <td style="text-align: right;">
                <button class="view-details-btn">
                  View Details <Icon name="chevron-right" :size="14" />
                </button>
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

    <!-- 🚀 Lead Detail Drawer (Slide-over CRM Layer) -->
    <div class="modal-overlay" :class="{ 'is-open': isDrawerOpen }" @click.self="closeDrawer">
      <div class="slide-over">
        <div class="slide-header" v-if="selectedLead">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="avatar-large">{{ selectedLead.first_name.charAt(0).toUpperCase() }}</div>
            <div>
              <h3>{{ selectedLead.first_name }} {{ selectedLead.last_name }}</h3>
              <a :href="`mailto:${selectedLead.email}`" class="email-link">{{ selectedLead.email }}</a>
            </div>
          </div>
          <button class="close-btn" @click="closeDrawer"><Icon name="x" :size="18" /></button>
        </div>
        
        <div class="slide-body" v-if="selectedLead">
          <!-- CRM Action Layer -->
          <div class="crm-section">
            <h4 class="section-title">Lead Management</h4>
            
            <!-- 🚀 Custom Select for Pipeline Status -->
            <div class="form-group">
              <label>Pipeline Status</label>
              <div class="custom-select" @click.stop="toggleSelect('statusDrawer')">
                <div class="select-trigger" :class="{ 'open': openSelect === 'statusDrawer' }">
                  <span>{{ selectedLead.status || 'New' }}</span>
                  <Icon name="chevron-down" :size="16" class="chevron" />
                </div>
                <ul class="select-menu" v-if="openSelect === 'statusDrawer'">
                  <li v-for="option in ['New', 'Contacted', 'Beta Invited', 'Converted']" :key="option" 
                      @click.stop="selectStatus(option)" :class="{ 'selected': selectedLead.status === option }">
                    {{ option }}<Icon v-if="selectedLead.status === option" name="check" :size="14" class="check-icon"/>
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-group">
              <label>Analyst Notes</label>
              <textarea v-model="selectedLead.notes" rows="4" class="crm-input" placeholder="E.g., Called on Tuesday, very interested in API access..."></textarea>
            </div>
            <button class="action-btn primary w-100" @click="saveLeadCRM" :disabled="savingCRM">
              {{ savingCRM ? 'Saving...' : 'Save Lead Details' }}
            </button>
          </div>

          <div class="divider"></div>

          <!-- Raw Data Layer -->
          <div class="crm-section raw-data-section">
            <h4 class="section-title">Raw Form Data</h4>
            <div class="data-row"><span>Registration Date</span> <strong>{{ formatExactDate(selectedLead.created_at) }}</strong></div>
            <div class="data-row"><span>Source / UTM</span> <strong>{{ selectedLead.source || 'Direct Webflow' }}</strong></div>
            <div class="data-row"><span>Beta Opt-in</span> <strong :style="{color: selectedLead.join_beta_testing ? '#FBBF24' : ''}">{{ selectedLead.join_beta_testing ? 'Yes, interested' : 'No' }}</strong></div>
            <div class="data-row"><span>Experience</span> <strong>{{ selectedLead.experience_level || 'N/A' }}</strong></div>
            <div class="data-row"><span>Age Range</span> <strong>{{ selectedLead.age_range || 'N/A' }}</strong></div>
            <div class="data-row"><span>Country</span> <strong>{{ selectedLead.country || 'N/A' }}</strong></div>
            <div class="data-row" style="flex-direction: column; align-items: flex-start;">
              <span>Trading Strategies</span> 
              <div class="strategies-wrap" style="margin-top: 8px;">
                <span v-for="(strat, i) in (selectedLead.strategies || 'Not specified').split(',')" :key="i" class="strat-chip">{{ strat.trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
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
const savingCRM = ref(false)

// 🚀 State for Filters & Sorting
const searchQuery = ref('')
const filters = ref({
  experience: 'all',
  age: 'all',
  country: 'all',
  status: 'all',
  dateRange: 'all',
  betaOnly: false
})
const sortKey = ref('created_at')
const sortOrder = ref('desc')

// 🚀 State for Custom Select inside Drawer
const openSelect = ref(null)

// 🚀 State for CRM Drawer
const isDrawerOpen = ref(false)
const selectedLead = ref(null)

// Toast System
const toasts = ref([])
let toastCounter = 0
const showToast = (title, message, type = 'success') => {
  const id = toastCounter++
  toasts.value.push({ id, title, message, type, icon: type === 'success' ? 'check-circle' : 'info' })
  setTimeout(() => removeToast(id), 3500)
}
const removeToast = (id) => {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

const uniqueCountries = computed(() => {
  return [...new Set(allLeads.value.map(l => l.country).filter(c => c))].sort()
})

const globalStats = computed(() => {
  const total = allLeads.value.length;
  if (total === 0) return { total: 0, thisWeek: 0, betaPct: 0, topCountry: 'N/A' };

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = allLeads.value.filter(l => new Date(l.created_at) >= oneWeekAgo).length;
  const betaPct = ((allLeads.value.filter(l => l.join_beta_testing).length / total) * 100).toFixed(0);

  const countryCounts = {};
  let topCountry = 'N/A'; let maxCount = 0;
  allLeads.value.forEach(l => {
    if (l.country) {
      countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
      if (countryCounts[l.country] > maxCount) { maxCount = countryCounts[l.country]; topCountry = l.country; }
    }
  });

  return { total, thisWeek, betaPct, topCountry };
})

const fetchLeads = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('leads').select('*')
    if (error) throw error
    if (data) {
      allLeads.value = data.map(l => ({ ...l, status: l.status || 'New' }))
      applyFilters()
    }
  } catch (error) { console.error('Error fetching leads:', error) } 
  finally { loading.value = false }
}

const applyFilters = () => {
  const q = searchQuery.value.toLowerCase().trim()
  const now = new Date()
  
  let result = allLeads.value.filter(lead => {
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase()
    const email = (lead.email || '').toLowerCase()
    const matchSearch = !q || fullName.includes(q) || email.includes(q)

    const matchExp = filters.value.experience === 'all' || lead.experience_level === filters.value.experience
    const matchAge = filters.value.age === 'all' || lead.age_range === filters.value.age
    const matchCountry = filters.value.country === 'all' || lead.country === filters.value.country
    const matchStatus = filters.value.status === 'all' || lead.status === filters.value.status
    const matchBeta = !filters.value.betaOnly || lead.join_beta_testing === true
    
    let matchDate = true;
    if (filters.value.dateRange !== 'all') {
      const leadDate = new Date(lead.created_at)
      if (filters.value.dateRange === 'today') {
        matchDate = leadDate.toDateString() === now.toDateString()
      } else if (filters.value.dateRange === '7d') {
        const past7 = new Date(); past7.setDate(now.getDate() - 7);
        matchDate = leadDate >= past7
      } else if (filters.value.dateRange === '30d') {
        matchDate = leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear()
      }
    }
    
    return matchSearch && matchExp && matchAge && matchCountry && matchStatus && matchBeta && matchDate
  })

  result.sort((a, b) => {
    let valA = a[sortKey.value] || ''
    let valB = b[sortKey.value] || ''
    
    if (sortKey.value === 'created_at') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    } else {
      valA = valA.toString().toLowerCase()
      valB = valB.toString().toLowerCase()
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  filteredLeads.value = result
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  applyFilters()
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return 'minus' 
  return sortOrder.value === 'asc' ? 'chevron-up' : 'chevron-down'
}

// 🚀 Toggle Custom Select Menu
const toggleSelect = (selectId) => {
  openSelect.value = openSelect.value === selectId ? null : selectId
}
const selectStatus = (status) => {
  if (selectedLead.value) {
    selectedLead.value.status = status;
  }
  setTimeout(() => openSelect.value = null, 50)
}
const closeDropdowns = () => {
  openSelect.value = null
}

const openDrawer = (lead) => {
  selectedLead.value = JSON.parse(JSON.stringify(lead))
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  openSelect.value = null // إغلاق أي قائمة مفتوحة
  setTimeout(() => { selectedLead.value = null }, 300)
}

const saveLeadCRM = async () => {
  savingCRM.value = true
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status: selectedLead.value.status, notes: selectedLead.value.notes })
      .eq('id', selectedLead.value.id)

    if (error) throw error
    
    const idx = allLeads.value.findIndex(l => l.id === selectedLead.value.id)
    if (idx !== -1) {
      allLeads.value[idx].status = selectedLead.value.status
      allLeads.value[idx].notes = selectedLead.value.notes
    }
    applyFilters()
    showToast('Saved', 'Lead details updated successfully.', 'success')
    closeDrawer()
  } catch (error) {
    console.error('Error saving lead:', error)
    showToast('Error', 'Could not save lead details.', 'error')
  } finally {
    savingCRM.value = false
  }
}

const getStatusClass = (status) => {
  if (status === 'New') return 'pill-new'
  if (status === 'Contacted') return 'pill-contacted'
  if (status === 'Beta Invited') return 'pill-invited'
  if (status === 'Converted') return 'pill-converted'
  return 'pill-new'
}

const exportEmailsToCSV = () => {
  const headers = ['Email']
  const csvRows = filteredLeads.value.map(lead => [`"${lead.email}"`])
  downloadCSV(headers, csvRows, 'Qompyl_Emails_Only')
}

const exportToCSV = () => {
  const headers = ['First Name', 'Last Name', 'Email', 'Status', 'Experience', 'Age Range', 'Country', 'Strategies', 'Beta Tester', 'Source', 'Registration Date', 'Notes']
  const csvRows = filteredLeads.value.map(lead => [
    `"${lead.first_name}"`, `"${lead.last_name}"`, `"${lead.email}"`, `"${lead.status || 'New'}"`,
    `"${lead.experience_level || ''}"`, `"${lead.age_range || ''}"`, `"${lead.country || ''}"`,
    `"${lead.strategies || ''}"`, lead.join_beta_testing ? 'Yes' : 'No', `"${lead.source || ''}"`,
    `"${new Date(lead.created_at).toISOString()}"`, `"${(lead.notes || '').replace(/"/g, '""')}"`
  ])
  downloadCSV(headers, csvRows, 'Qompyl_Filtered_Leads')
}

const downloadCSV = (headers, rows, filename) => {
  let csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link); link.click(); document.body.removeChild(link)
  showToast('Export Successful', 'Your CSV file has been downloaded.', 'success')
}

const copyEmail = async (email) => {
  try {
    await navigator.clipboard.writeText(email)
    showToast('Email Copied', `${email} copied to clipboard!`, 'success')
  } catch (err) {}
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric' })
}
const formatExactDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => { fetchLeads() })
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}

/* Scorecards */
.col-3 { grid-column: span 3; }
.scorecard { padding: 22px 24px; justify-content: space-between; background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005)); }
.scorecard .score-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); margin-bottom: 12px; display: block; }
.scorecard .score-main { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.scorecard .score-value { font-size: 34px; font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.5px; line-height: 1; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.highlight-card { background: linear-gradient(135deg, rgba(0, 217, 207, 0.08), rgba(255, 255, 255, 0.005)) !important; border-color: rgba(0, 217, 207, 0.3) !important; box-shadow: 0 0 20px rgba(0, 217, 207, 0.05); }
.highlight-text { background: none !important; -webkit-text-fill-color: var(--teal-normal) !important; }

/* Badges */
.eval-badge { font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 4px; text-transform: uppercase; }
.eval-good { background: rgba(33, 196, 94, 0.06); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.15); }
.eval-warning { background: rgba(251, 191, 36, 0.06); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.15); }
.eval-neutral { background: rgba(255, 255, 255, 0.03); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
.badge { padding: 4px 10px; border-radius: 100px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.badge-beta { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }

/* Status Pipeline Pills */
.status-pill { padding: 4px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; font-family: var(--font-mono); display: inline-block; }
.pill-new { background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px dashed var(--border-subtle); }
.pill-contacted { background: rgba(6, 144, 249, 0.1); color: var(--blue-normal); border: 1px solid rgba(6, 144, 249, 0.2); }
.pill-invited { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }
.pill-converted { background: rgba(33, 196, 94, 0.1); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.2); }

/* Filters & Search */
.filter-bar { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; padding: 20px 24px; background: rgba(255,255,255,0.01); }
.lead-filter-bar { flex-direction: row; }
.filter-item { display: flex; flex-direction: column; gap: 6px; min-width: 130px; flex-grow: 1; }
.filter-item label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; }
.filter-item select, .search-input-wrap input { background: rgba(17, 22, 31, 0.8); border: 1px solid var(--border-subtle); color: #fff; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
.filter-item select:focus, .search-input-wrap input:focus { border-color: var(--teal-normal); }
.search-input-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--text-tertiary); }
.search-input-wrap input { padding-left: 36px; }
.checkbox-filter { flex-direction: row; align-items: center; height: 38px; flex-grow: 0; }
.checkbox-filter label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #fff; cursor: pointer; }

/* Table & Sortable Headers */
.table-container { overflow-x: auto; width: 100%; padding: 0; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); user-select: none; }
.sortable-th { cursor: pointer; transition: color 0.2s; }
.sortable-th:hover { color: #fff; }
.sort-icon { margin-left: 4px; opacity: 0.5; }
.sortable-th:hover .sort-icon { opacity: 1; }
td { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); color: var(--text-secondary); vertical-align: middle; }
.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: rgba(255, 255, 255, 0.03); }

/* Table Elements */
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-small { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), var(--blue-normal)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.avatar-large { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), var(--blue-normal)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; flex-shrink: 0; }
.email-link { font-family: var(--font-mono); font-size: 12.5px; color: var(--blue-normal); text-decoration: none; transition: color 0.2s; }
.email-link:hover { color: #3b82f6; text-decoration: underline; }
.copy-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: var(--text-secondary); width: 26px; height: 26px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.copy-btn:hover { background: rgba(0,217,207,0.1); color: var(--teal-normal); border-color: rgba(0,217,207,0.3); }
.strategies-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.strat-chip { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 3px 8px; border-radius: 4px; font-size: 11px; color: var(--text-secondary); white-space: nowrap;}

/* Buttons */
.action-btn { padding: 8px 16px; border-radius: 100px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s; justify-content: center; }
.action-btn.primary { background: var(--teal-normal); color: #000; border: none; }
.action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 217, 207, 0.3); }
.action-btn.secondary { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); }
.action-btn.secondary:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #fff; border-color: var(--text-tertiary); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.w-100 { width: 100%; padding: 12px; font-size: 13px; }

/* 🚀 Custom View Details Button in Table */
.view-details-btn {
  background: transparent; border: none; color: var(--teal-normal);
  font-size: 12px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;
}
.clickable-row:hover .view-details-btn { color: #00e5db; }

/* 🚀 Custom Select inside Drawer */
.custom-select { position: relative; width: 100%; cursor: pointer; user-select: none; }
.select-trigger { display: flex; justify-content: space-between; align-items: center; width: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-subtle); color: #fff; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 13.5px; transition: all 0.2s ease; }
.select-trigger.open { border-color: var(--teal-normal); box-shadow: 0 0 0 2px rgba(0, 217, 207, 0.1); }
.select-trigger .chevron { transition: transform 0.2s ease; color: var(--text-tertiary); }
.select-trigger.open .chevron { transform: rotate(180deg); }
.select-menu { position: absolute; top: calc(100% + 4px); left: 0; width: 100%; margin: 0; padding: 6px; list-style: none; background: rgba(17, 22, 31, 0.98); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); z-index: 1000; animation: dropdownFade 0.2s ease; }
@keyframes dropdownFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.select-menu li { padding: 10px 12px; border-radius: 4px; color: var(--text-secondary); font-size: 13.5px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
.select-menu li:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.select-menu li.selected { color: #fff; font-weight: 500; }
.select-menu .check-icon { color: var(--teal-normal); }

/* 🚀 Lead Drawer (CRM Slide-over) */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 999; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
.modal-overlay.is-open { opacity: 1; visibility: visible; }
.slide-over { position: absolute; top: 0; right: 0; width: 450px; max-width: 100vw; height: 100vh; background: rgba(17, 22, 31, 0.98); border-left: 1px solid var(--border-subtle); box-shadow: -10px 0 40px rgba(0,0,0,0.5); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
.modal-overlay.is-open .slide-over { transform: translateX(0); }
.slide-header { padding: 24px 30px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start; }
.slide-header h3 { margin: 0 0 4px 0; font-size: 20px; color: #fff; }
.close-btn { background: rgba(255,255,255,0.05); width: 32px; height: 32px; border-radius: 50%; border: none; color: var(--text-tertiary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.close-btn:hover { background: rgba(248, 113, 113, 0.1); color: #F87171; }
.slide-body { flex-grow: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 24px; }
.crm-section { display: flex; flex-direction: column; gap: 16px; }
.section-title { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.crm-input { width: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-subtle); color: #fff; padding: 12px; border-radius: 6px; font-size: 13.5px; outline: none; transition: border-color 0.2s; font-family: var(--font); }
.crm-input:focus { border-color: var(--teal-normal); }
.divider { height: 1px; background: var(--border-subtle); width: 100%; }
.raw-data-section .data-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 12px; }
.raw-data-section .data-row span { color: var(--text-tertiary); }
.raw-data-section .data-row strong { color: #fff; font-weight: 500; font-family: var(--font-mono); }

/* Toasts */
.toast-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; pointer-events: none; }
.toast-item { display: flex; align-items: flex-start; gap: 12px; width: 320px; background: rgba(17, 22, 31, 0.98); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; pointer-events: auto; }
.toast-item::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
.toast-success::before { background: var(--green-normal); }
.toast-success .toast-icon { color: var(--green-normal); }
.toast-title { margin: 0 0 4px 0; color: #fff; font-size: 14px; font-weight: 600; }
.toast-message { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.4; }
.toast-close { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s; }
.toast-close:hover { color: #fff; background: rgba(255,255,255,0.05); }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(100%); }
.toast-slide-leave-to { opacity: 0; transform: translateY(-20px); }

@media (max-width: 1200px) { .col-3 { grid-column: span 6; } }
@media (max-width: 900px) { .col-3 { grid-column: span 12; } .filter-item { min-width: 100%; } }
</style>