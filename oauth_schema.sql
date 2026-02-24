-- 删除所有OAuth相关的策略和表
DROP POLICY IF EXISTS "Allow authenticated users to read oauth_applications" ON oauth_applications;
DROP POLICY IF EXISTS "Allow users to create oauth_applications" ON oauth_applications;
DROP POLICY IF EXISTS "Allow users to update oauth_applications" ON oauth_applications;
DROP POLICY IF EXISTS "Allow users to delete oauth_applications" ON oauth_applications;
DROP POLICY IF EXISTS "Allow all authenticated users to access oauth_applications" ON oauth_applications;
DROP POLICY IF EXISTS "Enable all access for oauth_applications" ON oauth_applications;

DROP POLICY IF EXISTS "Allow authenticated users to read authorization codes" ON oauth_authorization_codes;
DROP POLICY IF EXISTS "Allow users to create authorization codes" ON oauth_authorization_codes;
DROP POLICY IF EXISTS "Allow all authenticated users to access authorization codes" ON oauth_authorization_codes;
DROP POLICY IF EXISTS "Enable all access for oauth_authorization_codes" ON oauth_authorization_codes;

DROP POLICY IF EXISTS "Allow authenticated users to read tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Allow users to create tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Allow users to delete tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Allow all authenticated users to access tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Enable all access for oauth_tokens" ON oauth_tokens;

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS oauth_tokens CASCADE;
DROP TABLE IF EXISTS oauth_authorization_codes CASCADE;
DROP TABLE IF EXISTS oauth_applications CASCADE;

-- 创建OAuth应用表
CREATE TABLE oauth_applications (
  id BIGSERIAL PRIMARY KEY,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  redirect_uri TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT 'read write',
  user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建OAuth授权码表
CREATE TABLE oauth_authorization_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL REFERENCES oauth_applications(client_id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scopes TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建OAuth访问令牌表
CREATE TABLE oauth_tokens (
  id BIGSERIAL PRIMARY KEY,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL REFERENCES oauth_applications(client_id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
  scopes TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_oauth_authorization_codes_code ON oauth_authorization_codes(code);
CREATE INDEX idx_oauth_authorization_codes_user_id ON oauth_authorization_codes(user_id);
CREATE INDEX idx_oauth_authorization_codes_expires_at ON oauth_authorization_codes(expires_at);
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX idx_oauth_tokens_refresh_token ON oauth_tokens(refresh_token);
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- 不启用RLS，允许所有认证用户访问
-- 如果需要启用RLS，可以使用以下策略：
-- ALTER TABLE oauth_applications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all authenticated users to access oauth_applications" 
-- ON oauth_applications 
-- FOR ALL 
-- USING (auth.role() = 'authenticated')
-- WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow all authenticated users to access authorization codes" 
-- ON oauth_authorization_codes 
-- FOR ALL 
-- USING (auth.role() = 'authenticated')
-- WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow all authenticated users to access tokens" 
-- ON oauth_tokens 
-- FOR ALL 
-- USING (auth.role() = 'authenticated')
-- WITH CHECK (auth.role() = 'authenticated');
