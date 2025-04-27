import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/components.css';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    studentId: '',
    college: '',
    class: ''
  });

  // 当组件挂载或user变化时更新表单
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        college: user.college || '',
        class: user.class || ''
      });
    } else {
      // 如果没有user数据，尝试从API获取
      fetchUserData();
    }
  }, [user]);

  // 获取用户数据
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(
        'http://localhost:5000/api/auth/me',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const userData = response.data.data.user;
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        studentId: userData.studentId || '',
        college: userData.college || '',
        class: userData.class || ''
      });
      
      // 更新全局用户状态
      updateUser(userData);
    } catch (err) {
      console.error('获取用户数据失败:', err);
      message.error('获取用户数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/auth/update-profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // 更新本地存储的用户信息
      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 更新全局用户状态
      updateUser(updatedUser);
      
      setIsEditing(false);
      message.success('个人信息更新成功');
    } catch (err) {
      console.error('更新失败:', err);
      message.error(err.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 如果正在加载，显示loading
  if (loading) {
    return <div className="profile-section">加载中...</div>;
  }

  return (
    <div className="profile-section">
      <h2>个人信息</h2>

      {!isEditing ? (
        <div className="profile-info">
          <div className="info-group">
            <label>用户名</label>
            <p>{formData.username}</p>
          </div>
          <div className="info-group">
            <label>学号</label>
            <p>{formData.studentId}</p>
          </div>
          <div className="info-group">
            <label>邮箱</label>
            <p>{formData.email}</p>
          </div>
          <div className="info-group">
            <label>手机号</label>
            <p>{formData.phone}</p>
          </div>
          <div className="info-group">
            <label>学院</label>
            <p>{formData.college}</p>
          </div>
          <div className="info-group">
            <label>班级</label>
            <p>{formData.class}</p>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            编辑信息
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="form-group">
            <label>学号</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>手机号</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="^1[3-9]\d{9}$"
              required
            />
          </div>
          <div className="form-group">
            <label>学院</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>班级</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSection;
