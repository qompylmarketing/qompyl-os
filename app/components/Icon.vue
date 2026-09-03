<template>
  <component 
    v-if="iconComponent" 
    :is="iconComponent" 
    :size="size" 
    :color="color" 
    :stroke-width="strokeWidth" 
  />
</template>

<script setup>
import * as lucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  }
})

const iconComponent = computed(() => {
  // تحويل الاسم إلى PascalCase (مثال: 'shield-check' → 'ShieldCheck')
  const iconName = props.name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  return lucideIcons[`Lucide${iconName}`] || null
})
</script>