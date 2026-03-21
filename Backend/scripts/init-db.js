#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于在 HelioHost 或其他环境快速初始化数据库
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ 错误：DATABASE_URL 环境变量未设置');
    console.log('请在 Backend 目录下创建 .env 文件，并设置 DATABASE_URL');
    process.exit(1);
  }

  console.log('📌 正在连接数据库...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    // 测试连接
    await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功');

    // 读取 schema.sql 文件
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📌 正在执行数据库架构脚本...');
    
    // 执行 schema.sql
    await pool.query(schema);
    
    console.log('✅ 数据库架构创建成功');

    // 验证表是否创建成功
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'user_profiles',
        'oauth_applications',
        'oauth_authorization_codes',
        'oauth_access_tokens',
        'system_statuses'
      )
      ORDER BY table_name
    `);

    console.log(`✅ 已创建 ${tables.rows.length} 个核心表:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // 验证系统状态数据
    const statuses = await pool.query('SELECT service_name, status FROM system_statuses');
    console.log(`✅ 已插入 ${statuses.rows.length} 条系统状态记录`);

    console.log('\n🎉 数据库初始化完成！');
    console.log('\n提示：');
    console.log('1. 现在可以启动服务器：npm start');
    console.log('2. 访问健康检查：http://localhost:3001/health');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    if (error.detail) {
      console.error('详情:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行初始化
initializeDatabase();
