<template>
  <div class="admin-workspace">
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="settings" :size="24" style="color: var(--teal-normal);" /> Qompyl Studio (CMS)</h1>
        <p>Manage and curate dashboard content, analyst memos, system audits, and team access.</p>
      </div>
    </header>

    <div class="admin-layout">
      <!-- 1. Admin Sidebar (Navigation) -->
      <aside class="admin-sidebar bento-card">
        <div class="nav-section-label">Modules</div>
        <button 
          v-for="tab in tabs" :key="tab.id"
          class="admin-nav-item" 
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <Icon :name="tab.icon" :size="16" />
          {{ tab.name }}
        </button>
      </aside>

      <!-- 2. Main Content Area -->
      <main class="admin-main bento-card">
        <div class="main-header">
          <div>
            <h2>{{ currentTabConfig.name }}</h2>
            <p class="desc">{{ currentTabConfig.desc }}</p>
          </div>
          <button class="action-btn primary" @click="openModal(null)">
            <Icon :name="activeTab === 'users' ? 'user-plus' : 'plus'" :size="14" /> 
            {{ activeTab === 'users' ? 'Add User' : 'Add New' }}
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <Icon name="refresh-ccw" :size="20" class="is-spinning" /> Loading data...
        </div>

        <!-- Data Tables based on Active Tab -->
        <div v-else class="table-container fade-in">
          
          <!-- Decisions Table -->
          <table v-if="activeTab === 'decisions'">
            <thead><tr><th>Task Title</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff;">{{ item.task_title }}</td>
                <td><div class="owner-badge"><span class="dot" :style="{ background: item.owner_color }"></span> {{ item.owner_name }}</div></td>
                <td><span class="badge" :class="getBadgeClass(item.status)">{{ item.status }}</span></td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Memos Table -->
          <table v-if="activeTab === 'memos'">
            <thead><tr><th>Title</th><th>Publish Date</th><th>Author</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff;">{{ item.title }}</td>
                <td>{{ formatDate(item.publish_date) }}</td>
                <td>{{ item.author_name }}</td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Clarity Table -->
          <table v-if="activeTab === 'clarity'">
            <thead><tr><th>Session ID</th><th>Friction Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff; font-family: var(--font-mono);">{{ item.session_id }}</td>
                <td><span class="badge badge-open">{{ item.friction_type }}</span></td>
                <td>
                  <span v-if="item.is_active" class="badge badge-done">Active</span>
                  <span v-else class="badge badge-muted">Hidden</span>
                </td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 🚀 Friction Log Table -->
          <table v-if="activeTab === 'friction'">
            <thead><tr><th>Element</th><th>Priority</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff; font-family: var(--font-mono);">{{ item.element }}</td>
                <td><span class="badge" :class="item.priority === 'High' ? 'badge-open' : (item.priority === 'Medium' ? 'badge-progress' : 'badge-muted')">{{ item.priority }}</span></td>
                <td>{{ item.owner }}</td>
                <td><span class="badge" :class="getBadgeClass(item.status)">{{ item.status }}</span></td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 🚀 JS Errors Table -->
          <table v-if="activeTab === 'js_errors'">
            <thead><tr><th>Error Message</th><th>Priority</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff; font-size: 11.5px; font-family:var(--font-mono); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.message">
                  <!-- Vue's {{ }} provides automatic XSS protection here -->
                  {{ item.message }}
                </td>
                <td><span class="badge" :class="item.priority === 'High' ? 'badge-open' : (item.priority === 'Medium' ? 'badge-progress' : 'badge-muted')">{{ item.priority }}</span></td>
                <td>{{ item.owner }}</td>
                <td><span class="badge" :class="getBadgeClass(item.status)">{{ item.status }}</span></td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- GTM Audits Table -->
          <table v-if="activeTab === 'gtm'">
            <thead><tr><th>Event Name</th><th>Audit Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff; font-family: var(--font-mono);">{{ item.event_name }}</td>
                <td>{{ formatDate(item.audit_date) }}</td>
                <td><span class="badge" :style="{ color: item.color_hex, borderColor: item.color_hex }">{{ item.status }}</span></td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 👤 User Roles Table -->
          <table v-if="activeTab === 'users'">
            <thead><tr><th>Full Name</th><th>User ID</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td style="color:#fff; font-weight: 500;">
                  <div class="user-cell">
                    <div class="avatar-small">{{ (item.full_name || 'U').charAt(0) }}</div>
                    {{ item.full_name || 'Unnamed User' }}
                  </div>
                </td>
                <td style="font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary);">{{ item.id }}</td>
                <td><span class="badge" :class="item.role === 'Administrator' ? 'badge-progress' : 'badge-muted'">{{ item.role }}</span></td>
                <td>
                  <div class="status-indicator" :class="{ 'status-active': item.status === 'Active' }">
                    <div class="pulse-dot" v-if="item.status === 'Active'"></div> {{ item.status }}
                  </div>
                </td>
                <td>
                  <div class="action-cell">
                    <button class="edit-btn" @click="openModal(item)" title="Edit"><Icon name="edit-2" :size="14"/></button>
                    <button class="del-row-btn" @click="deleteRecord(item.id)" title="Delete"><Icon name="trash-2" :size="14"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="tableData.length === 0" class="empty-state">No records found.</div>
        </div>
      </main>
    </div>

    <!-- 3. Slide-over Modal (Forms) -->
    <div class="modal-overlay" :class="{ 'is-open': isModalOpen }" @click.self="closeModal">
      <div class="slide-over">
        <div class="slide-header">
          <h3>{{ editingId ? 'Edit Record' : 'Create New' }}</h3>
          <button class="close-btn" @click="closeModal"><Icon name="x" :size="18" /></button>
        </div>
        
        <div class="slide-body">
          <form @submit.prevent="saveData" class="admin-form">
            <!-- Decisions Form -->
            <template v-if="activeTab === 'decisions'">
              <div class="form-group"><label>Task Title</label><input v-model="formData.task_title" required></div>
              <div class="form-group"><label>Reason / Insight</label><input v-model="formData.reason" required></div>
              <div class="form-row">
                <div class="form-group"><label>Owner Name</label><input v-model="formData.owner_name" required></div>
                <div class="form-group"><label>Owner Initial</label><input v-model="formData.owner_initial" maxlength="2" required></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Owner Color</label><input type="color" v-model="formData.owner_color" class="color-picker"></div>
                <div class="form-group">
                  <label>Status</label>
                  <div class="custom-select" @click="toggleSelect('decisionStatus')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'decisionStatus' }">
                      <span>{{ formData.status }}</span>
                      <Icon name="chevron-down" :size="16" class="chevron" />
                    </div>
                    <ul class="select-menu" v-if="openSelect === 'decisionStatus'">
                      <li v-for="option in ['Open', 'In Progress', 'Resolved']" :key="option" 
                          @click="selectOption('status', option)" :class="{ 'selected': formData.status === option }">
                        {{ option }}<Icon v-if="formData.status === option" name="check" :size="14" class="check-icon"/>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>

            <!-- Memos Form -->
            <template v-if="activeTab === 'memos'">
               <div class="form-group"><label>Report Title</label><input v-model="formData.title" required></div>
              <div class="form-row">
                <div class="form-group"><label>Publish Date</label><input type="date" v-model="formData.publish_date" required></div>
                <div class="form-group"><label>Next Read Date</label><input type="date" v-model="formData.next_read_date"></div>
              </div>
              <div class="form-group"><label>TL;DR Summary</label><textarea v-model="formData.tldr_text" rows="3" required></textarea></div>
            </template>

            <!-- Clarity Form -->
            <template v-if="activeTab === 'clarity'">
              <div class="form-group"><label>Session ID</label><input v-model="formData.session_id" required></div>
              <div class="form-group"><label>Journey Path</label><input v-model="formData.journey" placeholder="Home -> Pricing" required></div>
              <div class="form-group">
                <label>Friction Type</label>
                <div class="custom-select" @click="toggleSelect('frictionType')">
                  <div class="select-trigger" :class="{ 'open': openSelect === 'frictionType' }">
                    <span>{{ formData.friction_type }}</span><Icon name="chevron-down" :size="16" class="chevron" />
                  </div>
                  <ul class="select-menu" v-if="openSelect === 'frictionType'">
                    <li v-for="option in ['Rage Click / Confusion', 'Dead Click / JS Error', 'Quick Back / High Friction']" :key="option" 
                        @click="selectOption('friction_type', option)" :class="{ 'selected': formData.friction_type === option }">
                      {{ option }}<Icon v-if="formData.friction_type === option" name="check" :size="14" class="check-icon"/>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="form-group"><label>Analyst Note</label><textarea v-model="formData.analyst_note" rows="3" required></textarea></div>
              <div class="form-group"><label>Recording URL</label><input type="url" v-model="formData.session_url" required></div>
              <div class="form-group switch-group">
                <label>Is Active (Visible on Dashboard)</label>
                <input type="checkbox" v-model="formData.is_active" class="toggle-switch">
              </div>
            </template>

            <!-- 🚀 Friction Log Form -->
            <template v-if="activeTab === 'friction'">
              <div class="form-group"><label>Page URL</label><input v-model="formData.path" placeholder="/pricing" required></div>
              <div class="form-group"><label>Element Name</label><input v-model="formData.element" placeholder="Pricing Accordion" required></div>
              <div class="form-row">
                <div class="form-group"><label>Rage Clicks</label><input type="number" v-model="formData.rage" min="0"></div>
                <div class="form-group"><label>Dead Clicks</label><input type="number" v-model="formData.dead" min="0"></div>
              </div>
              <div class="form-group"><label>Assignee / Owner</label><input v-model="formData.owner" placeholder="Developer Name" required></div>
              <div class="form-row">
                <div class="form-group">
                  <label>Priority</label>
                  <div class="custom-select" @click="toggleSelect('fricPriority')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'fricPriority' }"><span>{{ formData.priority }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'fricPriority'">
                      <li v-for="opt in ['High', 'Medium', 'Low']" :key="opt" @click="selectOption('priority', opt)">{{ opt }}</li>
                    </ul>
                  </div>
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <div class="custom-select" @click="toggleSelect('fricStatus')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'fricStatus' }"><span>{{ formData.status }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'fricStatus'">
                      <li v-for="opt in ['Open', 'Investigating', 'Resolved']" :key="opt" @click="selectOption('status', opt)">{{ opt }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>

            <!-- 🚀 JS Errors Form -->
            <template v-if="activeTab === 'js_errors'">
              <div class="form-group">
                <label>Error Message</label>
                <!-- هنا سيتم إدخال النص الخبيث الوهمي للاختبار -->
                <textarea v-model="formData.message" rows="3" placeholder="Uncaught TypeError..." required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Page URL</label><input v-model="formData.path" placeholder="/product" required></div>
                <div class="form-group"><label>Occurrences</label><input type="number" v-model="formData.count" min="0"></div>
              </div>
              <div class="form-group"><label>Assignee / Owner</label><input v-model="formData.owner" placeholder="Developer Name" required></div>
              <div class="form-row">
                <div class="form-group">
                  <label>Priority</label>
                  <div class="custom-select" @click="toggleSelect('jsPriority')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'jsPriority' }"><span>{{ formData.priority }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'jsPriority'">
                      <li v-for="opt in ['High', 'Medium', 'Low']" :key="opt" @click="selectOption('priority', opt)">{{ opt }}</li>
                    </ul>
                  </div>
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <div class="custom-select" @click="toggleSelect('jsStatus')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'jsStatus' }"><span>{{ formData.status }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'jsStatus'">
                      <li v-for="opt in ['Open', 'Investigating', 'Resolved']" :key="opt" @click="selectOption('status', opt)">{{ opt }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>

            <!-- GTM Audits Form -->
            <template v-if="activeTab === 'gtm'">
               <div class="form-group">
                <label>Event Name</label>
                <div class="custom-select" @click="toggleSelect('gtmEventName')">
                  <div class="select-trigger" :class="{ 'open': openSelect === 'gtmEventName' }">
                    <span>{{ formData.event_name || 'Select an event...' }}</span><Icon name="chevron-down" :size="16" class="chevron" />
                  </div>
                  <ul class="select-menu" v-if="openSelect === 'gtmEventName'" style="max-height: 200px; overflow-y: auto;">
                    <li v-for="option in dynamicGtmEvents" :key="option" 
                        @click.stop="selectOption('event_name', option)" :class="{ 'selected': formData.event_name === option }">
                      {{ option }}<Icon v-if="formData.event_name === option" name="check" :size="14" class="check-icon"/>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Audit Date</label><input type="date" v-model="formData.audit_date" required></div>
                <div class="form-group">
                  <label>Status</label>
                  <div class="custom-select" @click="toggleSelect('gtmStatus')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'gtmStatus' }">
                      <span>{{ formData.status }}</span><Icon name="chevron-down" :size="16" class="chevron" />
                    </div>
                    <ul class="select-menu" v-if="openSelect === 'gtmStatus'">
                      <li v-for="option in ['Active - Verified', 'Inactive - Needs Fix']" :key="option" 
                          @click.stop="selectOption('status', option)" :class="{ 'selected': formData.status === option }">
                        {{ option }}<Icon v-if="formData.status === option" name="check" :size="14" class="check-icon"/>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Icon Name (Lucide)</label><input v-model="formData.icon_name" placeholder="check-circle"></div>
                <div class="form-group"><label>Color Hex</label><input type="color" v-model="formData.color_hex" class="color-picker"></div>
              </div>
            </template>

            <!-- 👤 User Roles Form -->
            <template v-if="activeTab === 'users'">
              <div class="form-group"><label>Full Name</label><input v-model="formData.full_name" placeholder="User Name" required></div>
              <template v-if="!editingId">
                <div class="form-group"><label>Email Address</label><input type="email" v-model="formData.email" placeholder="john@qompyl.com" required></div>
                <div class="form-group">
                  <label>Temporary Password</label>
                  <input type="password" v-model="formData.password" placeholder="••••••••" required minlength="6">
                  <small style="color: var(--text-tertiary); margin-top: 4px;">Must be at least 6 characters.</small>
                </div>
              </template>
              <div class="form-row" style="margin-top: 10px;">
                <div class="form-group">
                  <label>Role</label>
                  <div class="custom-select" @click="toggleSelect('userRole')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'userRole' }"><span>{{ formData.role }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'userRole'">
                      <li v-for="option in ['Administrator', 'Editor', 'Viewer']" :key="option" @click="selectOption('role', option)">{{ option }}</li>
                    </ul>
                  </div>
                </div>
                <div class="form-group">
                  <label>Account Status</label>
                  <div class="custom-select" @click="toggleSelect('userStatus')">
                    <div class="select-trigger" :class="{ 'open': openSelect === 'userStatus' }"><span>{{ formData.status }}</span><Icon name="chevron-down" :size="16" class="chevron" /></div>
                    <ul class="select-menu" v-if="openSelect === 'userStatus'">
                      <li v-for="option in ['Active', 'Suspended']" :key="option" @click="selectOption('status', option)">{{ option }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>

          </form>
        </div>
        
        <div class="slide-footer">
          <button class="action-btn secondary" @click="closeModal">Cancel</button>
          <button class="action-btn primary" @click="saveData" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()

const loading = ref(true)
const saving = ref(false)
const tableData = ref([])
const activeTab = ref('decisions')
const isModalOpen = ref(false)
const editingId = ref(null)
const formData = ref({})
const openSelect = ref(null)

// 🚀 Toast Management System
const toasts = ref([])
let toastCounter = 0

const showToast = (title, message, type = 'success') => {
  const id = toastCounter++
  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info')
  
  toasts.value.push({ id, title, message, type, icon })
  
  setTimeout(() => {
    removeToast(id)
  }, 3500)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

const dynamicGtmEvents = ref([])

const tabs = [
  { id: 'decisions', name: 'Decisions Board', icon: 'check-square', table: 'decisions_board', desc: 'Manage team tasks and operational updates.' },
  { id: 'memos', name: 'Analyst Memos', icon: 'pen-tool', table: 'analyst_memos', desc: 'Write and publish executive summaries.' },
  { id: 'clarity', name: 'Clarity Sessions', icon: 'mouse-pointer', table: 'clarity_sessions', desc: 'Curate important session recordings.' },
  { id: 'friction', name: 'Friction Log', icon: 'activity', table: 'clarity_friction_log', desc: 'Log problematic UI elements causing rage or dead clicks.' },
  { id: 'js_errors', name: 'JS Errors', icon: 'terminal', table: 'clarity_js_errors', desc: 'Document client-side JavaScript errors tracked in Clarity.' },
  { id: 'gtm', name: 'GTM Audits', icon: 'shield-check', table: 'gtm_audits', desc: 'Update tracking verification statuses.' },
  { id: 'users', name: 'User Management', icon: 'users', table: 'user_roles', desc: 'Manage team access, roles, and accounts.' }
]

const currentTabConfig = computed(() => tabs.find(t => t.id === activeTab.value))

const fetchData = async () => {
  loading.value = true
  const { data, error } = await supabase.from(currentTabConfig.value.table).select('*')
  if (data) tableData.value = data
  if (error) {
    console.error(error)
    showToast('Fetch Error', 'Failed to load table data.', 'error')
  }
  loading.value = false
}

const switchTab = (tabId) => {
  activeTab.value = tabId
  fetchData()
}

const openModal = (item) => {
  if (item) {
    editingId.value = item.id
    formData.value = { ...item }
  } else {
    editingId.value = null
    if (activeTab.value === 'decisions') formData.value = { status: 'Open', owner_color: '#00D9CF' }
    else if (activeTab.value === 'memos') formData.value = { bullets: [''], publish_date: new Date().toISOString().split('T')[0] }
    else if (activeTab.value === 'clarity') formData.value = { is_active: true, friction_type: 'Rage Click / Confusion' }
    else if (activeTab.value === 'friction') formData.value = { rage: 0, dead: 0, status: 'Open', priority: 'Low', owner: '' }
    else if (activeTab.value === 'js_errors') formData.value = { count: 1, status: 'Open', priority: 'Low', owner: '' }
    else if (activeTab.value === 'gtm') formData.value = { event_name: dynamicGtmEvents.value[0] || '', status: 'Active - Verified', icon_name: 'check-circle', color_hex: '#10B981', audit_date: new Date().toISOString().split('T')[0] }
    else if (activeTab.value === 'users') formData.value = { role: 'Viewer', status: 'Active' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  openSelect.value = null
  setTimeout(() => { formData.value = {} }, 300)
}

const saveData = async () => {
  saving.value = true
  const table = currentTabConfig.value.table
  const isEditing = !!editingId.value
  
  try {
    const payload = { ...formData.value }
    let dbError = null

    if (activeTab.value === 'users') {
      if (isEditing) {
        const { error } = await supabase.from(table).update({
          full_name: payload.full_name,
          role: payload.role,
          status: payload.status
        }).eq('id', editingId.value)
        dbError = error
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: { data: { full_name: payload.full_name } }
        })
        
        if (authError) throw authError

        if (authData.user) {
          setTimeout(async () => {
            await supabase.from(table).update({
              role: payload.role,
              status: payload.status
            }).eq('id', authData.user.id)
            fetchData()
          }, 1500)
        }
      }
    } else {
      if (isEditing) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingId.value)
        dbError = error
      } else {
        const { error } = await supabase.from(table).insert([payload])
        dbError = error
      }
    }
    
    if (dbError) throw dbError

    await fetchData()
    closeModal()
    
    showToast(
      isEditing ? 'Update Successful' : 'Record Created', 
      isEditing ? 'The record has been updated successfully.' : 'New record was added to the database.', 
      'success'
    )

  } catch (error) {
    console.error('Error saving data:', error)
    showToast('Action Failed', error.message, 'error')
  } finally {
    saving.value = false
  }
}

const deleteRecord = async (id) => {
  if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return
  
  try {
    const table = currentTabConfig.value.table
    const { error } = await supabase.from(table).delete().eq('id', id)
    
    if (error) throw error
    
    await fetchData()
    showToast('Record Deleted', 'The record has been permanently removed.', 'info')

  } catch (error) {
    console.error('Error deleting record:', error)
    showToast('Delete Failed', error.message, 'error')
  }
}

const toggleSelect = (selectId) => {
  openSelect.value = openSelect.value === selectId ? null : selectId
}

const selectOption = (key, value) => {
  formData.value[key] = value
  setTimeout(() => openSelect.value = null, 50)
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.custom-select')) {
    openSelect.value = null
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getBadgeClass = (status) => {
  if (status === 'Investigating' || status === 'In Progress') return 'badge-progress'
  if (status === 'Resolved' || status === 'Done') return 'badge-done'
  return 'badge-open'
}

onMounted(async () => {
  fetchData()
  document.addEventListener('click', handleClickOutside)

  try {
    const gtmData = await $fetch('/api/gtm')
    if (gtmData && Array.isArray(gtmData.tags)) {
      const rawNames = gtmData.tags.map(tag => tag.name).filter(name => name && name.trim() !== '') 
      dynamicGtmEvents.value = [...new Set(rawNames)]
    }
  } catch (err) {
    console.error("Failed to fetch dynamic GTM events:", err)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.admin-workspace { display: flex; flex-direction: column; gap: 20px; height: 100%; }
.admin-layout { display: flex; gap: 24px; height: calc(100vh - 140px); }

.admin-sidebar { width: 260px; padding: 24px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
.admin-nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px;
  background: transparent; border: 1px solid transparent; color: var(--text-secondary);
  border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease; text-align: left;
}
.admin-nav-item:hover { background: rgba(255, 255, 255, 0.03); color: #fff; }
.admin-nav-item.active { background: rgba(0, 217, 207, 0.1); border-color: rgba(0, 217, 207, 0.2); color: var(--teal-normal); }

.admin-main { flex-grow: 1; padding: 30px; display: flex; flex-direction: column; overflow: hidden; }
.main-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.main-header h2 { margin: 0 0 6px 0; font-size: 20px; color: #fff; }
.main-header .desc { margin: 0; font-size: 13px; color: var(--text-secondary); }

.table-container { overflow-y: auto; flex-grow: 1; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); position: sticky; top: 0; background: var(--bg-card); z-index: 10; }
td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); color: var(--text-secondary); }
tr:hover td { background: rgba(255, 255, 255, 0.02); }
.empty-state { text-align: center; padding: 60px; color: var(--text-tertiary); font-style: italic; }

.badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-progress { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }
.badge-open { background: rgba(248, 113, 113, 0.1); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.2); }
.badge-done { background: rgba(33, 196, 94, 0.1); color: var(--green-normal); border: 1px solid rgba(33, 196, 94, 0.2); }
.badge-muted { background: transparent; color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
.owner-badge { display: inline-flex; align-items: center; gap: 6px; }
.owner-badge .dot { width: 8px; height: 8px; border-radius: 50%; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-small { width: 24px; height: 24px; border-radius: 50%; background: var(--teal-normal); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }
.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-tertiary); }
.status-active { color: var(--green-normal); }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-normal); box-shadow: 0 0 8px var(--green-normal); animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(33, 196, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0); } }

.action-cell { display: flex; gap: 8px; align-items: center; }
.edit-btn { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.edit-btn:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: var(--border-hover); }

.del-row-btn { background: transparent; border: 1px solid var(--border-subtle); color: #F87171; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.del-row-btn:hover { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.3); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 999; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
.modal-overlay.is-open { opacity: 1; visibility: visible; }

.slide-over { position: absolute; top: 0; right: 0; width: 500px; max-width: 100vw; height: 100vh; background: rgba(17, 22, 31, 0.95); border-left: 1px solid var(--border-subtle); box-shadow: -10px 0 40px rgba(0,0,0,0.5); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
.modal-overlay.is-open .slide-over { transform: translateX(0); }

.slide-header { padding: 24px 30px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
.slide-header h3 { margin: 0; font-size: 18px; color: #fff; }
.close-btn { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; }
.close-btn:hover { color: #fff; }

.slide-body { flex-grow: 1; overflow-y: auto; padding: 30px; }
.slide-footer { padding: 20px 30px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 12px; background: rgba(17, 22, 31, 0.95); }

.admin-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; position: relative; }
.form-row { display: flex; gap: 16px; width: 100%; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
input, textarea { width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); color: #fff; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 14px; outline: none; transition: border-color 0.2s; font-family: var(--font); }
input:focus, textarea:focus { border-color: var(--teal-normal); }

.custom-select { position: relative; width: 100%; cursor: pointer; user-select: none; }
.select-trigger { display: flex; justify-content: space-between; align-items: center; width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); color: #fff; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 14px; transition: all 0.2s ease; }
.select-trigger.open { border-color: var(--teal-normal); box-shadow: 0 0 0 2px rgba(0, 217, 207, 0.1); }
.select-trigger .chevron { transition: transform 0.2s ease; color: var(--text-tertiary); }
.select-trigger.open .chevron { transform: rotate(180deg); }

.select-menu { position: absolute; top: calc(100% + 4px); left: 0; width: 100%; margin: 0; padding: 6px; list-style: none; background: rgba(17, 22, 31, 0.98); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); z-index: 1000; animation: dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes dropdownFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.select-menu li { padding: 10px 12px; border-radius: 4px; color: var(--text-secondary); font-size: 13.5px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
.select-menu li:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.select-menu li.selected { color: #fff; font-weight: 500; }
.select-menu .check-icon { color: var(--teal-normal); }

.color-picker { padding: 4px; height: 44px; cursor: pointer; }
.bullet-row { display: flex; gap: 8px; margin-bottom: 8px; }
.del-btn { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.2); color: #F87171; border-radius: 6px; padding: 0 12px; cursor: pointer; }
.add-bullet-btn { background: transparent; border: 1px dashed var(--border-subtle); color: var(--text-secondary); padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer; }
.add-bullet-btn:hover { color: #fff; border-color: #fff; }

.switch-group { flex-direction: row; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 6px; border: 1px solid var(--border-subtle); }
.toggle-switch { width: auto; cursor: pointer; accent-color: var(--teal-normal); }

.action-btn { padding: 10px 20px; border-radius: 100px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
.action-btn.primary { background: var(--teal-normal); color: #000; }
.action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 217, 207, 0.3); }
.action-btn.secondary { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); }
.action-btn.secondary:hover { background: rgba(255,255,255,0.05); color: #fff; }

/* 🚀 Toast Notifications Styles */
.toast-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 320px;
  background: rgba(17, 22, 31, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast-item::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 4px;
}

.toast-success::before { background: var(--green-normal); }
.toast-success .toast-icon { color: var(--green-normal); }

.toast-error::before { background: #F87171; }
.toast-error .toast-icon { color: #F87171; }

.toast-info::before { background: var(--teal-normal); }
.toast-info .toast-icon { color: var(--teal-normal); }

.toast-content { flex-grow: 1; }
.toast-title { margin: 0 0 4px 0; color: #fff; font-size: 14px; font-weight: 600; }
.toast-message { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.4; }

.toast-close {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}
.toast-close:hover { color: #fff; background: rgba(255,255,255,0.05); }

/* Toast Animations */
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-enter-from { opacity: 0; transform: translateX(100%); }
.toast-slide-leave-to { opacity: 0; transform: translateY(-20px) scale(0.95); }
</style>