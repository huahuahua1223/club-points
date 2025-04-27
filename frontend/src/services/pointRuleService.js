//处理与后端的通信
import axios from 'axios';

// 修改API基础路径以匹配后端
const API_URL = '/api/points/rules';

// 添加认证token到请求头
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 配置axios默认设置
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.timeout = 10000;

// 获取积分规则列表（带分页和搜索）
export const getAllPointRules = async (page = 1, limit = 10, search = '') => {
  try {
    console.log('发送请求到:', `${API_URL}?page=${page}&limit=${limit}&search=${search}`); // 添加调试日志
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit,
        search
      },
      headers: getAuthHeader()
    });
    console.log('服务器响应:', response.data); // 添加调试日志
    return {
      rules: response.data.data.rules || [],
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: response.data.data.total || 0
      }
    };
  } catch (error) {
    console.error('获取积分规则列表错误:', error.response || error);
    throw new Error(error.response?.data?.message || '获取积分规则列表失败');
  }
};

// 获取单个积分规则
export const getPointRule = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('获取积分规则详情错误:', error.response || error);
    throw new Error(error.response?.data?.message || '获取积分规则详情失败');
  }
};

// 创建积分规则
export const createPointRule = async (ruleData) => {
  try {
    console.log('创建积分规则数据:', ruleData); // 添加调试日志
    const response = await axios.post(API_URL, ruleData, {
      headers: getAuthHeader()
    });
    console.log('创建响应:', response.data); // 添加调试日志
    return response.data.data;
  } catch (error) {
    console.error('创建积分规则错误:', error.response || error);
    throw new Error(error.response?.data?.message || '创建积分规则失败');
  }
};

// 更新积分规则
export const updatePointRule = async (id, ruleData) => {
  try {
    console.log('更新积分规则数据:', { id, ruleData }); // 添加调试日志
    const response = await axios.patch(`${API_URL}/${id}`, ruleData, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('更新积分规则错误:', error.response || error);
    throw new Error(error.response?.data?.message || '更新积分规则失败');
  }
};

// 删除积分规则
export const deletePointRule = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('删除积分规则错误:', error.response || error);
    throw new Error(error.response?.data?.message || '删除积分规则失败');
  }
};

// 获取所有活跃的积分规则（用于下拉框）
export const getActivePointRulesForSelect = async () => {
  try {
    const response = await axios.get(`${API_URL}?status=active&limit=100`, {
      headers: getAuthHeader()
    });
    
    // 转换为下拉框需要的格式 { value: id, label: ruleName }
    const rules = response.data.data.rules || [];
    return rules.map(rule => ({
      value: rule._id,
      label: `${rule.ruleName} (${rule.basePoints}积分)`,
      data: rule // 保存完整规则数据，以便需要时使用
    }));
  } catch (error) {
    console.error('获取积分规则下拉数据错误:', error.response || error);
    return []; // 出错时返回空数组，避免页面崩溃
  }
};