/**
 * API 配置
 * 可以在这里切换使用 Supabase 或 Backend
 */

// 设置为 true 使用 Backend，false 使用 Supabase
export const USE_BACKEND = true;

// Backend API 基础 URL
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Supabase 配置
export const SUPABASE_URL = 'https://pyywrxrmtehucmkpqkdi.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj';

/**
 * 获取认证端点
 */
export function getAuthEndpoint(action: string): string {
  if (USE_BACKEND) {
    return `${BACKEND_URL}/api/v1/auth/${action}`;
  }
  // Supabase 使用 REST API
  return `${SUPABASE_URL}/rest/v1/user_profiles`;
}

/**
 * 获取默认请求头
 */
export function getDefaultHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (USE_BACKEND) {
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    headers['apikey'] = SUPABASE_KEY;
    headers['Authorization'] = `Bearer ${SUPABASE_KEY}`;
  }

  return headers;
}

/**
 * 处理响应
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 发起请求
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers = {
    ...getDefaultHeaders(token),
    ...fetchOptions.headers,
  };

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  return handleResponse<T>(response);
}
