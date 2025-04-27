import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Button, Empty, Progress, Avatar, Badge, Divider } from 'antd';
import { CalendarOutlined, TrophyOutlined, StarOutlined, FireOutlined, 
  ThunderboltOutlined, UserOutlined, ArrowUpOutlined, RightOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivities } from '../services/activityService';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

// 辅助函数：安全地处理可能是对象的活动积分
const getPointsValue = (points) => {
  if (points === null || points === undefined) return 0;
  if (typeof points === 'number') return points;
  if (typeof points === 'object') {
    // 检查是否有 basePoints 属性（积分规则对象）
    if (points.basePoints !== undefined) return points.basePoints;
    // 如果没有 basePoints 但有 points 属性
    if (points.points !== undefined) return points.points;
  }
  return 0; // 默认返回 0
};

// 安全地处理可能成为对象的活动ID
const getSafeId = (item) => {
  if (!item) return 'unknown';
  if (typeof item._id === 'string') return item._id;
  return String(Math.random()).slice(2); // 生成一个随机ID作为备用
};

const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // 模拟数据
  const mockData = {
    leaderboard: [
      { name: '张三', points: 1250 },
      { name: '李四', points: 980 },
      { name: '王五', points: 870 },
      { name: '赵六', points: 720 },
    ],
    rewardsData: [
      { name: '校园音乐会门票', points: 200, stock: 10 },
      { name: '纪念T恤', points: 350, stock: 5 },
      { name: '图书券', points: 150, stock: 20 },
    ]
  };

  // 计算用户排名
  const getUserRank = () => {
    if (!user || !user.points) return '未上榜';
    const userPoints = user.points;
    const higherUsers = mockData.leaderboard.filter(u => u.points > userPoints).length;
    return higherUsers + 1;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getActivities({ limit: 5, status: 'ongoing' });
        if (response.success) {
          setActivities(response.data || []);
        }
      } catch (error) {
        console.error('获取活动列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityTypeTag = (type) => {
    const typeColors = {
      volunteer: 'green',
      academic: 'blue',
      sports: 'orange',
      art: 'purple',
      other: 'default'
    };
    
    const typeNames = {
      volunteer: '志愿服务',
      academic: '学术活动',
      sports: '体育活动',
      art: '艺术活动',
      other: '其他活动'
    };
    
    return <Tag color={typeColors[type]}>{typeNames[type] || '未知类型'}</Tag>;
  };

  // 获取随机渐变背景
  const getGradientBackground = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
      {/* 欢迎横幅 */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '24px', 
          borderRadius: '12px',
          backgroundImage: 'linear-gradient(to right, #6a11cb, #2575fc)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: '12px' }} />
              欢迎回到社团积分系统
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '12px', fontSize: '16px' }}>
              {user?.username || '同学'}，您好！今天是 {moment().format('YYYY年MM月DD日')}
            </Paragraph>
            <Text style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              距离下一次活动还有3天，积极参与可以获得更多积分哦！
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '8px', 
              padding: '16px', 
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}>
              <Statistic
                title={<span style={{ color: 'white', fontSize: '16px' }}>当前积分</span>}
                value={user?.points || 0}
                valueStyle={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}
                prefix={<StarOutlined style={{ color: '#ffec3d' }} />}
              />
              <Progress 
                percent={Math.min(100, Math.round((user?.points || 0) / 10))} 
                strokeColor={{ 
                  '0%': '#ffec3d',
                  '100%': '#fa8c16'
                }}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
              <Text style={{ color: 'white' }}>
                再获得{200 - (user?.points || 0) % 200}积分升级到下一等级
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            loading={loading}
            style={{ 
              borderRadius: '12px', 
              background: '#fff',
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <StarOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(114, 46, 209, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px' }}>我的积分</span>}
                value={user?.points || 0}
                valueStyle={{ 
                  color: '#722ed1', 
                  fontSize: '28px', 
                  fontWeight: 'bold' 
                }}
              />
              <div style={{ marginTop: '12px' }}>
                <Badge status="processing" text={
                  <Text type="secondary">
                    <ArrowUpOutlined style={{ color: '#52c41a' }} /> 本月获得 {user?.points ? Math.floor(user.points * 0.2) : 0} 积分
                  </Text>
                } />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            loading={loading}
            style={{ 
              borderRadius: '12px', 
              background: '#fff',
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <CalendarOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(24, 144, 255, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px' }}>参与活动</span>}
                value={user?.activityCount || 0}
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '28px', 
                  fontWeight: 'bold' 
                }}
              />
              <Progress 
                percent={Math.min(100, ((user?.activityCount || 0) * 10))} 
                size="small" 
                status="active" 
                showInfo={false} 
                style={{ marginTop: '12px' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            loading={loading}
            style={{ 
              borderRadius: '12px', 
              background: '#fff',
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <TrophyOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(82, 196, 26, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px' }}>签到次数</span>}
                value={user?.checkedInCount || 0}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '28px', 
                  fontWeight: 'bold' 
                }}
              />
              <div style={{ marginTop: '12px' }}>
                <Badge status="success" text={
                  <Text type="secondary">
                    连续签到: {user?.checkedInCount ? Math.min(user.checkedInCount, 7) : 0} 天
                  </Text>
                } />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            loading={loading}
            style={{ 
              borderRadius: '12px', 
              background: '#fff',
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <FireOutlined 
                style={{ 
                  fontSize: '52px', 
                  position: 'absolute', 
                  right: '0',
                  top: '0',
                  color: 'rgba(250, 140, 22, 0.1)',
                }}
              />
              <Statistic
                title={<span style={{ fontSize: '16px' }}>积分排名</span>}
                value={getUserRank()}
                valueStyle={{ 
                  color: '#fa8c16', 
                  fontSize: '28px', 
                  fontWeight: 'bold' 
                }}
              />
              <div style={{ marginTop: '12px' }}>
                <Badge status="warning" text={
                  <Text type="secondary">
                    {user?.points ? '超过了' + Math.round((user.points / 1500) * 100) + '%的用户' : '尚未获得积分'}
                  </Text>
                } />
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
                <ThunderboltOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                <span>近期活动</span>
              </div>
            }
            bordered={false}
            loading={loading} 
            style={{ borderRadius: '12px' }}
            extra={<Button type="link" onClick={() => navigate('/student/activities')}>查看全部 <RightOutlined /></Button>}
          >
            {activities && activities.length > 0 ? (
              <List
                dataSource={activities}
                renderItem={item => (
                  <List.Item
                    key={getSafeId(item)}
                    actions={[
                      <Button 
                        type="primary" 
                        ghost
                        onClick={() => navigate(`/student/activities/${getSafeId(item)}`)}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={60} 
                          style={{ 
                            background: getGradientBackground(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: 'white',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {(item.title && typeof item.title === 'string') ? item.title.slice(0, 1) : '?'}
                        </Avatar>
                      }
                      title={
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {item.title} {item.type && getActivityTypeTag(item.type)}
                        </div>
                      }
                      description={
                        <>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'rgba(0, 0, 0, 0.65)', margin: '0 0 8px 0' }}>
                            {item.description || '无描述'}
                          </Paragraph>
                          <div>
                            <Badge status="processing" text={
                              <Text type="secondary">地点: {item.location || '未指定'}</Text>
                            } style={{ marginRight: '16px' }} />
                            <Badge status="success" text={
                              <Text type="secondary">时间: {item.startDate ? moment(item.startDate).format('MM-DD HH:mm') : '未指定'}</Text>
                            } />
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <Text type="secondary">
                              可获得积分: <span style={{ color: '#722ed1', fontWeight: 'bold' }}>
                                {getPointsValue(item.points)}
                              </span>
                            </Text>
                            <div style={{ float: 'right' }}>
                              <Text type="secondary">
                                参与人数: {item.currentParticipants || 0}/{item.maxParticipants || 0}
                              </Text>
                              <Progress 
                                percent={item.maxParticipants > 0 ? 
                                  Math.round(((item.currentParticipants || 0) / item.maxParticipants) * 100) : 0} 
                                size="small" 
                                style={{ width: '120px', display: 'inline-block', marginLeft: '8px' }}
                              />
                            </div>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无活动" style={{ padding: '40px 0' }} />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                    <span>积分排行榜</span>
                  </div>
                }
                bordered={false}
                loading={loading}
                style={{ borderRadius: '12px' }}
              >
                <List
                  dataSource={mockData.leaderboard}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: index === 0 ? '#f5222d' : 
                                            index === 1 ? '#fa8c16' : 
                                            index === 2 ? '#faad14' : '#d9d9d9' 
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        }
                        title={item.name}
                        description={`${item.points} 积分`}
                      />
                      {user && item.name === user.username && (
                        <Badge color="#722ed1" text="当前用户" />
                      )}
                    </List.Item>
                  )}
                />
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ textAlign: 'center' }}>
                  <Button type="link" onClick={() => navigate('/student/points')}>
                    查看完整排行榜
                  </Button>
                </div>
              </Card>
            </Col>
            <Col span={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StarOutlined style={{ color: '#eb2f96', marginRight: '8px' }} />
                    <span>热门兑换奖品</span>
                  </div>
                }
                bordered={false}
                loading={loading}
                style={{ borderRadius: '12px' }}
              >
                <List
                  dataSource={mockData.rewardsData}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary" 
                          size="small" 
                          disabled={user?.points < item.points}
                          onClick={() => navigate('/student/rewards')}
                        >
                          兑换
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={
                          <>
                            <Tag color="#722ed1">{item.points} 积分</Tag>
                            <Tag color={item.stock > 0 ? 'green' : 'red'}>
                              {item.stock > 0 ? `库存 ${item.stock}` : '已抢光'}
                            </Tag>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ textAlign: 'center' }}>
                  <Button type="link" onClick={() => navigate('/student/rewards')}>
                    查看更多奖品
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default StudentHome; 