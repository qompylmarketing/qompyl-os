import { google } from "googleapis";
import fs from "fs";

// 1. إعداد المصادقة باستخدام ملف المفتاح السري الخاص بك
const auth = new google.auth.GoogleAuth({
  keyFile: "qompyl-507210-536b3ed8dad0.json", // تأكد من اسم الملف
  scopes: ["https://www.googleapis.com/auth/tagmanager.readonly"],
});

const tagmanager = google.tagmanager({ version: "v2", auth });

// 2. ضع الأرقام التي استخرجتها من رابط GTM هنا
const ACCOUNT_ID = "6372324277";
const CONTAINER_ID = "261739986";
const parent = `accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`;

async function fetchGTMData() {
  try {
    console.log("Fetching Real GTM Ecosystem Data...");

    // أ) سحب النسخة الحية (التي تعمل الآن على الموقع)
    const liveVersionResponse = await tagmanager.accounts.containers.versions.live({
      parent: parent,
    });
    const liveVersion = liveVersionResponse.data;

    // ب) سحب تاريخ الإصدارات (Versions History)
    // التعديل تم هنا: استخدام version_headers بالشرطة السفلية
    const versionsResponse = await tagmanager.accounts.containers.version_headers.list({
      parent: parent,
    });
    
    // البيانات هنا تأتي داخل مصفوفة containerVersionHeader
    const versionsList = versionsResponse.data.containerVersionHeader || [];

    // تجميع البيانات في ملف واحد
    const gtmData = {
      container: liveVersion.container,
      versionInfo: {
        versionId: liveVersion.containerVersionId,
        name: liveVersion.name || `Version ${liveVersion.containerVersionId}`,
        fingerprint: liveVersion.fingerprint,
        description: liveVersion.description || "No description provided",
      },
      tags: liveVersion.tag || [],
      triggers: liveVersion.trigger || [],
      variables: liveVersion.variable || [],
      history: versionsList.slice(0, 5).map((v) => ({
        // نأخذ آخر 5 إصدارات فقط
        versionId: v.containerVersionId,
        name: v.name || `v${v.containerVersionId}`,
        description: v.description || "-",
      })),
    };

    // حفظ البيانات محلياً
    fs.writeFileSync("gtm-real-data.json", JSON.stringify(gtmData, null, 2));
    console.log("✅ GTM Data successfully saved to gtm-real-data.json");
  } catch (error) {
    console.error("❌ Error fetching GTM data:", error.message);
  }
}

fetchGTMData();