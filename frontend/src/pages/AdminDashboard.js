import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { FaSignOutAlt, FaUser, FaUserShield, FaUsers, FaMedal, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/adminDashboard.css';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'home',
      icon: <FaCalendarAlt />,
      label: '首页概览',
      onClick: () => navigate('/admin/home')
    },
    {
      key: 'members',
      icon: <FaUsers />,
      label: '成员管理',
      onClick: () => navigate('/admin/members')
    },
    {
      key: 'point-rules',
      icon: <FaMedal />,
      label: '积分规则',
      onClick: () => navigate('/admin/point-rules')
    },
    {
      key: 'activities',
      icon: <FaCalendarAlt />,
      label: '活动管理',
      onClick: () => navigate('/admin/activities')
    },
    {
      key: 'profile',
      icon: <FaUserCircle />,
      label: '个人资料',
      onClick: () => navigate('/admin/profile')
    }
  ];

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        background: '#001529',
        position: 'fixed',
        width: '100%',
        zIndex: 1000
      }}>
        <div className="header-brand" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaUserShield style={{ fontSize: '24px', color: '#fff' }} />
          <h1 style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: '20px'
          }}>社团管理系统</h1>
        </div>
        <div className="header-user">
          <div className="user-profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div className="user-avatar" style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1890ff'
            }}>
              {user.avatar ? (
                <img 
                  src={`http://localhost:5000${user.avatar}`} 
                  alt={user.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FaUser style={{ color: '#fff' }} />
              )}
            </div>
            <div className="user-info" style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: '1.2'
            }}>
              <span className="user-name" style={{ 
                color: '#fff',
                fontWeight: '500'
              }}>{user.username}</span>
              <span className="user-role" style={{ 
                color: '#ccc',
                fontSize: '12px'
              }}>系统管理员</span>
            </div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#1890ff'}
              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </Header>

      <Layout style={{ marginTop: '64px' }}>
        <Sider 
          width={200} 
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            left: 0,
            top: '64px',
            zIndex: 100
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.split('/').pop()]}
            defaultSelectedKeys={['members']}
            style={{ 
              height: '100%',
              borderRight: 0,
              paddingTop: '16px'
            }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ 
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          marginLeft: '200px'
        }}>
          {error && (
            <div className={`alert ${error.includes('成功') ? 'success' : 'error'}`} style={{
              padding: '12px 24px',
              margin: '24px 24px 0',
              borderRadius: '4px',
              background: error.includes('成功') ? '#f6ffed' : '#fff2f0',
              border: `1px solid ${error.includes('成功') ? '#b7eb8f' : '#ffccc7'}`
            }}>
              {error}
            </div>
          )}
          <Content 
            className="site-layout-background" 
            style={{ 
              margin: '24px',
              minHeight: 280,
              background: 'transparent',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;