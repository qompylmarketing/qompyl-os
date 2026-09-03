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
      <div class="filters-group">
        <div class="date-badge">
          <Icon name="users" :size="14" /> Total Leads: {{ filteredLeads.length }}
        </div>
        <button class="action-btn primary" @click="exportToCSV" :disabled="loading || filteredLeads.length === 0">
          <Icon name="download" :size="14" /> Export CSV
        </button>
      </div>
    </header>

    <!-- 🚀 Advanced Filters Bar -->
    <div class="bento-card col-12 filter-bar lead-filter-bar">
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
              <th>Email</th>
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
              <!-- Email -->
              <td style="font-family: var(--font-mono); font-size: 12px; color: var(--blue-normal);">
                <a :href="`mailto:${lead.email}`" style="color: inherit; text-decoration: none;">{{ lead.email }}</a>
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
                No leads match your current filters.
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
const allLeads = ref([])
const filteredLeads = ref([])
const loading = ref(true)

// Filters State
const filters = ref({
  experience: 'all',
  age: 'all',
  country: 'all',
  betaOnly: false
})

// استخراج الدول المتاحة ديناميكياً للفلاتر
const uniqueCountries = computed(() => {
  const countries = allLeads.value.map(l => l.country).filter(c => c)
  return [...new Set(countries)].sort()
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
      applyFilters() // تطبيق الفلاتر المبدئية (All)
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  filteredLeads.value = allLeads.value.filter(lead => {
    const matchExp = filters.value.experience === 'all' || lead.experience_level === filters.value.experience
    const matchAge = filters.value.age === 'all' || lead.age_range === filters.value.age
    const matchCountry = filters.value.country === 'all' || lead.country === filters.value.country
    const matchBeta = !filters.value.betaOnly || lead.join_beta_testing === true
    
    return matchExp && matchAge && matchCountry && matchBeta
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
  link.setAttribute('download', `Qompyl_Leads_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchLeads()
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.is-spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.system-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 500;}

/* 🚀 Filter Bar Styles */
.filter-bar {
  display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;
  padding: 20px 24px; background: rgba(255,255,255,0.01);
}
.lead-filter-bar {
    flex-direction: row;
}
.filter-item { display: flex; flex-direction: column; gap: 6px; min-width: 180px; }
.filter-item label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; }
.filter-item select {
  background: rgba(17, 22, 31, 0.8); border: 1px solid var(--border-subtle); color: #fff;
  padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; outline: none;
  font-family: var(--font); cursor: pointer;
}
.filter-item select:focus { border-color: var(--teal-normal); }
.checkbox-filter { flex-direction: row; align-items: center; height: 38px; }
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

.badge { padding: 4px 10px; border-radius: 100px; font-size: 10.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.badge-beta { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }

.strategies-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.strat-chip { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 3px 8px; border-radius: 4px; font-size: 11px; color: var(--text-secondary); }

.action-btn.primary { background: var(--teal-normal); color: #000; padding: 8px 16px; border: none; border-radius: 100px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s; }
.action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 217, 207, 0.3); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.date-badge { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 6px 12px; border-radius: 100px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
</style>