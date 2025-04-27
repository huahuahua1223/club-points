// ActivityDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, message, Spin, Modal, Input, Typography, Badge, Carousel, Divider, Row, Col } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getActivity, signupActivity, cancelSignupActivity, checkInActivity } from '../../services/activityService';
import '../admin/ActivityDetail.css'; // 重用管理员活动详情样式

const { Title, Paragraph } = Typography;

const ActivityDetail = () => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  // 从本地存储获取当前用户ID
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        console.log('user', user);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    setLoading(true);
    try {
      const response = await getActivity(id);
      console.log('response', response);
      if (response.success) {
        setActivity(response.data);
        
        // 检查当前用户是否报名
        if (response.data.participants && response.data.participants.length > 0 && currentUserId) {
          const userParticipant = response.data.participants.find(
            p => p.user && (p.user._id === currentUserId || p.user === currentUserId)
          );
          
          setIsRegistered(!!userParticipant);
          
          // 检查是否签到
          if (userParticipant && userParticipant.status === 'checked-in') {
            setIsCheckedIn(true);
          } else {
            setIsCheckedIn(false);
          }
        } else {
          setIsRegistered(false);
          setIsCheckedIn(false);
        }
      } else {
        message.error(response.message || '获取活动详情失败');
      }
    } catch (error) {
      message.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 当用户ID更新时重新检查报名状态
  useEffect(() => {
    if (activity && currentUserId) {
      checkRegistrationStatus();
    }
  }, [currentUserId, activity]);

  // 检查报名状态的函数
  const checkRegistrationStatus = () => {
    if (!activity || !activity.participants || !currentUserId) return;
    
    const userParticipant = activity.participants.find(
      p => p.user && (p.user._id === currentUserId || p.user === currentUserId)
    );
    
    setIsRegistered(!!userParticipant);
    setIsCheckedIn(userParticipant?.status === 'checked-in');
  };

  const handleRegister = async () => {
    try {
      const response = await signupActivity(id);
      if (response.success) {
        message.success('报名成功');
        setIsRegistered(true);
        // 刷新活动数据
        fetchActivityDetail();
      } else {
        message.error(response.message || '报名失败');
      }
    } catch (error) {
      message.error('报名失败');
    }
  };

  const handleCancelRegistration = async () => {
    Modal.confirm({
      title: '确认取消报名',
      content: '确定要取消报名参加这个活动吗？',
      onOk: async () => {
        try {
          const response = await cancelSignupActivity(id);
          if (response.success) {
            message.success('取消报名成功');
            setIsRegistered(false);
            // 刷新活动数据
            fetchActivityDetail();
          } else {
            message.error(response.message || '取消报名失败');
          }
        } catch (error) {
          message.error('取消报名失败');
        }
      }
    });
  };

  const handleOpenCheckIn = () => {
    setIsCheckInOpen(true);
  };

  const handleCheckIn = async () => {
    try {
      const response = await checkInActivity(id, { checkInCode });
      if (response.success) {
        message.success('签到成功');
        setIsCheckInOpen(false);
        setIsCheckedIn(true);
        // 刷新活动数据
        fetchActivityDetail();
      } else {
        message.error(response.message || '签到失败');
      }
    } catch (error) {
      message.error('签到失败');
    }
  };

  const handlePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
    setPreviewVisible(true);
  };

  // 获取活动类型标签
  const getTypeTag = (type) => {
    const typeMap = {
      volunteer: { color: 'red', text: '志愿服务' },
      academic: { color: 'green', text: '学术活动' },
      sports: { color: 'blue', text: '体育活动' },
      art: { color: 'pink', text: '文艺活动' },
      other: { color: 'orange', text: '其他' }
    };
    const item = typeMap[type] || { color: 'gray', text: '未知' };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  if (loading) {
    return <div className="activity-detail-loading"><Spin tip="加载中..." size="large" /></div>;
  }

  if (!activity) {
    return <div className="activity-detail-empty">活动详情不存在</div>;
  }

  const { title, description, type, startDate, endDate, location, maxParticipants, currentParticipants, status, images = [], coverImage } = activity;

  const isRegistrationOpen = status === 'ongoing' && (maxParticipants === 0 || currentParticipants < maxParticipants);

  // 准备轮播图片
  const carouselImages = [];
  if (coverImage) {
    carouselImages.push(`http://localhost:5000${coverImage}`);
  }
  if (images && images.length > 0) {
    images.forEach(img => {
      if (img.url && img.url !== coverImage) {
        carouselImages.push(`http://localhost:5000${img.url}`);
      }
    });
  }
  // 如果没有图片，添加默认图片
  if (carouselImages.length === 0) {
    carouselImages.push('https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png');
  }

  return (
    <div className="activity-detail-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="activity-detail-card">
            <div className="activity-detail-header">
              <Title level={2}>
                {title}
                <Badge
                  status={isRegistrationOpen ? "success" : "default"}
                  text={isRegistrationOpen ? "可报名" : "已截止"}
                  style={{ marginLeft: 16 }}
                />
              </Title>
              <div className="activity-type-tag">{getTypeTag(type)}</div>
            </div>
            
            <div className="activity-carousel-container" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <Carousel autoplay className="activity-carousel">
                {carouselImages.map((image, index) => (
                  <div key={index} className="carousel-item">
                    <img 
                      src={image} 
                      alt={`活动图片${index + 1}`} 
                      className="carousel-image"
                      onClick={() => handlePreview(image)}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
            
            <div className="activity-detail-info">
              <div className="info-item">
                <CalendarOutlined className="info-icon" />
                <span className="info-label">开始时间:</span>
                <span>{new Date(startDate).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <CalendarOutlined className="info-icon" />
                <span className="info-label">结束时间:</span>
                <span>{new Date(endDate).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <EnvironmentOutlined className="info-icon" />
                <span className="info-label">地点:</span>
                <span>{location}</span>
              </div>
              <div className="info-item">
                <TeamOutlined className="info-icon" />
                <span className="info-label">参与人数:</span>
                <span>{currentParticipants || 0}/{maxParticipants}</span>
              </div>
            </div>
            
            <Divider />
            
            <div className="activity-description">
              <Title level={4}>活动描述</Title>
              <Paragraph>{description}</Paragraph>
            </div>
            
            <div className="activity-action-buttons">
              {isRegistrationOpen && !isRegistered && (
                <Button type="primary" onClick={handleRegister}>
                  报名参加
                </Button>
              )}
              {isRegistered && !isCheckedIn && (
                <Button type="primary" onClick={handleOpenCheckIn}>
                  签到
                </Button>
              )}
              {isCheckedIn && (
                <Button type="primary" disabled>
                  已签到
                </Button>
              )}
              {isRegistered && !isCheckedIn && (
                <Button type="default" danger onClick={handleCancelRegistration} style={{ marginLeft: 16 }}>
                  取消报名
                </Button>
              )}
              <Button onClick={() => navigate('/student/activities')} style={{ marginLeft: 16 }}>
                返回列表
              </Button>
            </div>
          </Card>
          
          {/* 图片库 */}
          {images && images.length > 0 && (
            <Card title="活动图片库" className="activity-images-card">
              <div className="activity-image-grid">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className="image-item"
                    onClick={() => handlePreview(`http://localhost:5000${image.url}`)}
                  >
                    <img 
                      src={`http://localhost:5000${image.url}`} 
                      alt={image.description || `活动图片${index + 1}`} 
                    />
                    {image.description && <div className="image-description">{image.description}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="activity-status-card">
            <div className="status-header">
              <Title level={4}>活动状态</Title>
            </div>
            <div className="status-content">
              {isRegistered ? (
                <div className="status-registered">
                  <CheckCircleOutlined className="status-icon success" />
                  <div className="status-text">
                    <div className="status-title">{isCheckedIn ? '已签到' : '已报名'}</div>
                    <div className="status-description">
                      {isCheckedIn 
                        ? '您已成功签到参加此活动' 
                        : '您已成功报名参加此活动，请按时参加并签到'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="status-not-registered">
                  <CloseCircleOutlined className="status-icon warning" />
                  <div className="status-text">
                    <div className="status-title">未报名</div>
                    <div className="status-description">
                      {isRegistrationOpen 
                        ? "该活动正在招募参与者，可以马上报名" 
                        : "活动报名已结束，无法报名参加"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Divider />
            <div className="activity-points-info">
              <Title level={5}>活动积分</Title>
              <div className="points-detail">
                <p>完成活动可获得积分：{activity.points?.value || '暂无积分信息'}</p>
                <p>积分规则：{activity.points?.ruleName || '暂无规则信息'}</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 签到模态框 */}
      <Modal
        title="活动签到"
        visible={isCheckInOpen}
        onOk={handleCheckIn}
        onCancel={() => setIsCheckInOpen(false)}
      >
        <Input
          placeholder="请输入签到码"
          value={checkInCode}
          onChange={(e) => setCheckInCode(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
      
      {/* 图片预览弹窗 */}
      <Modal
        visible={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img 
          alt="活动图片" 
          style={{ width: '100%' }} 
          src={previewImage} 
        />
      </Modal>
    </div>
  );
};

export default ActivityDetail;