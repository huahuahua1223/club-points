import React, { useEffect } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, Modal, message } from 'antd';
import { createActivity, updateActivity } from '../../services/activityService';
import moment from 'moment';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AdminActivityForm = ({ open, onClose, activity }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && activity) {
      form.setFieldsValue({
        ...activity,
        timeRange: [moment(activity.startDate), moment(activity.endDate)]
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, activity, form]);

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      startDate: values.timeRange[0].format(),
      endDate: values.timeRange[1].format(),
      organizer: 'currentUser._id', // 替换为真实用户
      status: activity?.status || 'draft'
    };

    try {
      const res = activity
        ? await updateActivity(activity._id, payload)
        : await createActivity(payload);

      if (res.success) {
        message.success(activity ? '更新成功' : '创建成功');
        onClose(true); // 通知父组件刷新
      } else {
        message.error(res.message || '提交失败');
      }
    } catch (err) {
      message.error('提交失败，请重试');
    }
  };

  return (
    <Modal
      title={activity ? '编辑活动' : '创建活动'}
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          type: 'volunteer',
          maxParticipants: 1,
          status: 'draft'
        }}
      >
        <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="活动描述" rules={[{ required: true, message: '请输入描述' }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="volunteer">志愿服务</Select.Option>
            <Select.Option value="academic">学术活动</Select.Option>
            <Select.Option value="sports">体育活动</Select.Option>
            <Select.Option value="art">文艺活动</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="points" label="积分 ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="timeRange" label="活动时间" rules={[{ required: true }]}>
          <RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="location" label="活动地点" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="maxParticipants" label="最大参与人数" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="活动状态" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="ongoing">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            {activity ? '更新' : '创建'}
          </Button>
          <Button onClick={() => onClose(false)}>取消</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminActivityForm;
