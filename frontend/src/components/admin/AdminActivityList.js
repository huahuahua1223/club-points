import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Modal, Tag, Input, Row, Col, Pagination, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { getActivities, deleteActivity } from '../../services/activityService';
import AdminActivityForm from './AdminActivityForm';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import './ActivityList.css'; // 确保创建这个CSS文件

const { Meta } = Card;
const { Search } = Input;

const AdminActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const navigate = useNavigate();

  const fetchActivities = async (page = currentPage, size = pageSize, title = searchTitle) => {
    setLoading(true);
    try {
      const response = await getActivities({ page, limit: size, title });
      if (response.success) {
        setActivities(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      message.error('获取活动失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage, pageSize, searchTitle]);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个活动吗？',
      onOk: async () => {
        try {
          const res = await deleteActivity(id);
          if (res.success) {
            message.success('删除成功');
            fetchActivities();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingActivity(null);
    setIsModalVisible(true);
  };

  const handleModalClose = (refresh = false) => {
    setIsModalVisible(false);
    setEditingActivity(null);
    if (refresh) fetchActivities();
  };

  const handleSearch = debounce((value) => {
    setSearchTitle(value);
    setCurrentPage(1);
  }, 500);

  const handleView = (id) => {
    navigate(`/admin/activities/${id}`);
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

  // 渲染活动卡片
  const renderActivityCard = (activity) => {
    const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';
    const coverImage = activity.coverImage ? 
      `http://localhost:5000${activity.coverImage}` : defaultCover;
    
    return (
      <Col xs={24} sm={12} md={8} lg={6} key={activity._id}>
        <Card
          hoverable
          className="activity-card"
          cover={
            <div className="card-image-container">
              <img 
                alt={activity.title} 
                src={coverImage} 
                className="activity-card-image"
                onClick={() => handleView(activity._id)}
              />
            </div>
          }
          actions={[
            <Button icon={<EyeOutlined />} type="text" onClick={() => handleView(activity._id)}>查看</Button>,
            <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(activity)}>编辑</Button>,
            activity.status === 'draft' && (
              <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(activity._id)}>删除</Button>
            )
          ].filter(Boolean)}
        >
          <Meta 
            title={
              <div className="activity-card-title">
                <span>{activity.title}</span>
                {getStatusTag(activity.status)}
              </div>
            } 
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
      </Col>
    );
  };

  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          className="create-button"
        >
          创建活动
        </Button>
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
          <Empty description="暂无活动" />
        )}
      </Spin>
      
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 个活动`}
        />
      </div>
      
      <AdminActivityForm
        open={isModalVisible}
        onClose={handleModalClose}
        activity={editingActivity}
      />
    </div>
  );
};

export default AdminActivityList;
