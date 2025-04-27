import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../styles/profileSection.css';
import { useNavigate } from 'react-router-dom';

const ProfileSection = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || '',
    class: user?.class || '',
    studentId: user?.studentId || '',
    avatar: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const navigate = useNavigate();

  // 当用户信息更新时，更新表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        class: user.class || '',
        studentId: user.studentId || '',
        avatar: null
      });
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('头像文件大小不能超过2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      // 创建本地预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      // 添加所有非空字段到 FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'avatar') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // 只有当有新的头像文件时才添加到 FormData
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const token = localStorage.getItem('token');
      
      // 检查token是否存在
      if (!token) {
        setError('您尚未登录，请先登录');
        return;
      }

      console.log('发送更新请求，数据：', Object.fromEntries(formDataToSend.entries()));

      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('更新响应：', response.data);

      // 检查响应是否成功
      if (response.data.success || response.data.status === 'success') {
        // 获取返回的用户数据
        const returnedUser = response.data.data.user;
        
        // 合并当前用户数据和返回的数据
        const updatedUser = {
          ...user,
          ...returnedUser
        };

        console.log('更新后的用户信息：', updatedUser);
        
        // 更新状态
        onUpdateUser(updatedUser);
        setIsEditing(false);
        setSuccess('个人信息更新成功');
      } else {
        setError(response.data.message || '更新失败，请重试');
      }
    } catch (err) {
      console.error('更新错误:', err);
      
      // 显示详细错误信息
      console.error('请求错误详情:', err.response?.data);
      
      if (err.response?.status === 401) {
        // 只有在token失效时才跳转到登录页面
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || '更新失败，请重试');
      }
    }
  };

  // 如果没有用户信息，显示错误提示
  if (!user || !user.username) {
    return (
      <div className="profile-section">
        <div className="profile-header">
          <h2>个人信息</h2>
        </div>
        <div className="error-message">用户信息不完整，请<a href="/login">重新登录</a></div>
      </div>
    );
  }

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      college: user.college || '',
      class: user.class || '',
      studentId: user.studentId || '',
      avatar: null
    });
    setAvatarPreview(user.avatar);
    setError('');
    setSuccess('');
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <h2>个人信息</h2>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <FaEdit /> 编辑
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <FaTimes /> 取消
            </button>
            <button className="save-btn" onClick={handleSubmit}>
              <FaSave /> 保存
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-container">
            {avatarPreview ? (
              <img 
                src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:5000${avatarPreview}`} 
                alt="用户头像" 
              />
            ) : (
              <FaUser className="avatar-placeholder" />
            )}
          </div>
          {isEditing && (
            <div className="avatar-upload">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
              <label htmlFor="avatar" className="avatar-label">
                更换头像
              </label>
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>用户名</label>
            <span>{user.username}</span>
          </div>

          <div className="info-group">
            <label>学号</label>
            <span>{user.studentId}</span>
          </div>

          <div className="info-group">
            <label>邮箱</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            ) : (
              <span>{user.email}</span>
            )}
          </div>

          <div className="info-group">
            <label>手机号</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                pattern="^1[3-9]\d{9}$"
                required
              />
            ) : (
              <span>{user.phone}</span>
            )}
          </div>

          <div className="info-group">
            <label>学院</label>
            {isEditing ? (
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
              />
            ) : (
              <span>{user.college}</span>
            )}
          </div>

          <div className="info-group">
            <label>班级</label>
            {isEditing ? (
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
              />
            ) : (
              <span>{user.class}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;