import fs from "fs";
import path from "path";

const manifestPath = path.resolve(process.cwd(), "../cloudinary/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

console.log("Manifest top-level keys:", Object.keys(manifest));

if (manifest.summary) {
  console.log("Summary:", manifest.summary);
}

if (manifest.groups) {
  console.log("Groups count:", manifest.groups.length);
  console.log("Sample Group:", JSON.stringify(manifest.groups[0], null, 2));
}

if (manifest.assets) {
  console.log("Assets count:", manifest.assets.length);
  console.log("Sample Asset:", JSON.stringify(manifest.assets[0], null, 2));
}
