const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const oauthAuthorizeRoutes = require('./routes/oauth-authorize');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 允许所有域名
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/oauth-authorize', oauthAuthorizeRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '未找到路由' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
