import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaLock, 
  FaUserGraduate, 
  FaPhone, 
  FaEnvelope, 
  FaSchool,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaUserShield 
} from 'react-icons/fa';
import '../styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '', 
    studentId: '',
    class: '',
    phone: '',
    college: '',
    email: '',
    avatar: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // 验证函数
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateStudentId = (studentId) => {
    const studentIdRegex = /^202\d{6}$/;
    return studentIdRegex.test(studentId);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // 实时验证
    switch (name) {
      case 'password':
        if (!validatePassword(value)) {
          setError('密码必须至少6个字符，包含大小写字母、数字和特殊符号');
        }
        break;
      case 'studentId':
        if (role === 'student' && !validateStudentId(value)) {
          setError('学号格式必须为9位数');
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          setError('请输入有效的邮箱地址');
        }
        break;
      case 'phone':
        if (!validatePhone(value)) {
          setError('请输入有效的手机号码');
        }
        break;
      default:
        break;
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('头像文件大小不能超过2MB');
        return;
      }
      setFormData({
        ...formData,
        avatar: file
      });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    // 切换角色时重置表单数据
    setFormData({
      username: formData.username,
      password: formData.password,
      phone: formData.phone,
      email: formData.email,
      avatar: formData.avatar,
      studentId: '',
      class: '',
      college: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      // 检查密码是否一致
  if (formData.password !== formData.confirmPassword) {
    setError('两次输入的密码不一致');
    return;
  }
  
    // 基本字段验证
    if (!validatePassword(formData.password)) {
      setError('密码格式不正确');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('邮箱格式不正确');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('手机号格式不正确');
      return;
    }

    setLoading(true);
    setError('');

    const submitData = new FormData();
    
    // 根据角色提交不同的字段
    if (role === 'admin') {
      submitData.append('username', formData.username);
      submitData.append('password', formData.password);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('role', 'admin');
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }
    } else {
      // 学生角色需要验证额外字段
      if (!validateStudentId(formData.studentId)) {
        setError('学号格式不正确');
        setLoading(false);
        return;
      }
      if (!formData.class || !formData.college) {
        setError('请填写所有必填字段');
        setLoading(false);
        return;
      }
      
      // 添加所有学生字段
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      submitData.append('role', 'student');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        alert('注册成功！');
        navigate('/login', { state: { role: role } });
      }
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-shape"></div>
        <div className="register-shape"></div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <h1>校园社团积分系统</h1>
          <p>用户注册</p>
          
          <div className="role-selector">
            <button 
              type="button"
              className={`role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              <FaUserGraduate className="role-icon" />
              学生注册
            </button>
            <button 
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <FaUserShield className="role-icon" />
              管理员注册
            </button>
          </div>
        </div>

        {error && (
          <div className="register-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="avatar-upload">
            <div className="avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="头像预览" />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
            />
            <label htmlFor="avatar" className="avatar-label">
              选择头像
            </label>
          </div>

          {/* 基本字段 - 所有角色都需要 */}
          <div className="form-group">
            <div className="label-with-icon">
              <FaUser className="form-icon" />
              <label>用户名</label>
            </div>
            <input
              type="text"
              name="username"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-icon">
              <FaLock className="form-icon" />
              <label>密码</label>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="至少6个字符，包含大小写字母、数字和特殊符号"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash className="password-icon" /> : <FaEye className="password-icon" />}
              </button>
            </div>
            <div className="password-requirements">
              <small>密码要求：</small>
              <ul>
                <li className={formData.password.length >= 6 ? 'valid' : ''}>
                  <FaCheck /> 至少6个字符
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                  <FaCheck /> 包含大写字母
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                  <FaCheck /> 包含小写字母
                </li>
                <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                  <FaCheck /> 包含数字
                </li>
                <li className={/[!@#$%^&*()_+]/.test(formData.password) ? 'valid' : ''}>
                  <FaCheck /> 包含特殊符号
                </li>
              </ul>
            </div>
          </div>
          <div className="form-group">
  <div className="label-with-icon">
    <FaLock className="form-icon" />
    <label>确认密码</label>
  </div>
  <div className="password-input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      name="confirmPassword"
      placeholder="请再次输入密码"
      value={formData.confirmPassword}
      onChange={handleChange}
      required
    />
  </div>
  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
    <div className="password-mismatch">
      <small className="error-text">两次输入的密码不一致</small>
    </div>
  )}
</div>
          <div className="form-group">
            <div className="label-with-icon">
              <FaPhone className="form-icon" />
              <label>手机号</label>
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="请输入11位手机号"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-icon">
              <FaEnvelope className="form-icon" />
              <label>邮箱</label>
            </div>
            <input
              type="email"
              name="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* 学生特有字段 */}
          {role === 'student' && (
            <>
              <div className="form-group">
                <div className="label-with-icon">
                  <FaUserGraduate className="form-icon" />
                  <label>学号</label>
                </div>
                <input
                  type="text"
                  name="studentId"
                  placeholder="请输入9位学号（例：202xxxxxx）"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-icon">
                  <FaSchool className="form-icon" />
                  <label>班级</label>
                </div>
                <input
                  type="text"
                  name="class"
                  placeholder="请输入班级"
                  value={formData.class}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-icon">
                  <FaSchool className="form-icon" />
                  <label>学院</label>
                </div>
                <input
                  type="text"
                  name="college"
                  placeholder="请输入学院"
                  value={formData.college}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className={`register-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="button-loading">
                <span className="loading-spinner"></span>
                注册中...
              </div>
            ) : (
              '注册'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>已有账号? <Link to="/login">立即登录</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;