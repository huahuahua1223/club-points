import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Timeline, Button, Divider, Progress, Badge, Avatar } from 'antd';
import { TeamOutlined, TrophyOutlined, FileOutlined, ClockCircleOutlined, RightOutlined, 
  DashboardOutlined, FireOutlined, BellOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { getActivities } from '../services/activityService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const AdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalActivities: 0,
    ongoingActivities: 0,
    completedActivities: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 随机生成一些数据用于可视化展示
  const performanceData = {
    activityCompletionRate: 83,
    memberActiveRate: 76,
    taskCompletionRate: 92
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取所有活动数据用于统计
        const activitiesResponse = await getActivities({ limit: 100 });
        
        if (activitiesResponse.success) {
          const activities = activitiesResponse.data || [];
          
          // 统计活动数据
          const totalActivities = activities.length;
          const ongoingActivities = activities.filter(a => a.status === 'ongoing').length;
          const completedActivities = activities.filter(a => a.status === 'completed').length;
          
          // 获取最近的5条活动
          const recentActivities = activities.slice(0, 5);
          setRecentActivities(recentActivities);
          
          // 获取学生总数
          const token = localStorage.getItem('token');
          const studentsResponse = await axios.get('http://localhost:5000/api/auth/students', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const totalMembers = studentsResponse.data.data.total || 0;
          
          // 更新统计数据
          setStats({
            totalMembers,
            totalActivities,
            ongoingActivities,
            completedActivities
          });
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取活动类型对应的文本描述
  const getActivityTypeText = (type) => {
    const types = {
      volunteer: '志愿服务',
      academic: '学术活动',
      sports: '体育活动',
      art: '艺术活动',
      other: '其他'
    };
    return types[type] || '未知类型';
  };

  // 获取活动状态对应的文本描述
  const getActivityStatusText = (status) => {
    const statuses = {
      draft: '草稿',
      ongoing: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statuses[status] || '未知状态';
  };

  // 根据活动状态获取对应的标签颜色
  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      ongoing: 'processing',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // 获取随机颜色
  const getRandomColor = () => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
      {/* 顶部欢迎区域 */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '24px', 
          borderRadius: '8px',
          backgroundImage: 'linear-gradient(to right, #1890ff, #096dd9)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Row align="middle" gutter={24}>
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <DashboardOutlined style={{ marginRight: '12px' }} />
              管理员控制台
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '8px', fontSize: '16px' }}>
              欢迎回来，{user?.username || '管理员'}！现在是 {moment().format('YYYY年MM月DD日 HH:mm')}
            </Paragraph>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              上次登录: {user?.lastLoginAt ? moment(user.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : '首次登录'}
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Badge count={5} style={{ backgroundColor: '#52c41a' }}>
              <Button 
                type="primary" 
                ghost 
                icon={<BellOutlined />} 
                size="large"
                style={{ marginRight: '12px', borderColor: 'white', color: 'white' }}
              >
                通知
              </Button>
            </Badge>
            <Button type="primary" ghost size="large" onClick={() => navigate('/admin/profile')}
              style={{ borderColor: 'white', color: 'white' }}
            >
              个人中心
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            loading={loading}
            className="stat-card"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s',
              height: '100%'
            }}
          >
            <div style={{ position: 'relative' }}>
              <TeamOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(24, 144, 255, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>社团成员</span>}
                value={stats.totalMembers}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
              />
              <Text type="secondary">总计已注册成员</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            loading={loading}
            className="stat-card"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s',
              height: '100%'
            }}
          >
            <div style={{ position: 'relative' }}>
              <FileOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(82, 196, 26, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>总活动数</span>}
                value={stats.totalActivities}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">总计活动数量</Text>
                <Text style={{ color: '#52c41a' }}>
                  <FireOutlined /> 活跃
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            loading={loading}
            className="stat-card"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s',
              height: '100%'
            }}
          >
            <div style={{ position: 'relative' }}>
              <ClockCircleOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(250, 140, 22, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>进行中活动</span>}
                value={stats.ongoingActivities}
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }}
              />
              <Progress 
                percent={stats.totalActivities ? Math.round(stats.ongoingActivities / stats.totalActivities * 100) : 0} 
                size="small" 
                strokeColor="#fa8c16"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            loading={loading}
            className="stat-card"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s',
              height: '100%'
            }}
          >
            <div style={{ position: 'relative' }}>
              <TrophyOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(114, 46, 209, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>已完成活动</span>}
                value={stats.completedActivities}
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
              />
              <Progress 
                percent={stats.totalActivities ? Math.round(stats.completedActivities / stats.totalActivities * 100) : 0} 
                size="small" 
                strokeColor="#722ed1"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 性能指标区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={8}>
          <Card 
            title={<Title level={4}><CheckCircleOutlined /> 活动完成率</Title>}
            bordered={false}
            style={{ borderRadius: '8px', height: '100%' }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress 
                type="dashboard" 
                percent={performanceData.activityCompletionRate} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                width={180}
              />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '16px' }}>当前活动完成率表现 <span style={{ color: '#52c41a' }}>良好</span></Text>
                <br />
                <Text type="secondary">相比上月提高了 2.5%</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<Title level={4}><TeamOutlined /> 会员活跃度</Title>}
            bordered={false}
            style={{ borderRadius: '8px', height: '100%' }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress 
                type="dashboard" 
                percent={performanceData.memberActiveRate}
                strokeColor={{
                  '0%': '#faad14',
                  '100%': '#fa8c16',
                }}
                width={180}
              />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '16px' }}>当前会员活跃度 <span style={{ color: '#fa8c16' }}>一般</span></Text>
                <br />
                <Text type="secondary">需要增加会员参与度</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<Title level={4}><TrophyOutlined /> 任务达成率</Title>}
            bordered={false}
            style={{ borderRadius: '8px', height: '100%' }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress 
                type="dashboard" 
                percent={performanceData.taskCompletionRate}
                strokeColor={{
                  '0%': '#722ed1',
                  '100%': '#eb2f96',
                }}
                width={180}
              />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '16px' }}>任务完成率表现 <span style={{ color: '#722ed1' }}>优秀</span></Text>
                <br />
                <Text type="secondary">相比上月提高了 5.8%</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>最近活动</span>
              </div>
            }
            loading={loading}
            bordered={false}
            extra={<Button type="link" onClick={() => navigate('/admin/activities')}>更多 <RightOutlined /></Button>}
            style={{ borderRadius: '8px' }}
          >
            <List
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item
                  key={item._id}
                  actions={[
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={() => navigate(`/admin/activities/${item._id}`)}
                    >
                      详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ 
                          backgroundColor: getRandomColor(),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.title.slice(0, 1)}
                      </Avatar>
                    }
                    title={
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</span> 
                        <Badge 
                          status={getStatusColor(item.status)} 
                          text={getActivityStatusText(item.status)} 
                          style={{ marginLeft: '8px' }}
                        />
                      </div>
                    }
                    description={
                      <>
                        <div>类型: {getActivityTypeText(item.type)}</div>
                        <div>地点: {item.location} | 开始时间: {moment(item.startDate).format('YYYY-MM-DD HH:mm')}</div>
                        <div>参与人数: {item.currentParticipants || 0}/{item.maxParticipants}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无活动' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BellOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                <span>系统公告</span>
              </div>
            }
            loading={loading}
            bordered={false}
            style={{ borderRadius: '8px' }}
          >
            <Timeline>
              <Timeline.Item color="green">
                <Card size="small" style={{ marginBottom: '8px', borderLeft: '2px solid #52c41a' }}>
                  <Meta 
                    title="系统更新: 新增活动统计功能" 
                    description={<Text type="secondary">2025-04-26</Text>}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Text>新上线的统计功能可以帮助管理员更好地了解社团活动情况</Text>
                </Card>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Card size="small" style={{ marginBottom: '8px', borderLeft: '2px solid #1890ff' }}>
                  <Meta 
                    title="活动提醒: 本周有3个活动需要审核" 
                    description={<Text type="secondary">2025-04-26</Text>}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/admin/activities')}>
                    点击前往审核
                  </Button>
                </Card>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Card size="small" style={{ marginBottom: '8px', borderLeft: '2px solid #f5222d' }}>
                  <Meta 
                    title="重要通知: 请所有管理员更新个人信息" 
                    description={<Text type="secondary">2025-04-26</Text>}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Text>为了确保系统安全，请所有管理员尽快更新个人资料</Text>
                </Card>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHome; 