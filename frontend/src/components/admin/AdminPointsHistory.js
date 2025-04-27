import React, { useState, useEffect } from 'react';
import { Table, Card, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const PointsHistory = () => {
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        const response = await axios.get('/api/points/history');
        setPointsHistory(response.data);
      } catch (error) {
        console.error('Error fetching points history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, []);

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
    },
    {
      title: '积分变化',
      dataIndex: 'pointsChange',
      key: 'pointsChange',
      render: (points) => (
        <span style={{ color: points > 0 ? 'green' : 'red' }}>
          {points > 0 ? '+' : ''}{points}
        </span>
      ),
    },
    {
      title: '当前积分',
      dataIndex: 'currentPoints',
      key: 'currentPoints',
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
    },
  ];

  return (
    <Card>
      <Title level={2}>积分历史记录</Title>
      <Table
        columns={columns}
        dataSource={pointsHistory}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
      />
    </Card>
  );
};

export default PointsHistory; 