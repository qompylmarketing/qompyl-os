<!-- layouts/auth.vue -->
<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: var(--bg-main);
  display: flex;
  flex-direction: column;
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