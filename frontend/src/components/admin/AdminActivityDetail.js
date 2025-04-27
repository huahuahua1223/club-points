// AdminActivityDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Typography, Spin, Button, Modal, message, List, Input, Carousel, Image, Row, Col, Divider } from 'antd';
import { EyeOutlined, UserOutlined, BarChartOutlined, PictureOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { getActivity, startActivity, completeActivity, getActivityParticipants, getActivityStats, setCheckInCode } from '../../services/activityService';
import './ActivityDetail.css'; // 确保创建这个CSS文件

const { Title, Paragraph } = Typography;

const AdminActivityDetail = () => {
  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [isSetCodeModalVisible, setIsSetCodeModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getActivity(id),
      getActivityParticipants(id),
      getActivityStats()
    ]).then((responses) => {
      const [activityResponse, participantsResponse, statsResponse] = responses;
      console.log('participantsResponse', responses);
      if (activityResponse.success) {
        setActivity(activityResponse.data);
      } else {
        message.error(activityResponse.message || '获取活动详情失败');
      }
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      } else {
        message.error(participantsResponse.message || '获取活动参与者列表失败');
      }
      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        message.error(statsResponse.message || '获取活动统计信息失败');
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      message.error('获取数据失败');
    });
  }, [id]);

  const handleAction = (action) => {
    setActionType(action);
    setIsConfirmModalVisible(true);
  };

  const handleConfirm = async () => {
    setIsConfirmModalVisible(false);
    try {
     if (actionType === 'ongoing') {
        const response = await startActivity(id);
        if (!response.success) {
          message.error(response.message || '开始活动失败');
          return;
        }
        message.success('活动已开始');
      } else if (actionType === 'complete') {
        const response = await completeActivity(id);
        if (!response.success) {
          message.error(response.message || '结束活动失败');
          return;
        }
        message.success('活动已结束');
      }
      getActivity(id).then(response => {
        if (response.success) {
          setActivity(response.data);
        } else {
          message.error(response.message || '获取活动详情失败');
        }
      });
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsConfirmModalVisible(false);
  };

  const handleSetCheckInCode = async () => {
    const response = await setCheckInCode(id, { checkInCode });
    if (response.success) {
      message.success('签到码设置成功');
    } else {
      message.error(response.message || '签到码设置失败');
    }
    setIsSetCodeModalVisible(false);
  };

  const handlePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
    setPreviewVisible(true);
  };

  // 获取活动状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      draft: { color: 'default', text: '草稿' },
      ongoing: { color: 'green', text: '进行中' },
      completed: { color: 'red', text: '已完成' },
      cancelled: { color: 'yellow', text: '已取消' }
    };
    const item = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={item.color}>{item.text}</Tag>;
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

  const { title, description, type, startDate, endDate, location, maxParticipants, currentParticipants, organizer, status, images = [], coverImage } = activity;

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
                <span className="activity-status-tag">{getStatusTag(status)}</span>
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
              {status === 'draft' && (
                <Button type="primary" onClick={() => handleAction('ongoing')}>开始活动</Button>
              )}
              {status === 'ongoing' && (
                <>
                  <Button type="primary" onClick={() => handleAction('complete')}>结束活动</Button>
                  <Button type="primary" onClick={() => setIsSetCodeModalVisible(true)} style={{ marginLeft: 16 }}>设置签到码</Button>
                </>
              )}
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
          {/* 参与者列表 */}
          <Card title="参与者列表" className="participants-card">
            {participants.length > 0 ? (
              <List
                dataSource={participants}
                renderItem={item => (
                  <List.Item className="participant-item">
                    <div className="participant-info">
                      <UserOutlined className="participant-icon" />
                      <div className="participant-name">{item.user.email || '未知用户'}</div>
                    </div>
                    <div className="participant-status">
                      <Tag color={item.status === 'checked-in' ? 'green' : 'blue'}>
                        {item.status === 'checked-in' ? '已签到' : '已报名'}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="no-participants">暂无参与者</div>
            )}
          </Card>
          
          {/* 活动统计 */}
          {stats && (
            <Card title="活动统计" className="stats-card">
              <div className="stats-container">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-label">{stat._id || '未知状态'}</div>
                    <div className="stat-value">
                      <BarChartOutlined className="stat-icon" />
                      <span>数量: {stat.count}</span>
                    </div>
                    <div className="stat-value">
                      <TeamOutlined className="stat-icon" />
                      <span>总参与者: {stat.totalParticipants}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* 确认操作弹窗 */}
      <Modal
        title={`确认${actionType === 'ongoing' ? '开始' : '结束'}活动`}
        visible={isConfirmModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
      >
        <p>确定要{actionType === 'ongoing' ? '开始' : '结束'}这个活动吗？</p>
      </Modal>

      {/* 设置签到码弹窗 */}
      <Modal
        title="设置签到码"
        visible={isSetCodeModalVisible}
        onOk={handleSetCheckInCode}
        onCancel={() => setIsSetCodeModalVisible(false)}
      >
        <Input
          placeholder="请输入签到码"
          value={checkInCode}
          onChange={(e) => setCheckInCode(e.target.value)}
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

export default AdminActivityDetail;