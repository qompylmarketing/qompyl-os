<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo Area -->
      <div class="logo-container">
        <img src="/logo.svg" alt="Qompyl Logo" class="brand-logo" />
      </div>

      <!-- Main Navigation -->
      <nav class="nav-menu">
        <div class="nav-section-label">Menu</div>
        
        <NuxtLink to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <Icon name="home" :size="18" />
          <span class="nav-label">Home</span>
        </NuxtLink>

        <NuxtLink to="/search-console" class="nav-item" :class="{ active: $route.path === '/search-console' }">
          <Icon name="search" :size="18" />
          <span class="nav-label">Search Console</span>
          <div class="nav-status-dot dot-green"></div>
        </NuxtLink>

        <NuxtLink to="/ga4" class="nav-item" :class="{ active: $route.path === '/ga4' }">
          <Icon name="bar-chart-2" :size="18" />
          <span class="nav-label">Google Analytics</span>
          <div class="nav-status-dot dot-green"></div>
        </NuxtLink>

        <NuxtLink to="/gtm" class="nav-item" :class="{ active: $route.path === '/gtm' }">
          <Icon name="tag" :size="18" />
          <span class="nav-label">Tag Manager</span>
          <div class="nav-status-dot dot-green"></div>
        </NuxtLink>

        <NuxtLink to="/clarity" class="nav-item" :class="{ active: $route.path === '/clarity' }">
          <Icon name="mouse-pointer" :size="18" />
          <span class="nav-label">Microsoft Clarity</span>
          <div class="nav-status-dot dot-green"></div>
        </NuxtLink>

        <NuxtLink to="/leads" class="nav-item" :class="{ active: $route.path === '/leads' }">
          <Icon name="user-check" :size="18" />
          <span class="nav-label">Early Access Leads</span>
          <div class="nav-status-dot dot-green"></div>
        </NuxtLink>

        <!-- Workspace Section -->
        <div class="nav-section-label">Workspace</div>
        
        <!-- 🚀 إخفاء هذا الزر إذا لم يكن المستخدم أدمن -->
        <NuxtLink 
          v-if="userRole === 'Administrator'" 
          to="/admin" 
          class="nav-item" 
          :class="{ active: $route.path === '/admin' }"
        >
          <Icon name="database" :size="18" />
          <span class="nav-label">Qompyl Studio</span>
        </NuxtLink>

        <NuxtLink to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
          <Icon name="settings" :size="18" />
          <span class="nav-label">Settings</span>
        </NuxtLink>

      
      </nav>

      <!-- User Profile Footer -->
      <div class="user-footer">
        <div class="user-info">
          <!-- نعرض الحرف الأول من اسم المستخدم، وإذا لم يكن موجوداً نعرض 'U' -->
          <div class="user-avatar">{{ userName.charAt(0) || 'U' }}</div>
          <div class="user-details">
            <span class="user-name">{{ userName || userEmail }}</span>
            <span class="user-role">{{ userRole || 'Loading...' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Sign Out">
          <Icon name="log-out" :size="16" />
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()

// حالة (State) لبيانات المستخدم
const userEmail = ref('')
const userName = ref('')
const userRole = ref('')

onMounted(async () => {
  // جلب المستخدم الحالي مباشرة من خادم Supabase Auth (أكثر موثوقية)
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    userEmail.value = user.email

    // البحث باستخدام ID المستخدم في جدول user_roles الجديد
    const { data, error } = await supabase
      .from('user_roles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (data) {
      userName.value = data.full_name
      userRole.value = data.role
    } else {
      userRole.value = 'Viewer'
      console.warn('User ID not found in user_roles table. Defaulting to Viewer.')
    }
  }
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<style scoped>
/* 
  يرجى التأكد من الاحتفاظ بجميع التنسيقات (CSS) السابقة 
  الخاصة بملف layouts/default.vue هنا كما هي.
  (لم أقم بتكرارها لتوفير المساحة ولأننا نركز على منطق الـ Logic)
*/

.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--bg-main);
  color: #fff;
}

.sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.logo-container {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 65%; /* يمكنك زيادة أو تقليل الحجم حسب أبعاد شعارك */
  height: auto;
  object-fit: contain; /* يضمن عدم تشوه الصورة */
  border-radius: var(--radius-sm);
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 16px 0 8px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
}

.nav-item.active {
  background: rgba(0, 217, 207, 0.1);
  color: #fff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--teal-normal);
  border-radius: 0 4px 4px 0;
}

.nav-item .icon {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.nav-item:hover .icon, .nav-item.active .icon {
  opacity: 1;
  color: var(--teal-normal);
}

.nav-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: auto;
}

.dot-green { background: var(--green-normal); box-shadow: 0 0 6px rgba(33, 196, 94, 0.4); }
.dot-red { background: #F87171; box-shadow: 0 0 6px rgba(248, 113, 113, 0.4); }

.user-footer {
  padding: 20px 16px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: start;
  gap: 12px;
  flex-direction: column;
  justify-content: end;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--teal-normal);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.user-role {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.logout-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px 40px;
  max-width: 1400px;
}

@media (max-width: 1024px) {
  .main-content { padding: 24px; }
}

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
  .main-content { margin-left: 0; }
}
/* 🚀 Page Transition Animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(15px);
  filter: blur(4px); /* لمسة فخمة: ضبابية خفيفة قبل الظهور */
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-15px);
  filter: blur(4px);
}
</style>