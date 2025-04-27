import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/components.css';

const ProfileSection = ({ user, onUpdate, setError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    studentId: '',
    college: '',
    class: ''
  });

  // 当 user 有效时才更新表单
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
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/auth/update-profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onUpdate(response.data.data.user);
      setIsEditing(false);
      setError('个人信息更新成功');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || '更新失败');
    }
  };

  // 如果 user 还未加载，显示 loading 或空内容
  if (!user) {
    return <div className="profile-section">加载中...</div>;
  }

  return (
    <div className="profile-section">
      <h2>个人信息</h2>

      {!isEditing ? (
        <div className="profile-info">
          <div className="info-group">
            <label>用户名</label>
            <p>{user.username}</p>
          </div>
          <div className="info-group">
            <label>学号</label>
            <p>{user.studentId}</p>
          </div>
          <div className="info-group">
            <label>邮箱</label>
            <p>{user.email}</p>
          </div>
          <div className="info-group">
            <label>手机号</label>
            <p>{user.phone}</p>
          </div>
          <div className="info-group">
            <label>学院</label>
            <p>{user.college}</p>
          </div>
          <div className="info-group">
            <label>班级</label>
            <p>{user.class}</p>
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
            <button type="submit" className="save-btn">
              保存
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
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
