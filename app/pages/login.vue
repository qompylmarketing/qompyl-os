<template>
  <div class="login-container">
    <div class="login-card bento-card">
      <div class="brand-header">
        <Icon name="command" :size="32" style="color: var(--teal-normal);" />
        <h2>Qompyl OS</h2>
        <p>Sign in to access your analytics workspace</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- قفل الحقول أثناء التحميل لزيادة الاحترافية -->
        <fieldset :disabled="loading" class="form-fieldset" :class="{ 'is-locked': loading }">
          
          <div class="input-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <Icon name="mail" :size="16" class="input-icon" />
              <input type="email" v-model="email" placeholder="admin@qompyl.com" required />
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="input-wrapper">
              <Icon name="lock" :size="16" class="input-icon" />
              <input type="password" v-model="password" placeholder="••••••••" required />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <Icon name="alert-circle" :size="14" /> {{ errorMessage }}
          </div>

        </fieldset>

        <button type="submit" class="action-btn primary login-btn" :class="{ 'is-loading': loading }" :disabled="loading">
          <div v-if="loading" class="spinner-wrapper">
            <div class="modern-spinner"></div>
            <span class="loading-text">Securing session...</span>
          </div>
          <span v-else class="btn-content">Sign In <Icon name="arrow-right" :size="14" /></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '~/components/Icon.vue'

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  // 1. محاولة تسجيل الدخول عبر نظام مصادقة Supabase الأساسي
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (authError) {
    errorMessage.value = authError.message
    loading.value = false
    return // الخروج مبكراً في حالة فشل المصادقة الأساسية
  } 

  // 2. التحقق من صلاحية الحساب وحالته في جدول user_roles الجديد
  if (authData.user) {
     const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('status')
        .eq('id', authData.user.id) // 🚀 نستخدم الـ ID بدلاً من الإيميل للربط المباشر
        .single()

      if (roleError && roleError.code !== 'PGRST116') {
         console.error('Error fetching user status:', roleError)
      }

      // إذا وجدنا أن الحساب معلق، نقوم بتسجيل خروجه فوراً وإظهار رسالة خطأ
      if (roleData && roleData.status === 'Suspended') {
         await supabase.auth.signOut()
         errorMessage.value = 'Your account has been suspended. Please contact the administrator.'
         loading.value = false
         return
      }
      
      // التوجيه المباشر إلى الصفحة الرئيسية في حال النجاح
      navigateTo('/') 
  }
}

definePageMeta({
  layout: 'auth'
})
</script>

<style scoped>
@import '~/assets/styles/dashboard-shared.css';

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
}

.brand-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.brand-header h2 { margin: 0; font-size: 24px; color: #fff; }
.brand-header p { margin: 0; font-size: 13px; color: var(--text-secondary); }

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.form-fieldset.is-locked {
  opacity: 0.5;
  filter: grayscale(100%);
  pointer-events: none;
}

.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--text-tertiary); }
.input-wrapper input {
  width: 100%; background: rgba(17, 22, 31, 0.6); border: 1px solid var(--border-subtle);
  color: #fff; padding: 12px 14px 12px 40px; border-radius: var(--radius-sm);
  font-size: 14px; outline: none; transition: all 0.2s ease;
}
.input-wrapper input:focus { border-color: var(--teal-normal); box-shadow: 0 0 0 2px rgba(0, 217, 207, 0.1); }

.error-message {
  display: flex; align-items: center; gap: 8px; padding: 12px;
  background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.2);
  color: #F87171; border-radius: var(--radius-sm); font-size: 13px;
  animation: shake 0.4s ease-in-out;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 14px;
  margin-top: 10px;
  background: var(--teal-normal);
  color: #000;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn .btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 217, 207, 0.3);
}

.login-btn.is-loading {
  background: #00b3ab; 
  cursor: wait;
  box-shadow: none;
  transform: none;
}

.spinner-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modern-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loading-text {
  animation: pulse-text 1.5s infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>