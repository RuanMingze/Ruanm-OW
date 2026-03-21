const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 获取系统状态
router.get('/statuses', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT service_name, status, message, updated_at
       FROM system_statuses
       ORDER BY id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({ error: '获取系统状态失败' });
  }
});

// 更新系统状态（管理员）
router.put('/statuses/:service', authenticateToken, async (req, res) => {
  try {
    const { service } = req.params;
    const { status, message } = req.body;

    const result = await db.query(
      `INSERT INTO system_statuses (service_name, status, message, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (service_name)
       DO UPDATE SET status = $2, message = $3, updated_at = NOW()
       RETURNING *`,
      [service, status, message]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新系统状态失败:', error);
    res.status(500).json({ error: '更新系统状态失败' });
  }
});

// 获取 Beta 申请列表
router.get('/beta-applications', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, product, reason, status, reviewed_by, reviewed_at, created_at
       FROM beta_applications
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取 Beta 申请列表失败:', error);
    res.status(500).json({ error: '获取 Beta 申请列表失败' });
  }
});

// 提交 Beta 申请
router.post('/beta-applications', authenticateToken, async (req, res) => {
  try {
    const { product, reason } = req.body;
    const userId = req.user.id;

    if (!product || !reason) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const result = await db.query(
      `INSERT INTO beta_applications (user_id, product, reason, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, product, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('提交 Beta 申请失败:', error);
    res.status(500).json({ error: '提交 Beta 申请失败' });
  }
});

// 审核 Beta 申请
router.put('/beta-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const result = await db.query(
      `UPDATE beta_applications
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '申请不存在' });
    }

    if (status === 'approved') {
      const appResult = await db.query(
        `SELECT user_id FROM beta_applications WHERE id = $1`,
        [id]
      );

      await db.query(
        `UPDATE user_profiles
         SET has_beta_access = TRUE
         WHERE id = $1`,
        [appResult.rows[0].user_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('审核 Beta 申请失败:', error);
    res.status(500).json({ error: '审核 Beta 申请失败' });
  }
});

// 获取 API 使用日志
router.get('/api-logs', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await db.query(
      `SELECT id, user_id, client_id, endpoint, method, status_code, response_time_ms, created_at
       FROM api_usage_logs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取 API 日志失败:', error);
    res.status(500).json({ error: '获取 API 日志失败' });
  }
});

// 记录 API 使用
router.post('/api-logs', async (req, res) => {
  try {
    const { user_id, client_id, endpoint, method, status_code, response_time_ms, request_body, response_body, ip_address, user_agent } = req.body;

    await db.query(
      `INSERT INTO api_usage_logs (user_id, client_id, endpoint, method, status_code, response_time_ms, request_body, response_body, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [user_id, client_id, endpoint, method, status_code, response_time_ms, JSON.stringify(request_body), JSON.stringify(response_body), ip_address, user_agent]
    );

    res.json({ message: '日志已记录' });
  } catch (error) {
    console.error('记录 API 日志失败:', error);
    res.status(500).json({ error: '记录 API 日志失败' });
  }
});

module.exports = router;
