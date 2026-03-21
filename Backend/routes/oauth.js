const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 创建 OAuth 应用
router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const { name, description, redirect_uri, scopes } = req.body;
    const userId = req.user.id;

    if (!name || !redirect_uri) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const client_id = uuidv4();
    const client_secret = uuidv4() + uuidv4().replace(/-/g, '');

    const result = await db.query(
      `INSERT INTO oauth_applications (user_id, name, description, client_id, client_secret, redirect_uri, scopes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, client_id, redirect_uri, scopes, created_at`,
      [userId, name, description, client_id, client_secret, redirect_uri, scopes || 'read write']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建 OAuth 应用失败:', error);
    res.status(500).json({ error: '创建 OAuth 应用失败' });
  }
});

// 获取用户的所有应用
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT id, name, description, client_id, redirect_uri, scopes, created_at
       FROM oauth_applications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取应用列表失败:', error);
    res.status(500).json({ error: '获取应用列表失败' });
  }
});

// 获取应用详情
router.get('/applications/:client_id', authenticateToken, async (req, res) => {
  try {
    const { client_id } = req.params;

    const result = await db.query(
      `SELECT id, name, description, client_id, redirect_uri, scopes, created_at
       FROM oauth_applications
       WHERE client_id = $1`,
      [client_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '应用不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取应用详情失败:', error);
    res.status(500).json({ error: '获取应用详情失败' });
  }
});

// 删除应用
router.delete('/applications/:client_id', authenticateToken, async (req, res) => {
  try {
    const { client_id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `DELETE FROM oauth_applications
       WHERE client_id = $1 AND user_id = $2
       RETURNING id`,
      [client_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '应用不存在或无权删除' });
    }

    res.json({ message: '应用已删除' });
  } catch (error) {
    console.error('删除应用失败:', error);
    res.status(500).json({ error: '删除应用失败' });
  }
});

// 更新应用
router.put('/applications/:client_id', authenticateToken, async (req, res) => {
  try {
    const { client_id } = req.params;
    const { name, description, redirect_uri, scopes } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE oauth_applications
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           redirect_uri = COALESCE($3, redirect_uri),
           scopes = COALESCE($4, scopes),
           updated_at = NOW()
       WHERE client_id = $5 AND user_id = $6
       RETURNING id, name, description, client_id, redirect_uri, scopes`,
      [name, description, redirect_uri, scopes, client_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '应用不存在或无权更新' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新应用失败:', error);
    res.status(500).json({ error: '更新应用失败' });
  }
});

module.exports = router;
