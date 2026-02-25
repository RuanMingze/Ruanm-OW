const fs = require('fs');
const path = require('path');

// 自动生成的next-on-pages版本兼容补丁
const packageJsonPath = path.join(__dirname, '..', 'node_modules', '@cloudflare', 'next-on-pages', 'package.json');

try {
  let content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);
  
  // 修改peerDependencies中的next版本限制
  if (packageJson.peerDependencies && packageJson.peerDependencies.next) {
    packageJson.peerDependencies.next = '>=14.3.0';
    console.log('✅ 已修改peerDependencies中的next版本限制为 >=14.3.0');
  }
  
  // 写回文件
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t'), 'utf8');
  console.log('✅ @cloudflare/next-on-pages版本兼容补丁已应用');
} catch (e) {
  console.error('❌ 应用补丁失败：', e.message);
}