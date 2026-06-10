const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../.next/standalone');

// 删除 standalone 中不应存在的目录
const dirsToRemove = ['cache', '.next/cache'];

for (const dir of dirsToRemove) {
  const fullPath = path.join(outputDir, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dir}`);
  }
}

// 验证无超大文件
function checkFileSize(dir, maxSizeMB = 24) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      checkFileSize(fullPath, maxSizeMB);
    } else {
      const sizeMB = fs.statSync(fullPath).size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        throw new Error(`❌ File too large (${sizeMB.toFixed(1)} MiB): ${fullPath}`);
      }
    }
  }
}

checkFileSize(outputDir);
console.log('✅ All files within Cloudflare Pages size limit');