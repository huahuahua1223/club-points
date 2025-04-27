import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaMedal, FaBell, FaCog } from 'react-icons/fa';
import ProfileSection from '../components/ProfileSection';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';
import '../styles/profile.css';

const Dashboard = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'home');
  const { updateUser } = useAuth();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  // 根据路径更新 tab 高亮
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/student/activities')) setActiveTab('activities');
    else if (path.includes('/student/points')) setActiveTab('points');
    else if (path.includes('/student/rewards')) setActiveTab('rewards');
    else if (path.includes('/student/profile')) setActiveTab('profile');
    else setActiveTab('home');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateUser = (updatedUser) => {
    console.log('Dashboard 更新用户信息:', updatedUser);
    updateUser(updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    navigate(`/student/${tab === 'home' ? 'home' : tab}`);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">
          <FaMedal className="brand-icon" />
          <h1>校园社团积分系统</h1>
        </div>
        <div className="header-user">
          <div className="notifications">
            <FaBell />
          </div>
          <div className="settings">
            <FaCog />
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={`http://localhost:5000${user.avatar}`} alt={user.name} />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role === 'admin' ? '管理员' : '学生'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'home' ? 'active' : ''} onClick={() => handleNavClick('home')}>
                首页
              </li>
              {user.role === 'admin' ? (
                <>
                  <li className={activeTab === 'members' ? 'active' : ''} onClick={() => handleNavClick('members')}>
                    成员管理
                  </li>
                  <li className={activeTab === 'activities' ? 'active' : ''} onClick={() => handleNavClick('activities')}>
                    活动管理
                  </li>
                </>
              ) : (
                <>
                  <li className={activeTab === 'activities' ? 'active' : ''} onClick={() => handleNavClick('activities')}>
                    活动中心
                  </li>
                  <li className={activeTab === 'points' ? 'active' : ''} onClick={() => handleNavClick('points')}>
                    积分记录
                  </li>
                </>
              )}
              <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleNavClick('profile')}>
                个人信息
              </li>
            </ul>
          </nav>

          <div className="points-summary">
            <div className="points-icon">
              <FaMedal />
            </div>
            <div className="points-details">
              <span className="points-label">我的积分</span>
              <span className="points-value">{user.points || 0}</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-header">
            <h2>
              {activeTab === 'home' && '欢迎使用校园社团积分系统'}
              {activeTab === 'members' && '成员管理'}
              {activeTab === 'activities' && (user.role === 'admin' ? '活动管理' : '活动中心')}
              {activeTab === 'points' && '积分记录'}
              {activeTab === 'profile' && '个人信息'}
            </h2>
          </div>

          <div className="content-body">
            {/* 首页内容由 Outlet（StudentHome 组件）提供 */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
