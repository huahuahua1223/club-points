import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminHome from './pages/AdminHome';
import StudentHome from './pages/StudentHome';

import MemberList from './components/admin/MemberList';
import MemberManagement from './components/admin/MemberManagement';
import PointRuleList from './components/admin/PointRuleList';
import AdminActivityList from './components/admin/AdminActivityList';
import AdminPointsHistory from './components/admin/AdminPointsHistory';
import AdminProfileSection from './components/admin/AdminProfileSection';
import ActivityDetail from './components/student/ActivityDetail';
import PointsHistory from './components/student/PointsHistory';
import RewardList from './components/student/RewardList';
import TaskReview from './components/admin/TaskReview';
import MemberForm from './components/admin/MemberForm';
import AdminActivityForm from './components/admin/AdminActivityForm';
import PointRuleForm from './components/admin/PointRuleForm';
import PointRuleManagement from './components/admin/PointRuleManagement';
import AdminActivityDetail from './components/admin/AdminActivityDetail';
import ActivityList from './components/student/ActivityList';
import ProfileSection from './components/student/ProfileSection';

import './styles/dashboard.css';
import './styles/login.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公共页面 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 管理员端路由 */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="members" element={<MemberList />} />
            <Route path="member-form" element={<MemberForm />} />
            <Route path="member-management" element={<MemberManagement />} />

            <Route path="point-rules" element={<PointRuleList />} />
            <Route path="point-rule-form" element={<PointRuleForm />} />
            <Route path="point-rule-management" element={<PointRuleManagement />} />

            <Route path="activities" element={<AdminActivityList />} />
            <Route path="activity-form" element={<AdminActivityForm />} />
            <Route path="activities/:id" element={<AdminActivityDetail />} />

            <Route path="task-review" element={<TaskReview />} />
            <Route path="profile" element={<AdminProfileSection />} />
            <Route path="points-history" element={<AdminPointsHistory />} />
          </Route>

          {/* 学生端路由 */}
          <Route path="/student" element={
            <PrivateRoute allowedRoles={['student']}>
              <Dashboard />
            </PrivateRoute>
          }>
            {/* 嵌套路由：由 Dashboard 控制内容 */}
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<StudentHome />} />

            <Route path="activities" element={<ActivityList />} />
            <Route path="activities/:id" element={<ActivityDetail />} />

            <Route path="points" element={<PointsHistory />} />
            
            <Route path="rewards" element={<RewardList />} />
            <Route path="profile" element={<ProfileSection />} />
          </Route>

          {/* 捕获未知路由 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
