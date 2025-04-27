import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError('');
      const result = await login(values.username, values.password);

      if (result.success) {
        message.success('登录成功');
        const userRole = result.user.role;
        
        // 使用 replace 模式进行导航，防止用户返回登录页
        if (userRole === 'admin') {
          navigate('/admin/home', { replace: true });
        } else {
          navigate('/student/home', { replace: true });
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">社团积分管理系统</h1>
        {error && <div className="error-message">{error}</div>}
        <Form
          name="login"
          onFinish={onFinish}
          className="login-form"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<FaUser className="input-icon" />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              prefix={<FaLock className="input-icon" />}
              type={showPassword ? 'text' : 'password'}
              placeholder="密码"
              autoComplete="current-password"
              suffix={
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
            >
              登录
            </Button>
          </Form.Item>

          <div className="login-links">
            <Link to="/register">还没有账号？立即注册</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
