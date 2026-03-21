const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO user_profiles (name, email, hashed_password, has_beta_access)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, name, email, avatar_url, has_beta_access, created_at`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        has_beta_access: user.has_beta_access
      },
      access_token: token
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填' });
    }

    const result = await db.query(
      `SELECT id, name, email, hashed_password, avatar_url, has_beta_access
       FROM user_profiles
       WHERE email = $1 OR name = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.hashed_password);

    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        has_beta_access: user.has_beta_access
      },
      access_token: token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取用户资料
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, name, email, avatar_url, has_beta_access, created_at
       FROM user_profiles
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ error: '获取用户资料失败' });
  }
});

// 更新用户资料
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar_url } = req.body;

    const result = await db.query(
      `UPDATE user_profiles
       SET name = COALESCE($1, name),
           avatar_url = COALESCE($2, avatar_url),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, avatar_url, has_beta_access`,
      [name, avatar_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ error: '更新用户资料失败' });
  }
});

// 修改密码
router.put('/change-password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码为必填' });
    }

    const result = await db.query(
      `SELECT id, hashed_password FROM user_profiles WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.hashed_password);

    if (!validPassword) {
      return res.status(401).json({ error: '当前密码错误' });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
      `UPDATE user_profiles
       SET hashed_password = $1, updated_at = NOW()
       WHERE id = $2`,
      [hashedNewPassword, id]
    );

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 获取所有用户（管理员）
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, avatar_url, has_beta_access, created_at
       FROM user_profiles
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 授予 Beta 权限
router.put('/users/:id/beta-access', async (req, res) => {
  try {
    const { id } = req.params;
    const { has_beta_access } = req.body;

    const result = await db.query(
      `UPDATE user_profiles
       SET has_beta_access = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, has_beta_access`,
      [has_beta_access, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新 Beta 权限失败:', error);
    res.status(500).json({ error: '更新 Beta 权限失败' });
  }
});

module.exports = router;
