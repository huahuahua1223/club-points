import React, { useState, useEffect } from 'react';
import { Card, Badge, Tag, Row, Col, Button, Input, message, Spin, Empty, Pagination } from 'antd';
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivities } from '../../services/activityService';
import debounce from 'lodash/debounce';
import '../admin/ActivityList.css'; // 重用管理员活动列表样式

const { Meta } = Card;
const { Search } = Input;

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchActivities = async (pageNum = page, pageSizeNum = pageSize, title = searchTitle) => {
    setLoading(true);
    try {
      const response = await getActivities({ page: pageNum, limit: pageSizeNum, title });
      if (response.success) {
        setActivities(response.data);
        setTotal(response.total);
      } else {
        message.error(response.message || '获取活动列表失败');
      }
    } catch (error) {
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, pageSize, searchTitle]);

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleSearch = debounce((value) => {
    setSearchTitle(value);
    setPage(1);
  }, 500);

  const handleViewDetail = (id) => {
    navigate(`/student/activities/${id}`);
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

  // 渲染活动卡片
  const renderActivityCard = (activity) => {
    const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';
    const coverImage = activity.coverImage ? 
      `http://localhost:5000${activity.coverImage}` : defaultCover;
    
    return (
      <Col xs={24} sm={12} md={8} lg={6} key={activity._id}>
        <Badge.Ribbon 
          text={activity.isRegistrationOpen ? "可报名" : "已满员"} 
          color={activity.isRegistrationOpen ? "green" : "red"}
          style={{ display: activity.isRegistrationOpen ? "block" : "none" }}
        >
          <Card
            hoverable
            className="activity-card"
            cover={
              <div className="card-image-container">
                <img 
                  alt={activity.title} 
                  src={coverImage}
                  className="activity-card-image"
                  onClick={() => handleViewDetail(activity._id)}
                />
              </div>
            }
            actions={[
              <Button 
                type="primary" 
                icon={<RightOutlined />}
                onClick={() => handleViewDetail(activity._id)}
              >
                查看详情
              </Button>
            ]}
          >
            <Meta 
              title={<div className="activity-card-title">{activity.title}</div>}
              description={
                <div className="activity-card-content">
                  <p className="activity-type">
                    {getTypeTag(activity.type)}
                  </p>
                  <p className="activity-time">
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {new Date(activity.startDate).toLocaleDateString()}
                  </p>
                  <p className="activity-location">
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {activity.location}
                  </p>
                  <p className="activity-participants">
                    <TeamOutlined style={{ marginRight: 8 }} />
                    参与人数: {activity.currentParticipants || 0}/{activity.maxParticipants}
                  </p>
                </div>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    );
  };

  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <h2>可参与活动</h2>
        <Search
          placeholder="搜索活动标题"
          allowClear
          onSearch={handleSearch}
          className="search-input"
        />
      </div>
      
      <Spin spinning={loading}>
        {activities.length > 0 ? (
          <Row gutter={[16, 16]} className="activity-cards">
            {activities.map(activity => renderActivityCard(activity))}
          </Row>
        ) : (
          <Empty description="暂无可参与的活动" />
        )}
      </Spin>
      
      <div className="pagination-container">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 个活动`}
        />
      </div>
    </div>
  );
};

export default ActivityList;