// AdminActivityDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Typography, Spin, Button, Modal, message, List,Input} from 'antd';
import { EyeOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import { getActivity, startActivity, completeActivity, getActivityParticipants, getActivityStats, setCheckInCode } from '../../services/activityService';

const AdminActivityDetail = () => {
  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [isSetCodeModalVisible, setIsSetCodeModalVisible] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getActivity(id),
      getActivityParticipants(id),
      getActivityStats()
    ]).then((responses) => {
      const [activityResponse, participantsResponse, statsResponse] = responses;
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

  if (loading) {
    return <Spin tip="加载中..." />;
  }

  if (!activity) {
    return <div>活动详情不存在</div>;
  }

  const { title, description, type, startDate, endDate, location, maxParticipants, organizer, status } = activity;

  return (
    <Card title="活动详情" variant="outlined">
      <Descriptions column={1}>
        <Descriptions.Item label="标题">{title}</Descriptions.Item>
        <Descriptions.Item label="描述">{description}</Descriptions.Item>
        <Descriptions.Item label="类型">
          <Tag color="blue">{type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="开始日期">{new Date(startDate).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="结束日期">{new Date(endDate).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="地点">{location}</Descriptions.Item>
        <Descriptions.Item label="最大参与人数">{maxParticipants}</Descriptions.Item>
        <Descriptions.Item label="组织者">{organizer}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color="green">{status}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        {status === 'draft' && (
          <Button type="primary" onClick={() => handleAction('ongoing')} style={{ marginLeft: '10px' }}>开始活动</Button>
        )}
        {status === 'ongoing' && (
          <Button type="primary" onClick={() => handleAction('complete')} style={{ marginLeft: '10px' }}>结束活动</Button>
        )}
        {status === 'ongoing' && (
          <Button type="primary" onClick={() => setIsSetCodeModalVisible(true)} style={{ marginLeft: '10px' }}>设置签到码</Button>
        )}
      </div>

      <List
        dataSource={participants}
        renderItem={item => (
          <List.Item>
            {item.name} - {item.email}
          </List.Item>
        )}
        style={{ marginTop: 16 }}
      />

      {stats && (
        <div style={{ marginTop: 16 }}>
          <h3>活动统计信息</h3>
          <ul>
            {stats.map((stat, index) => (
              <li key={index}>
                状态：{stat._id}，数量：{stat.count}，总参与者：{stat.totalParticipants}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        title={`确认${actionType === 'ongoing' ? '开始' : '结束'}活动`}
        visible={isConfirmModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
      >
        <p>确定要{actionType === 'ongoing' ? '开始' : '结束'}这个活动吗？</p>
      </Modal>

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
    </Card>
  );
};

export default AdminActivityDetail;