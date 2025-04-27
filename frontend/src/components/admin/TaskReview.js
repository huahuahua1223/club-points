import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;

const TaskReview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      message.error('获取任务列表失败');
    }
    setLoading(false);
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '负责人',
      dataIndex: 'leader',
      key: 'leader',
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleReview(record)}>审评</Button>
        </Space>
      ),
    },
  ];

  const handleReview = (task) => {
    form.setFieldsValue({
      ...task,
      startDate: moment(task.startDate),
      endDate: moment(task.endDate),
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };
      await axios.post('/api/tasks/review', formData);
      message.success('任务审评完成');
      handleModalClose();
      fetchTasks();
    } catch (error) {
      message.error('任务审评失败');
    }
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="_id"
      />
      <Modal
        title="任务审评"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="leader"
            label="负责人"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="开始时间"
            rules={[{ required: true }]}
          >
            <DatePicker disabled style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="结束时间"
            rules={[{ required: true }]}
          >
            <DatePicker disabled style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="review"
            label="审评意见"
            rules={[{ required: true, message: '请输入审评意见' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="score"
            label="评分"
            rules={[{ required: true, message: '请输入评分' }]}
          >
            <Input type="number" min={0} max={100} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleModalClose}>取消</Button>
              <Button type="primary" htmlType="submit">
                提交审评
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskReview;