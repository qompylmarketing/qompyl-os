<template>
  <div class="settings-workspace" @click="closeDropdowns">
    <!-- Header -->
    <header class="header">
      <div class="brand-title">
        <h1><Icon name="settings" :size="24" style="color: var(--teal-normal);" /> Settings & Preferences</h1>
        <p>Manage your personal security, customize dashboard display, and monitor system connections.</p>
      </div>
    </header>

    <div class="bento-grid fade-in">
      
      <!-- 1. My Account & Security Card -->
      <div class="bento-card col-6 flex-col-card">
        <div class="card-header">
          <h3 class="card-title"><Icon name="shield" :size="18" style="color: var(--teal-normal);" /> My Account</h3>
          <p class="card-desc">Your personal profile and security settings.</p>
        </div>
        
        <div class="profile-info">
          <div class="avatar-large">{{ user.initial }}</div>
          <div class="user-details">
            <h4>{{ user.name }}</h4>
            <p class="user-email">{{ user.email }}</p>
            <span class="badge badge-progress" style="margin-top: 6px; display: inline-block;">{{ user.role }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <form @submit.prevent="updatePassword" class="settings-form">
          <h4 class="form-section-title">Update Password</h4>
          <div class="form-row">
            <!-- 🚀 حقل الباسورد الجديد مع أيقونة العين -->
            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrapper">
                <input :type="showNewPassword ? 'text' : 'password'" v-model="passwords.new" placeholder="••••••••" required minlength="6">
                <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
                  <Icon :name="showNewPassword ? 'eye-off' : 'eye'" :size="16" />
                </button>
              </div>
            </div>
            
            <!-- 🚀 حقل تأكيد الباسورد مع أيقونة العين -->
            <div class="form-group">
              <label>Confirm Password</label>
              <div class="input-wrapper">
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="passwords.confirm" placeholder="••••••••" required minlength="6">
                <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                  <Icon :name="showConfirmPassword ? 'eye-off' : 'eye'" :size="16" />
                </button>
              </div>
            </div>
          </div>
          <button type="submit" class="action-btn primary" style="align-self: flex-start; margin-top: 8px;" :disabled="savingPassword">
            <Icon name="lock" :size="14" /> {{ savingPassword ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>

      <!-- 2. System Preferences Card -->
      <div class="bento-card col-6 flex-col-card">
        <div class="card-header">
          <h3 class="card-title"><Icon name="sliders" :size="18" style="color: var(--blue-normal);" /> System Preferences</h3>
          <p class="card-desc">Customize how data is displayed across your workspaces.</p>
        </div>

        <form @submit.prevent="savePreferences" class="settings-form" style="margin-top: 10px;">
          <div class="form-group">
            <label>System Timezone</label>
            <div class="custom-select" @click.stop="toggleSelect('timezone')">
              <div class="select-trigger" :class="{ 'open': openSelect === 'timezone' }">
                <span>{{ preferences.timezone }}</span>
                <Icon name="chevron-down" :size="16" class="chevron" />
              </div>
              <ul class="select-menu" v-if="openSelect === 'timezone'">
                <li v-for="tz in timezones" :key="tz" @click.stop="selectPref('timezone', tz)" :class="{ 'selected': preferences.timezone === tz }">
                  {{ tz }}<Icon v-if="preferences.timezone === tz" name="check" :size="14" class="check-icon"/>
                </li>
              </ul>
            </div>
            <small class="help-text">Affects how event timestamps are displayed in audits and sessions.</small>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label>Default Date Range (Clarity & Analytics)</label>
            <div class="custom-select" @click.stop="toggleSelect('dateRange')">
              <div class="select-trigger" :class="{ 'open': openSelect === 'dateRange' }">
                <span>{{ rangeLabels[preferences.defaultRange] }}</span>
                <Icon name="chevron-down" :size="16" class="chevron" />
              </div>
              <ul class="select-menu" v-if="openSelect === 'dateRange'">
                <li v-for="(label, key) in rangeLabels" :key="key" @click.stop="selectPref('defaultRange', key)" :class="{ 'selected': preferences.defaultRange === key }">
                  {{ label }}<Icon v-if="preferences.defaultRange === key" name="check" :size="14" class="check-icon"/>
                </li>
              </ul>
            </div>
            <small class="help-text">The default time frame loaded when you open analytical modules.</small>
          </div>

          <button type="submit" class="action-btn secondary" style="align-self: flex-start; margin-top: 24px;" :disabled="savingPrefs">
            <Icon name="save" :size="14" /> {{ savingPrefs ? 'Saving...' : 'Save Preferences' }}
          </button>
        </form>
      </div>

      <!-- 3. Integrations Status (Read Only) Card -->
      <div class="bento-card col-12 premium-card">
        <div class="card-header">
          <h3 class="card-title"><Icon name="link" :size="18" style="color: #10B981;" /> Active Integrations</h3>
          <p class="card-desc">Live status of external APIs and tracking connections powering Qompyl OS.</p>
        </div>
        
        <div class="integrations-grid">
          
          <!-- 🚀 Google Search Console (Added) -->
          <div class="integration-item">
            <div class="integ-icon" style="background: rgba(139, 92, 246, 0.1); color: #8B5CF6;">
              <Icon name="search" :size="20" />
            </div>
            <div class="integ-details">
              <h4>Google Search Console</h4>
              <p>Organic Search API</p>
            </div>
            <div class="status-indicator status-active">
              <div class="pulse-dot"></div> Connected
            </div>
          </div>

          <!-- Google Analytics 4 -->
          <div class="integration-item">
            <div class="integ-icon" style="background: rgba(251, 191, 36, 0.1); color: #FBBF24;">
              <Icon name="bar-chart-2" :size="20" />
            </div>
            <div class="integ-details">
              <h4>Google Analytics 4</h4>
              <p>Traffic & Conversion API</p>
            </div>
            <div class="status-indicator status-active">
              <div class="pulse-dot"></div> Connected
            </div>
          </div>

          <!-- Google Tag Manager -->
          <div class="integration-item">
            <div class="integ-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">
              <Icon name="shield-check" :size="20" />
            </div>
            <div class="integ-details">
              <h4>Google Tag Manager</h4>
              <p>Events Tracking API</p>
            </div>
            <div class="status-indicator status-active">
              <div class="pulse-dot"></div> Connected
            </div>
          </div>

          <!-- Microsoft Clarity -->
          <div class="integration-item">
            <div class="integ-icon" style="background: rgba(6, 144, 249, 0.1); color: var(--blue-normal);">
              <Icon name="mouse-pointer" :size="20" />
            </div>
            <div class="integ-details">
              <h4>Microsoft Clarity</h4>
              <p>UX & Behavior API</p>
            </div>
            <div class="status-indicator status-active">
              <div class="pulse-dot"></div> Connected
            </div>
          </div>

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
import { ref, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()

// --- 1. User State (Real Data from Supabase) ---
const authUser = ref(null) // لحفظ الـ ID الخاص بالمستخدم لتحديث بياناته
const user = ref({
  name: 'Loading...',
  email: 'loading...',
  role: '...',
  initial: ''
})

// --- 2. Password Form State ---
const passwords = ref({ new: '', confirm: '' })
const savingPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// --- 3. Preferences State ---
const preferences = ref({
  timezone: 'Africa/Cairo',
  defaultRange: '3'
})
const savingPrefs = ref(false)

// Dropdown Options
const timezones = ['Africa/Cairo', 'UTC (Coordinated Universal Time)', 'America/New_York', 'Europe/London', 'Asia/Dubai']
const rangeLabels = {
  '1': 'Last 24 Hours',
  '3': 'Last 3 Days',
  '7': 'Last 7 Days'
}

// Custom Select Logic
const openSelect = ref(null)
const toggleSelect = (selectId) => {
  openSelect.value = openSelect.value === selectId ? null : selectId
}
const selectPref = (key, value) => {
  preferences.value[key] = value
  setTimeout(() => openSelect.value = null, 50)
}
const closeDropdowns = () => {
  openSelect.value = null
}

// --- 4. Toast Management System ---
const toasts = ref([])
let toastCounter = 0

const showToast = (title, message, type = 'success') => {
  const id = toastCounter++
  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info')
  toasts.value.push({ id, title, message, type, icon })
  setTimeout(() => removeToast(id), 3500)
}
const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

// --- 5. Database Actions ---

// A. جلب بيانات المستخدم عند فتح الصفحة
const loadUserData = async () => {
  try {
    // 1. جلب الإيميل والـ ID من نظام المصادقة
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !currentUser) throw new Error("Could not authenticate user.")
    
    authUser.value = currentUser

    // 2. جلب الاسم، الدور، والتفضيلات من جدول user_roles
    const { data: profileData, error: profileError } = await supabase
      .from('user_roles')
      .select('full_name, role, timezone, default_date_range')
      .eq('id', currentUser.id)
      .single()

    if (profileError) throw profileError

    // 3. تعبئة الواجهة بالبيانات الحقيقية
    user.value = {
      name: profileData.full_name || 'Admin User',
      email: currentUser.email,
      role: profileData.role || 'Administrator',
      initial: (profileData.full_name || 'A').charAt(0).toUpperCase()
    }

    // 4. تعبئة التفضيلات
    if (profileData.timezone) preferences.value.timezone = profileData.timezone
    if (profileData.default_date_range) preferences.value.defaultRange = profileData.default_date_range

  } catch (error) {
    console.error('Error loading profile:', error)
    showToast('Error', 'Failed to load user profile.', 'error')
  }
}

// B. تحديث كلمة المرور
const updatePassword = async () => {
  if (passwords.value.new !== passwords.value.confirm) {
    showToast('Validation Error', 'Passwords do not match. Please try again.', 'error')
    return
  }
  
  savingPassword.value = true
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwords.value.new
    })

    if (error) throw error

    passwords.value = { new: '', confirm: '' }
    showToast('Security Updated', 'Your password has been changed successfully.', 'success')
  } catch (error) {
    showToast('Update Failed', error.message, 'error')
  } finally {
    savingPassword.value = false
  }
}

// C. حفظ التفضيلات
const savePreferences = async () => {
  if (!authUser.value) return

  savingPrefs.value = true
  
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({
        timezone: preferences.value.timezone,
        default_date_range: preferences.value.defaultRange
      })
      .eq('id', authUser.value.id)

    if (error) throw error

    showToast('Preferences Saved', 'Your system display preferences have been updated.', 'success')
  } catch (error) {
    showToast('Save Failed', error.message, 'error')
  } finally {
    savingPrefs.value = false
  }
}

// تشغيل جلب البيانات بمجرد فتح الصفحة
onMounted(() => {
  loadUserData()
})
</script>
<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.settings-workspace { display: flex; flex-direction: column; gap: 20px; padding-bottom: 40px;}
.fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* Cards Specifics */
.flex-col-card { display: flex; flex-direction: column; }
.premium-card { border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 8px 32px rgba(16, 185, 129, 0.05); background: linear-gradient(180deg, rgba(17, 22, 31, 1) 0%, rgba(16, 185, 129, 0.02) 100%); }

/* Profile Info Section */
.profile-info { display: flex; align-items: center; gap: 20px; margin-top: 20px; }
.avatar-large { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-normal), #0690f9); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 28px; flex-shrink: 0; box-shadow: 0 4px 20px rgba(0, 217, 207, 0.3); }
.user-details h4 { margin: 0 0 4px 0; font-size: 18px; color: #fff; }
.user-email { margin: 0; font-size: 14px; color: var(--text-secondary); font-family: var(--font-mono); }
.badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-progress { background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2); }

.divider { height: 1px; background: var(--border-subtle); margin: 24px 0; width: 100%; }

/* Forms Styling */
.settings-form { display: flex; flex-direction: column; gap: 16px; }
.form-section-title { margin: 0 0 4px 0; font-size: 14px; color: #fff; font-weight: 600; }
.form-row { display: flex; gap: 16px; width: 100%; }
.form-group { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; position: relative; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

/* 🚀 Password Input Wrapper Styling */
.input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
.input-wrapper input { width: 100%; padding-right: 40px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); color: #fff; padding-top: 12px; padding-bottom: 12px; padding-left: 14px; border-radius: var(--radius-sm); font-size: 14px; outline: none; transition: border-color 0.2s; font-family: var(--font); }
.input-wrapper input:focus { border-color: var(--teal-normal); }
.toggle-password { position: absolute; right: 12px; background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; transition: color 0.2s; }
.toggle-password:hover { color: #fff; }

.help-text { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

/* Custom Select */
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

/* Buttons */
.action-btn { padding: 10px 20px; border-radius: 100px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
.action-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.action-btn.primary { background: var(--teal-normal); color: #000; }
.action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 217, 207, 0.3); }
.action-btn.secondary { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); }
.action-btn.secondary:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #fff; }

/* 🚀 Integrations Grid (Updated to 2x2 Layout) */
.integrations-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
.integration-item { display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 20px; border-radius: var(--radius-md); transition: transform 0.2s ease, border-color 0.2s ease; }
.integration-item:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03); }
.integ-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.integ-details { flex-grow: 1; }
.integ-details h4 { margin: 0 0 4px 0; font-size: 15px; color: #fff; }
.integ-details p { margin: 0; font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono); }

/* Status Indicator (Pulse) */
.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.status-active { color: var(--green-normal); }
.pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-normal); box-shadow: 0 0 8px var(--green-normal); animation: pulseGreen 2s infinite; }
@keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(33, 196, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(33, 196, 94, 0); } }

/* Toast Notifications Styles */
.toast-container { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; pointer-events: none; }
.toast-item { display: flex; align-items: flex-start; gap: 12px; width: 320px; background: rgba(17, 22, 31, 0.98); backdrop-filter: blur(10px); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: auto; position: relative; overflow: hidden; }
.toast-item::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
.toast-success::before { background: var(--green-normal); }
.toast-success .toast-icon { color: var(--green-normal); }
.toast-error::before { background: #F87171; }
.toast-error .toast-icon { color: #F87171; }
.toast-info::before { background: var(--teal-normal); }
.toast-info .toast-icon { color: var(--teal-normal); }
.toast-content { flex-grow: 1; }
.toast-title { margin: 0 0 4px 0; color: #fff; font-size: 14px; font-weight: 600; }
.toast-message { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.4; }
.toast-close { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s; }
.toast-close:hover { color: #fff; background: rgba(255,255,255,0.05); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-enter-from { opacity: 0; transform: translateX(100%); }
.toast-slide-leave-to { opacity: 0; transform: translateY(-20px) scale(0.95); }

@media (max-width: 1024px) {
  .integrations-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 16px; }
}
</style>