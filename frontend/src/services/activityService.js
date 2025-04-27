import axios from 'axios';
import { API_BASE_URL } from '../config';
import moment from 'moment';


// 配置 axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 请求超时时间
  withCredentials: true
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效，可以在这里处理登出逻辑
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || '请求失败'
    });
  }
);

// 获取活动列表
export const getActivities = async (params = {}) => {
  try {
    const response = await apiClient.get('/activities', { params });
    return {
      success: true,
      data: response.data,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    };
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return {
      success: false,
      message: error.message || '获取活动列表失败',
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10
    };
  }
};

// 获取单个活动详情
export const getActivity = async (id) => {
  try {
    const response = await apiClient.get(`/activities/${id}`);
    return {
      success: true,
      data: response.data.activity
    };
  } catch (error) {
    return error;
  }
};

// 创建新活动
export const createActivity = async (activityData) => {
  try {
    const response = await apiClient.post('/activities', {
      title: activityData.title,
      description: activityData.description,
      type: activityData.type,
      points: activityData.points,
      startDate: moment(activityData.startDate).format(),
      endDate: moment(activityData.endDate).format(),
      location: activityData.location,
      maxParticipants: activityData.maxParticipants,
      organizer: activityData.organizer,
      status: activityData.status || 'ongoing'
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('创建活动失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || '创建活动失败，请检查所有必填字段'
    };
  }
};

// 更新活动
/**
 * 更新活动
 * @param {string} id - 活动的唯一标识符
 * @param {Object} activityData - 包含活动更新信息的对象
 * @returns {Promise<Object>} - 返回操作结果和更新后的活动数据
 */
export const updateActivity = async (id, activityData) => {
  try {
    // 基本的数据验证
    if (!id || typeof id !== 'string') {
      throw new Error('无效的活动 ID');
    }
    if (!activityData || typeof activityData !== 'object') {
      throw new Error('无效的活动数据');
    }

    const formattedData = {
      title: activityData.title || '',
      description: activityData.description || '',
      type: activityData.type || '',
      points: activityData.points != null ? activityData.points : undefined,
      startDate: activityData.startDate ? moment(activityData.startDate).format('YYYY-MM-DD') : undefined,
      endDate: activityData.endDate ? moment(activityData.endDate).format('YYYY-MM-DD') : undefined,
      location: activityData.location || '',
      maxParticipants: activityData.maxParticipants != null ? activityData.maxParticipants : undefined,
      organizer: activityData.organizer || '',
      status: activityData.status || '',
    };

    const response = await apiClient.patch(`/activities/${id}`, formattedData);
    return {
      success: true,
      data: response.data.activity,
    };
  } catch (error) {
    // 更详细的错误处理
    let errorMessage = '更新活动失败';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
};


// 删除活动
export const deleteActivity = async (id) => {
  try {
    await apiClient.delete(`/activities/${id}`);
    return {
      success: true,
      message: '删除活动成功'
    };
  } catch (error) {
    console.error('删除活动失败:', error);
    return {
      success: false,
      message: error.message || '删除活动失败'
    };
  }
};

// 开始活动
export const startActivity = async (id) => {
  try {
    const response = await apiClient.patch(`/activities/${id}/start`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('开始活动失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || '开始活动失败'
    };
  }
};

// 结束活动
export const completeActivity = async (id) => {
  try {
    const response = await apiClient.patch(`/activities/${id}/complete`);
    return {
      success: true,
      data: response.data.activity
    };
  } catch (error) {
    console.error('结束活动失败:', error);
    return {
      success: false,
      message: error.message || '结束活动失败'
    };
  }
};

//活动签到
export const signupActivity = async (activityId) => {
  try {
    const response = await apiClient.post(`/activities/${activityId}/signup`);
    return {
      success: true,
      data: response.data.activity
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '报名失败'
    };
  }
};

export const cancelSignupActivity = async (activityId) => {
  try {
    const response = await apiClient.delete(`/activities/${activityId}/signup`);
    return {
      success: true,
      message: '取消报名成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '取消报名失败'
    };
  }
};

export const checkInActivity = async (activityId, { checkInCode }) => {
  try {
    const response = await apiClient.post(`/activities/${activityId}/checkin`, { checkInCode });
    if (!response.data || !response.data.success) {
      throw new Error(response.data.message || '签到失败');
    }
    return response.data;
  } catch (error) {
    return { success: false, message: error.message || '签到请求失败' };
  }
};

export const setCheckInCode = async (activityId, { checkInCode }) => {
  try {
    const response = await apiClient.post(`/activities/${activityId}/checkin-code`, { checkInCode });
    return {
      success: true,
      message: '签到码设置成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '签到码设置失败'
    };
  }
};

// 获取活动参与者列表
export const getActivityParticipants = async (activityId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/activities/${activityId}/participants`, {
      params: { page, limit }
    });
    if (response.success) {
      // 确保返回的 participants 是数组，如果不是则使用空数组
      const participants = Array.isArray(response.data) ? response.data : [];
      return {
        success: true,
        data: participants
      };
    } else {
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    console.error('获取活动参与者列表失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || '获取活动参与者列表失败'
    };
  }
};

// 获取活动统计信息
export const getActivityStats = async () => {
  try {
    const response = await apiClient.get('/activities/stats/summary');
    return {
      success: true,
      data: response.data.stats
    };
  } catch (error) {
    console.error('获取活动统计信息失败:', error);
    return {
      success: false,
      message: error.message || '获取活动统计信息失败'
    };
  }
};

//设置签到码（管理员）
// export const setCheckInCode = async (activityId, { checkInCode }) => {
//   try {
//     const response = await apiClient.post(`/activities/${activityId}/checkin-code`, { checkInCode });
//     return {
//       success: true,
//       message: '签到码设置成功'
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.response?.data?.message || '签到码设置失败'
//     };
//   }
// };