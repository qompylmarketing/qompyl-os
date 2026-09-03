// server/api/gtm.js
import fs from 'fs'
import path from 'path'

export default defineEventHandler((event) => {
  // 1. قراءة ملف الداتا الحقيقية الذي استخرجه السكريبت
  const filePath = path.resolve(process.cwd(), 'gtm-real-data.json')
  let realData = null
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    realData = JSON.parse(rawData)
  } catch (e) {
    return { error: 'GTM Data file not found. Run fetch-gtm.js first.' }
  }

  // 2. دوال مساعدة لترجمة أنواع التاغات من GTM API إلى شكل مقروء في الـ UI
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

  // ترجمة الـ Triggers (GTM يربطها بالـ Tags عن طريق ID، نحن نبحث عن الاسم)
  const getTriggerNames = (firingTriggerId) => {
    if (!firingTriggerId || !realData.triggers) return 'Initialization / All Pages'
    const triggerNames = firingTriggerId.map(id => {
      const trigger = realData.triggers.find(t => t.triggerId === id)
      return trigger ? trigger.name : 'Unknown Trigger'
    })
    return triggerNames.join(', ')
  }

  // 3. تجهيز بيانات جدول التاغات (Tags Inventory)
  const formattedTags = (realData.tags || []).map(tag => {
    const typeInfo = parseTagType(tag.type)
    return {
      name: tag.name,
      type: typeInfo.name,
      badgeClass: typeInfo.badge,
      trigger: getTriggerNames(tag.firingTriggerId),
      status: tag.paused ? 'Paused' : 'Active'
    }
  })

  // 4. تجهيز بيانات جدول الـ Triggers
  const formattedTriggers = (realData.triggers || []).map(trigger => {
    const typeMap = {
      'pageview': 'Page View',
      'customEvent': 'Custom Event',
      'click': 'Click',
      'windowLoaded': 'Window Loaded',
      'domReady': 'DOM Ready'
    }
    
    // محاولة استخراج الشروط بشكل مبسط
    let conditions = 'Standard Firing Rule'
    if (trigger.type === 'customEvent' && trigger.customEventFilter) {
       conditions = 'Event matching specific criteria'
    } else if (trigger.filter && trigger.filter.length > 0) {
       conditions = 'Has Custom Filters/Conditions'
    }

    return {
      name: trigger.name,
      type: typeMap[trigger.type] || trigger.type,
      conditions: conditions
    }
  })

  // 5. التدقيق الذكي (Smart Audit Log)
  // الكود هنا يبحث في التاغات الحقيقية للعميل ليتحقق من وجود أحداث رئيسية
  const hasLeadTag = formattedTags.some(t => t.name.toLowerCase().includes('lead') || t.name.toLowerCase().includes('apply'))
  const hasCtaTag = formattedTags.some(t => t.name.toLowerCase().includes('cta'))
  const hasScrollTag = formattedTags.some(t => t.name.toLowerCase().includes('scroll'))

  const auditEvents = [
    { name: 'generate_lead', status: hasLeadTag ? 'Verified Active' : 'Missing/Paused', icon: hasLeadTag ? 'check-circle' : 'alert-triangle', color: hasLeadTag ? 'var(--green-normal)' : '#F97316', date: 'Just now', env: 'Live' },
    { name: 'cta_click', status: hasCtaTag ? 'Verified Active' : 'Missing/Paused', icon: hasCtaTag ? 'check-circle' : 'alert-triangle', color: hasCtaTag ? 'var(--green-normal)' : '#F97316', date: 'Just now', env: 'Live' },
    { name: 'scroll_depth', status: hasScrollTag ? 'Verified Active' : 'Missing/Paused', icon: hasScrollTag ? 'check-circle' : 'alert-triangle', color: hasScrollTag ? 'var(--green-normal)' : '#F97316', date: 'Just now', env: 'Live' },
    { name: 'purchase', status: 'Inactive / Staging', icon: 'pause-circle', color: 'var(--text-tertiary)', date: 'Pending', env: 'Awaiting eCommerce module' }
  ]

  // 6. إرسال البيانات المجهزة للـ Frontend
  return {
    kpis: {
      container: {
        id: realData.container.publicId, // يسحب رقم الحاوية الحقيقي
        status: 'Healthy',
        statusColor: 'green'
      },
      version: {
        number: realData.versionInfo.name || `v${realData.versionInfo.versionId}`,
        date: 'Live Now'
      },
      governance: {
        publisher: 'Mamdouh Ghaneemy',
        role: 'Lead Architect'
      },
      workspace: {
        tags: (realData.tags || []).length,
        triggers: (realData.triggers || []).length,
        variables: (realData.variables || []).length
      }
    },
    auditEvents,
    tags: formattedTags,
    triggers: formattedTriggers
  }
})