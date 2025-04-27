// 保存 token 到 localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// 从 localStorage 获取 token
export const getToken = () => {
  return localStorage.getItem('token');
};

// 移除 token
export const removeToken = () => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// 获取认证头
export const getAuthHeader = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
}; 