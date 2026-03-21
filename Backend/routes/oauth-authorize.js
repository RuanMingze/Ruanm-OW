const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, generateToken } = require('../middleware/auth');

// OAuth 授权页面 - 获取应用信息
router.get('/authorize/info', async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ error: '缺少 client_id 参数' });
    }

    const result = await db.query(
      `SELECT oa.id, oa.name, oa.description, oa.redirect_uri, oa.scopes,
              up.name as owner_name
       FROM oauth_applications oa
       JOIN user_profiles up ON oa.user_id = up.id
       WHERE oa.client_id = $1`,
      [client_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '应用不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取应用信息失败:', error);
    res.status(500).json({ error: '获取应用信息失败' });
  }
});

// 处理授权
router.post('/authorize', authenticateToken, async (req, res) => {
  try {
    const { client_id, redirect_uri, scopes } = req.body;
    const userId = req.user.id;

    if (!client_id || !redirect_uri) {
      return res.status(400).json({ error: '缺少必填参数' });
    }

    const appResult = await db.query(
      `SELECT client_id, redirect_uri FROM oauth_applications WHERE client_id = $1`,
      [client_id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: '应用不存在' });
    }

    const app = appResult.rows[0];
    if (app.redirect_uri !== redirect_uri) {
      return res.status(400).json({ error: '重定向 URI 不匹配' });
    }

    const code = uuidv4().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO oauth_authorization_codes (code, client_id, user_id, redirect_uri, scopes, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [code, client_id, userId, redirect_uri, scopes || 'read write', expiresAt]
    );

    const userResult = await db.query(
      `SELECT id, name, email, avatar_url FROM user_profiles WHERE id = $1`,
      [userId]
    );

    const userProfile = userResult.rows[0];
    const redirectUrl = `${redirect_uri}?code=${code}&user_profile=${encodeURIComponent(JSON.stringify(userProfile))}`;

    res.json({ redirect_url: redirectUrl, code });
  } catch (error) {
    console.error('授权失败:', error);
    res.status(500).json({ error: '授权失败' });
  }
});

// 令牌交换
router.post('/token', async (req, res) => {
  try {
    const { grant_type, code, refresh_token, client_id, client_secret, redirect_uri } = req.body;

    if (!grant_type) {
      return res.status(400).json({ error: '缺少 grant_type 参数' });
    }

    if (grant_type === 'authorization_code') {
      if (!code || !client_id || !client_secret || !redirect_uri) {
        return res.status(400).json({ error: '缺少必需参数' });
      }

      const appResult = await db.query(
        `SELECT * FROM oauth_applications WHERE client_id = $1 AND client_secret = $2`,
        [client_id, client_secret]
      );

      if (appResult.rows.length === 0) {
        return res.status(401).json({ error: '无效的客户端凭证' });
      }

      const codeResult = await db.query(
        `SELECT * FROM oauth_authorization_codes
         WHERE code = $1 AND client_id = $2 AND expires_at > NOW()`,
        [code, client_id]
      );

      if (codeResult.rows.length === 0) {
        return res.status(400).json({ error: '无效的授权码或已过期' });
      }

      const authCode = codeResult.rows[0];

      if (authCode.redirect_uri !== redirect_uri) {
        return res.status(400).json({ error: '重定向 URI 不匹配' });
      }

      const userResult = await db.query(
        `SELECT id, name, email FROM user_profiles WHERE id = $1`,
        [authCode.user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const user = userResult.rows[0];
      const accessToken = generateToken({ id: user.id, email: user.email, scope: authCode.scopes });

      await db.query(
        `INSERT INTO oauth_access_tokens (token, client_id, user_id, scopes, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [accessToken, client_id, user.id, authCode.scopes, new Date(Date.now() + 3600 * 1000)]
      );

      await db.query(
        `DELETE FROM oauth_authorization_codes WHERE code = $1`,
        [code]
      );

      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: authCode.scopes
      });

    } else if (grant_type === 'refresh_token') {
      if (!refresh_token || !client_id || !client_secret) {
        return res.status(400).json({ error: '缺少必需参数' });
      }

      const appResult = await db.query(
        `SELECT * FROM oauth_applications WHERE client_id = $1 AND client_secret = $2`,
        [client_id, client_secret]
      );

      if (appResult.rows.length === 0) {
        return res.status(401).json({ error: '无效的客户端凭证' });
      }

      const tokenResult = await db.query(
        `SELECT * FROM oauth_refresh_tokens
         WHERE token = $1 AND client_id = $2 AND revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW())`,
        [refresh_token, client_id]
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ error: '无效的刷新令牌' });
      }

      const refreshToken = tokenResult.rows[0];
      const userResult = await db.query(
        `SELECT id, email FROM user_profiles WHERE id = $1`,
        [refreshToken.user_id]
      );

      const user = userResult.rows[0];
      const newAccessToken = generateToken({ id: user.id, email: user.email, scope: refreshToken.scopes });

      await db.query(
        `UPDATE oauth_refresh_tokens SET revoked = TRUE WHERE token = $1`,
        [refresh_token]
      );

      res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: refreshToken.scopes
      });

    } else {
      return res.status(400).json({ error: '不支持的 grant_type' });
    }
  } catch (error) {
    console.error('令牌交换失败:', error);
    res.status(500).json({ error: '令牌交换失败' });
  }
});

// 撤销令牌
router.post('/revoke', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: '缺少 token 参数' });
    }

    await db.query(
      `UPDATE oauth_access_tokens SET revoked = TRUE WHERE token = $1 AND user_id = $2`,
      [token, userId]
    );

    await db.query(
      `UPDATE oauth_refresh_tokens SET revoked = TRUE WHERE token = $1 AND user_id = $2`,
      [token, userId]
    );

    res.json({ message: '令牌已撤销' });
  } catch (error) {
    console.error('撤销令牌失败:', error);
    res.status(500).json({ error: '撤销令牌失败' });
  }
});

module.exports = router;
