-- Ruanm 数据库架构恢复脚本
-- 说明：此脚本将创建所有必需的数据库表

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户资料表 (user_profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    hashed_password TEXT NOT NULL,
    has_beta_access BOOLEAN DEFAULT FALSE,
    beta_applications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(name);

-- ============================================
-- 2. OAuth 应用表 (oauth_applications)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id VARCHAR(255) NOT NULL UNIQUE,
    client_secret VARCHAR(255) NOT NULL,
    redirect_uri TEXT NOT NULL,
    scopes VARCHAR(255) DEFAULT 'read write',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oauth_applications_user_id ON oauth_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_applications_client_id ON oauth_applications(client_id);

-- ============================================
-- 3. OAuth 授权码表 (oauth_authorization_codes)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255) REFERENCES oauth_applications(client_id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    redirect_uri TEXT NOT NULL,
    scopes VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_code ON oauth_authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_client_id ON oauth_authorization_codes(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_user_id ON oauth_authorization_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_expires_at ON oauth_authorization_codes(expires_at);

-- ============================================
-- 4. OAuth 访问令牌表 (oauth_access_tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255) REFERENCES oauth_applications(client_id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    scopes VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_token ON oauth_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_client_id ON oauth_access_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user_id ON oauth_access_tokens(user_id);

-- ============================================
-- 5. OAuth 刷新令牌表 (oauth_refresh_tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    access_token VARCHAR(255) REFERENCES oauth_access_tokens(token) ON DELETE CASCADE,
    client_id VARCHAR(255) REFERENCES oauth_applications(client_id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    scopes VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_token ON oauth_refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_access_token ON oauth_refresh_tokens(access_token);

-- ============================================
-- 6. API 使用日志表 (api_usage_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE SET NULL,
    client_id VARCHAR(255) REFERENCES oauth_applications(client_id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    request_body JSONB,
    response_body JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_client_id ON api_usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- ============================================
-- 7. 产品表 (products)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    icon_url TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    features JSONB,
    metadata JSONB,
    created_by BIGINT REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ============================================
-- 8. 系统状态表 (system_statuses)
-- ============================================
CREATE TABLE IF NOT EXISTS system_statuses (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'operational',
    message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_statuses_service_name ON system_statuses(service_name);
CREATE INDEX IF NOT EXISTS idx_system_statuses_status ON system_statuses(status);

-- ============================================
-- 9. Beta 申请表 (beta_applications)
-- ============================================
CREATE TABLE IF NOT EXISTS beta_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    product VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by BIGINT REFERENCES user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_beta_applications_user_id ON beta_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_applications_status ON beta_applications(status);

-- ============================================
-- 10. 文档表 (documents)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    author_id BIGINT REFERENCES user_profiles(id),
    published BOOLEAN DEFAULT FALSE,
    version VARCHAR(50) DEFAULT '1.0.0',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(published);

-- ============================================
-- 11. 通知表 (notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- 12. 会话表 (sessions) - 用于 Supabase Auth
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    factor_id UUID,
    aal VARCHAR(255),
    not_after TIMESTAMP WITH TIME ZONE,
    refreshed_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip INET
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- 13. 审计日志表 (audit_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    record_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 14. 用户设置表 (user_settings)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme VARCHAR(50) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'zh-CN',
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================
-- 15. OAuth 客户端授权表 (oauth_client_grants)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_client_grants (
    id BIGSERIAL PRIMARY KEY,
    client_id VARCHAR(255) REFERENCES oauth_applications(client_id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    scopes VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(client_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_oauth_client_grants_client_id ON oauth_client_grants(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_client_grants_user_id ON oauth_client_grants(user_id);

-- ============================================
-- 插入初始系统状态数据
-- ============================================
INSERT INTO system_statuses (service_name, status, message, created_at, updated_at) VALUES
    ('API', 'operational', '所有系统正常运行', NOW(), NOW()),
    ('Database', 'operational', '所有系统正常运行', NOW(), NOW()),
    ('Authentication', 'operational', '所有系统正常运行', NOW(), NOW()),
    ('Storage', 'operational', '所有系统正常运行', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 创建更新触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 为所有需要自动更新 updated_at 的表创建触发器
-- ============================================
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_applications_updated_at
    BEFORE UPDATE ON oauth_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beta_applications_updated_at
    BEFORE UPDATE ON beta_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 恢复完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '数据库架构恢复完成！';
    RAISE NOTICE '已创建以下表:';
    RAISE NOTICE '  - user_profiles (用户资料表)';
    RAISE NOTICE '  - oauth_applications (OAuth 应用表)';
    RAISE NOTICE '  - oauth_authorization_codes (OAuth 授权码表)';
    RAISE NOTICE '  - oauth_access_tokens (OAuth 访问令牌表)';
    RAISE NOTICE '  - oauth_refresh_tokens (OAuth 刷新令牌表)';
    RAISE NOTICE '  - api_usage_logs (API 使用日志表)';
    RAISE NOTICE '  - products (产品表)';
    RAISE NOTICE '  - system_statuses (系统状态表)';
    RAISE NOTICE '  - beta_applications (Beta 申请表)';
    RAISE NOTICE '  - documents (文档表)';
    RAISE NOTICE '  - notifications (通知表)';
    RAISE NOTICE '  - sessions (会话表)';
    RAISE NOTICE '  - audit_logs (审计日志表)';
    RAISE NOTICE '  - user_settings (用户设置表)';
    RAISE NOTICE '  - oauth_client_grants (OAuth 客户端授权表)';
    RAISE NOTICE '';
    RAISE NOTICE '已插入初始系统状态数据';
    RAISE NOTICE '已创建自动更新 updated_at 触发器';
END $$;
