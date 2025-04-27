// ActivityDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getActivity, signupActivity, cancelSignupActivity, checkInActivity } from '../../services/activityService';
import { Card, Button, Descriptions, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchActivity = async () => {
    setLoading(true);
    const res = await getActivity(id);
    if (res.success) {
      setActivity(res.data);
      const participants = res.data?.participants || [];
      setIsParticipant(participants.some(p => p?.userId?.toString() === res.data.userId?.toString()));
      setIsCheckedIn(participants.some(p => p?.userId?.toString() === res.data.userId?.toString() && p.status === 'checkedIn'));
    } else {
      message.error(res.message || '获取活动详情失败');
      setActivity(null);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    const res = await signupActivity(id);
    if (res.success) {
      message.success('报名成功');
      fetchActivity();
    } else {
      message.error(res.message || '报名失败');
    }
  };

  const handleCancelSignup = async () => {
    const res = await cancelSignupActivity(id);
    if (res.success) {
      message.success('取消报名成功');
      fetchActivity();
    } else {
      message.error(res.message || '取消报名失败');
    }
  };

  const handleCheckIn = async () => {
    const checkInCode = prompt('请输入签到码:');
    const res = await checkInActivity(id, { checkInCode });
    if (res.success) {
      message.success(res.message);
      fetchActivity(); // 重新获取活动信息以更新UI
    } else {
      message.error(res.message || '签到失败');
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [id]);

  if (!activity) {
    return <div>加载中或活动不存在</div>;
  }

  return (
    <Card title="活动详情" loading={loading}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="标题">{activity.title}</Descriptions.Item>
        <Descriptions.Item label="类型">{activity.type}</Descriptions.Item>
        <Descriptions.Item label="时间">
          {new Date(activity.startDate).toLocaleString()} - {new Date(activity.endDate).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="地点">{activity.location}</Descriptions.Item>
        <Descriptions.Item label="积分">{activity.points}</Descriptions.Item>
        <Descriptions.Item label="描述">{activity.description}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        {!isParticipant && activity.status === 'ongoing' && (
          <Button type="primary" onClick={handleSignup}>
            报名
          </Button>
        )}
        {isParticipant && activity.status === 'ongoing' && (
          <Button type="primary" onClick={handleCancelSignup} style={{ marginLeft: 8 }}>
            取消报名
          </Button>
        )}
        {isParticipant && !isCheckedIn && activity.status === 'ongoing' && (
          <Button type="primary" onClick={handleCheckIn} style={{ marginLeft: 16 }}>
            签到
          </Button>
        )}
        {isParticipant && isCheckedIn && (
          <Button type="dashed" disabled style={{ marginLeft: 8 }}>
            已签到
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ActivityDetail;