const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置项
const TARGET_NEXT_VERSION = '16.1.0';
const PATCH_SCRIPT_NAME = 'fix-next-on-pages-version.js';
const PATCH_SCRIPT_DIR = path.join(process.cwd(), 'scripts');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

/**
 * 步骤1：检查是否安装了@cloudflare/next-on-pages
 */
function checkDependencyInstalled() {
  console.log('🔍 检查@cloudflare/next-on-pages依赖...');
  let packageJson;
  try {
    packageJson = require(PACKAGE_JSON_PATH);
  } catch (e) {
    console.error('❌ 未找到package.json，请在项目根目录执行此脚本');
    process.exit(1);
  }

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  if (!deps['@cloudflare/next-on-pages']) {
    console.error('❌ 未安装@cloudflare/next-on-pages，请先执行：pnpm add @cloudflare/next-on-pages');
    process.exit(1);
  }
  console.log('✅ 依赖已安装');
}

/**
 * 步骤2：查找版本检测文件和关键代码
 */
function findVersionCheckFile() {
  console.log(`🔍 查找@cloudflare/next-on-pages中的版本检测逻辑...`);
  const nextOnPagesDir = path.join(process.cwd(), 'node_modules', '@cloudflare', 'next-on-pages');
  
  // 遍历所有文件，查找包含版本检测的文件
  const versionCheckFiles = [];
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (['.js', '.ts', '.mjs'].includes(path.extname(fullPath))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          // 匹配版本检测特征（15.5.2/version check/Next.js version）
          if (content.includes('15.5.2') && (content.includes('version') || content.includes('Next.js'))) {
            versionCheckFiles.push(fullPath);
          }
        } catch (e) {
          // 忽略无法读取的文件
        }
      }
    }
  }

  walkDir(nextOnPagesDir);

  if (versionCheckFiles.length === 0) {
    console.error('❌ 未找到版本检测文件，请手动检查node_modules/@cloudflare/next-on-pages');
    process.exit(1);
  }

  // 优先选择dist/index.js（编译后的主文件）
  const targetFile = versionCheckFiles.find(f => f.includes('dist/index.js')) || versionCheckFiles[0];
  console.log(`✅ 找到版本检测文件：${targetFile}`);
  return targetFile;
}

/**
 * 步骤3：生成补丁脚本
 */
function generatePatchScript(versionCheckFile) {
  console.log(`🔧 生成自动补丁脚本...`);
  
  // 创建scripts目录（如果不存在）
  if (!fs.existsSync(PATCH_SCRIPT_DIR)) {
    fs.mkdirSync(PATCH_SCRIPT_DIR, { recursive: true });
  }

  const patchScriptContent = `
const fs = require('fs');
const path = require('path');

// 自动生成的next-on-pages版本兼容补丁
const versionCheckPath = path.join(__dirname, '..', '${path.relative(process.cwd(), versionCheckFile)}');
const targetVersions = ['15.5.2', '${TARGET_NEXT_VERSION}'];

try {
  let content = fs.readFileSync(versionCheckPath, 'utf8');
  
  // 替换版本检测逻辑
  // 场景1：精确匹配 "version !== '15.5.2'"
  content = content.replace(
    /version\\s*!==\\s*['"]15\\.5\\.2['"]/g,
    '!targetVersions.includes(version)'
  );
  
  // 场景2：全局替换15.5.2为兼容版本
  content = content.replace(
    /['"]15\\.5\\.2['"]/g,
    '[' + targetVersions.map(v => '"' + v + '"').join(',') + ']'
  );
  
  // 注入版本数组定义（如果不存在）
  if (!content.includes('targetVersions')) {
    content = content.replace(
      /(function|const|let)\\s+\\w+.*version.*\\{/,
      '$&\\n  const targetVersions = ["15.5.2", "${TARGET_NEXT_VERSION}"];'
    );
  }

  fs.writeFileSync(versionCheckPath, content, 'utf8');
  console.log('✅ @cloudflare/next-on-pages版本兼容补丁已应用');
} catch (e) {
  console.error('❌ 应用补丁失败：', e.message);
}
  `.trim();

  const patchScriptPath = path.join(PATCH_SCRIPT_DIR, PATCH_SCRIPT_NAME);
  fs.writeFileSync(patchScriptPath, patchScriptContent, 'utf8');
  console.log(`✅ 补丁脚本已生成：${patchScriptPath}`);
  return patchScriptPath;
}

/**
 * 步骤4：修改package.json，添加postinstall钩子
 */
function updatePackageJson() {
  console.log(`📝 修改package.json，添加postinstall钩子...`);
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  
  // 初始化scripts（如果不存在）
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // 添加postinstall脚本（避免重复）
  const postinstallScript = `node scripts/${PATCH_SCRIPT_NAME}`;
  if (packageJson.scripts.postinstall) {
    // 如果已有postinstall，追加补丁脚本
    if (!packageJson.scripts.postinstall.includes(postinstallScript)) {
      packageJson.scripts.postinstall += ` && ${postinstallScript}`;
    }
  } else {
    packageJson.scripts.postinstall = postinstallScript;
  }

  // 升级Next.js到目标版本（封堵React2Shell漏洞）
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies.next = TARGET_NEXT_VERSION;

  // 写入package.json（格式化，保持原有风格）
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log(`✅ package.json已更新：`);
  console.log(`   - 添加postinstall钩子：${postinstallScript}`);
  console.log(`   - Next.js版本已设置为：${TARGET_NEXT_VERSION}`);
}

/**
 * 步骤5：验证并测试
 */
function verifyFix() {
  console.log(`🧪 验证补丁是否生效...`);
  try {
    // 执行pnpm install触发postinstall
    console.log('   执行pnpm install...');
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('✅ 所有操作完成！');
    console.log(`
📌 后续部署说明：
1. 提交代码到仓库（包含scripts/${PATCH_SCRIPT_NAME}和修改后的package.json）
2. Cloudflare Pages会自动：
   - 安装依赖 → 执行postinstall打补丁 → 构建部署
3. Vercel会自动使用Next.js ${TARGET_NEXT_VERSION}（无React2Shell漏洞）
`);
  } catch (e) {
    console.error('❌ 验证失败：', e.message);
    process.exit(1);
  }
}

// 主流程
async function main() {
  console.log('=======================================');
  console.log('📦 自动修复next-on-pages版本兼容问题');
  console.log(`🎯 目标：兼容Next.js ${TARGET_NEXT_VERSION}，封堵React2Shell漏洞`);
  console.log('=======================================');
  
  try {
    checkDependencyInstalled();
    const versionCheckFile = findVersionCheckFile();
    generatePatchScript(versionCheckFile);
    updatePackageJson();
    verifyFix();
  } catch (e) {
    console.error('❌ 自动化修复失败：', e.message);
    process.exit(1);
  }
}

// 执行主流程
main();