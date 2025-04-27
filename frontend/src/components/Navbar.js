import React from 'react';
import { Layout, Menu, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate(`/${user.role}/profile`)}>
        个人资料
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        登出
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="navbar" style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'fixed', width: '100%', zIndex: 1000, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 'bold', fontSize: 20, color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate('/')}>
        校园社团管理系统
      </div>
      {user && (
        <Dropdown overlay={menu} trigger={['click']}>
          <div style={{ cursor: 'pointer' }}>
            {user.name || '用户'}（{user.role === 'admin' ? '管理员' : '学生'}）
          </div>
        </Dropdown>
      )}
    </Header>
  );
};

export default Navbar;
