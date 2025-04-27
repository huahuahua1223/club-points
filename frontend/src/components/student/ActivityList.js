import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getActivities } from '../../services/activityService';
import { useNavigate } from 'react-router-dom';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  const fetchActivities = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getActivities({ page, limit: pageSize, status: 'ongoing' }); // 只获取进行中的活动
      if (response.success) {
        setActivities(response.data);
        setPagination({ current: page, pageSize, total: response.total });
      }
    } catch (error) {
      message.error('获取活动列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleTableChange = (pagination) => {
    fetchActivities(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '活动描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => navigate(`/student/activities/${record._id}`)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="进行中的活动">
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={activities}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default ActivityList;