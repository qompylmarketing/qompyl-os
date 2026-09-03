// server/api/gtm.js
// 🚀 استيراد البيانات الحقيقية من ملف JSON مباشرة
import realData from '../../gtm-real-data.json'

export default defineEventHandler((event) => {
  const parseTagType = (type) => {
    const types = {
      'gaawc': { name: 'Google Tag (GA4)', badge: 'badge-ga4' },
      'gaawe': { name: 'GA4 Event', badge: 'badge-ga4' },
      'html': { name: 'Custom HTML', badge: 'badge-html' },
      'linkedin': { name: 'LinkedIn', badge: 'badge-linkedin' },
      'ua': { name: 'Universal Analytics', badge: 'badge-muted' }
    }
    return types[type] || { name: type, badge: 'badge-muted' }
  }

  const getTriggerNames = (firingTriggerId) => {
    if (!firingTriggerId || !realData.triggers) return 'Initialization / All Pages'
    const triggerNames = firingTriggerId.map(id => {
      const trigger = realData.triggers.find(t => t.triggerId === id)
      return trigger ? trigger.name : 'Unknown Trigger'
    })
    return triggerNames.join(', ')
  }

  const formattedTags = (realData.tags || []).map(tag => {
    const typeInfo = parseTagType(tag.type)
    return {
      name: tag.name, type: typeInfo.name, badgeClass: typeInfo.badge,
      trigger: getTriggerNames(tag.firingTriggerId), status: tag.paused ? 'Paused' : 'Active'
    }
  })

  const formattedTriggers = (realData.triggers || []).map(trigger => {
    const typeMap = { 'pageview': 'Page View', 'customEvent': 'Custom Event', 'click': 'Click', 'windowLoaded': 'Window Loaded', 'domReady': 'DOM Ready' }
    let conditions = 'Standard Firing Rule'
    if (trigger.type === 'customEvent' && trigger.customEventFilter) conditions = 'Event matching specific criteria'
    else if (trigger.filter && trigger.filter.length > 0) conditions = 'Has Custom Filters/Conditions'
    return { name: trigger.name, type: typeMap[trigger.type] || trigger.type, conditions: conditions }
  })

  return {
    kpis: {
      container: { id: realData.container.publicId, status: 'Healthy', statusColor: 'green' },
      version: { number: realData.versionInfo.name || `v${realData.versionInfo.versionId}`, date: 'Live Now' },
      governance: { publisher: 'Mamdouh Ghaneemy', role: 'Lead Architect' },
      workspace: { tags: (realData.tags || []).length, triggers: (realData.triggers || []).length, variables: (realData.variables || []).length }
    },
    tags: formattedTags,
    triggers: formattedTriggers
  }
})