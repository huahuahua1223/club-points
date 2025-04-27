import React from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaUsers,
  FaMedal,
  FaCalendarAlt,
  FaUserCircle
} from 'react-icons/fa';

const { Sider } = Layout;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const adminMenu = [
    {
      key: '/admin/members',
      icon: <FaUsers />,
      label: '成员列表'
    },
    {
      key: '/admin/point-rules',
      icon: <FaMedal />,
      label: '积分规则'
    },
    {
      key: '/admin/activities',
      icon: <FaCalendarAlt />,
      label: '活动管理'
    },
    {
      key: '/admin/profile',
      icon: <FaUserCircle />,
      label: '个人资料'
    }
  ];

  const studentMenu = [
    {
      key: '/student/activities',
      icon: <FaCalendarAlt />,
      label: '活动列表'
    },
    {
      key: '/student/points',
      icon: <FaMedal />,
      label: '积分记录'
    },
    {
      key: '/student/profile',
      icon: <FaUserCircle />,
      label: '个人资料'
    }
  ];

  const menuItems = user.role === 'admin' ? adminMenu : studentMenu;

  const handleMenuClick = (key) => {
    // 检查用户权限
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      navigate('/login');
      return;
    }

    // 验证路径权限
    const isAdminPath = key.startsWith('/admin');
    const isStudentPath = key.startsWith('/student');

    if ((isAdminPath && userRole !== 'admin') || (isStudentPath && userRole !== 'student')) {
      navigate(userRole === 'admin' ? '/admin/members' : '/student');
      return;
    }

    navigate(key);
  };

  return (
    <Sider width={200} className="sidebar" style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </Sider>
  );
};

export default Sidebar;
