import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BASE_URL = "http://localhost:5010/api/v1/media";

async function main() {
  console.log("====================================================================");
  console.log("🧪 Testing Central Media Management API Endpoints");
  console.log("====================================================================\n");

  // 1. Test GET /api/v1/media/stats
  console.log("📊 1. Testing GET /api/v1/media/stats...");
  const statsRes = await fetch(`${BASE_URL}/stats`);
  if (!statsRes.ok) throw new Error(`GET /stats failed: ${statsRes.status} ${await statsRes.text()}`);
  const statsJson: any = await statsRes.json();
  console.log("   ✓ Stats response:", statsJson.data);

  // 2. Test GET /api/v1/media (Gallery list & pagination)
  console.log("\n🖼️ 2. Testing GET /api/v1/media (Gallery list)...");
  const listRes = await fetch(`${BASE_URL}?page=1&limit=5&type=image`);
  if (!listRes.ok) throw new Error(`GET /media failed: ${listRes.status} ${await listRes.text()}`);
  const listJson: any = await listRes.json();
  console.log(`   ✓ Total assets in DB: ${listJson.meta.total}, Page items: ${listJson.data.length}`);
  const sampleAsset = listJson.data[0];
  console.log(`   ✓ Sample asset: ID=${sampleAsset.id}, fileName=${sampleAsset.fileName}, usageCount=${sampleAsset.usageCount}`);

  // 3. Test GET /api/v1/media/:id/usage (Entity Inspector)
  console.log("\n🔍 3. Testing GET /api/v1/media/:id/usage...");
  const usageRes = await fetch(`${BASE_URL}/${sampleAsset.id}/usage`);
  if (!usageRes.ok) throw new Error(`GET /usage failed: ${usageRes.status} ${await usageRes.text()}`);
  const usageJson: any = await usageRes.json();
  console.log(`   ✓ Usage count: ${usageJson.data.usageCount}`);
  if (usageJson.data.references.length > 0) {
    const ref = usageJson.data.references[0];
    console.log(`   ✓ Sample reference: Entity=${ref.entityType} '${ref.entityTitle}', fieldPath=${ref.fieldPath}, editUrl=${ref.editUrl}`);
  }

  // 4. Test POST /api/v1/media/upload with a synthetic 100x100 PNG
  console.log("\n📤 4. Testing POST /api/v1/media/upload (New file upload)...");
  // Valid 1x1 transparent PNG buffer
  const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const pngBuffer = Buffer.from(samplePngBase64, "base64");

  const formData = new FormData();
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("files", blob, `test-automation-${Date.now()}.png`);

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error(`POST /upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  const uploadJson: any = await uploadRes.json();
  const createdAsset = uploadJson.data[0];
  console.log(`   ✓ Uploaded asset: ID=${createdAsset.id}, hash=${createdAsset.hash?.slice(0, 16)}..., isDuplicate=${createdAsset.isDuplicate}`);

  // 5. Test SHA-256 Deduplication (Upload exact same content again)
  console.log("\n⚡ 5. Testing SHA-256 Deduplication (Uploading identical content)...");
  const formData2 = new FormData();
  const blob2 = new Blob([pngBuffer], { type: "image/png" });
  formData2.append("files", blob2, `another-name-duplicate-${Date.now()}.png`);

  const dedupeRes = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData2,
  });
  if (!dedupeRes.ok) throw new Error(`Dedupe upload failed: ${dedupeRes.status} ${await dedupeRes.text()}`);
  const dedupeJson: any = await dedupeRes.json();
  const dedupeAsset = dedupeJson.data[0];
  console.log(`   ✓ Dedupe result: isDuplicate=${dedupeAsset.isDuplicate}, ID matches=${dedupeAsset.id === createdAsset.id}`);
  if (dedupeAsset.id !== createdAsset.id || !dedupeAsset.isDuplicate) {
    throw new Error("Deduplication verification failed! Asset was not recognized as duplicate.");
  }

  // 6. Test PATCH /api/v1/media/:id (Update Metadata)
  console.log("\n✏️ 6. Testing PATCH /api/v1/media/:id (Metadata update)...");
  const updateRes = await fetch(`${BASE_URL}/${createdAsset.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Automated Test Asset",
      altText: "Test Alt Text for SEO",
      caption: "Verified by Test Suite",
    }),
  });
  if (!updateRes.ok) throw new Error(`PATCH /media failed: ${updateRes.status} ${await updateRes.text()}`);
  const updateJson: any = await updateRes.json();
  console.log(`   ✓ Updated title: '${updateJson.data.title}', altText: '${updateJson.data.altText}'`);

  // 7. Test In-Use Deletion Guard (409 Conflict)
  if (sampleAsset.usageCount > 0) {
    console.log("\n🛡️ 7. Testing In-Use Deletion Protection (Expecting HTTP 409 Conflict)...");
    const blockedRes = await fetch(`${BASE_URL}/${sampleAsset.id}`, { method: "DELETE" });
    console.log(`   ✓ Blocked status code: ${blockedRes.status} (Expected 409)`);
    const blockedJson: any = await blockedRes.json();
    console.log(`   ✓ Conflict message: "${blockedJson.message}"`);
    if (blockedRes.status !== 409) {
      throw new Error(`Expected HTTP 409 but got ${blockedRes.status}`);
    }
  }

  // 8. Test Soft-Delete & Restore
  console.log("\n🗑️ 8. Testing Soft-Delete & Restore on Unused Test Asset...");
  const softDelRes = await fetch(`${BASE_URL}/${createdAsset.id}`, { method: "DELETE" });
  if (!softDelRes.ok) throw new Error(`DELETE failed: ${softDelRes.status} ${await softDelRes.text()}`);
  const softDelJson: any = await softDelRes.json();
  console.log(`   ✓ Moved to trash: status=${softDelJson.data.status}`);

  const restoreRes = await fetch(`${BASE_URL}/${createdAsset.id}/restore`, { method: "POST" });
  if (!restoreRes.ok) throw new Error(`Restore failed: ${restoreRes.status} ${await restoreRes.text()}`);
  const restoreJson: any = await restoreRes.json();
  console.log(`   ✓ Restored from trash: status=${restoreJson.data.status}`);

  // 9. Test Permanent Delete
  console.log("\n🔥 9. Testing Permanent Delete on Test Asset...");
  const permRes = await fetch(`${BASE_URL}/${createdAsset.id}/permanent`, { method: "DELETE" });
  if (!permRes.ok) throw new Error(`Permanent delete failed: ${permRes.status} ${await permRes.text()}`);
  const permJson: any = await permRes.json();
  console.log(`   ✓ Permanently deleted: ${permJson.message}`);

  console.log("\n====================================================================");
  console.log("🎉 ALL MEDIA API ENDPOINT TESTS PASSED WITH 100% SUCCESS!");
  console.log("====================================================================\n");
}

main().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
