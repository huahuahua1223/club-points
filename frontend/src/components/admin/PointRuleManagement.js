//积分规则管理

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, message } from 'antd';
import axios from 'axios';
import PointRuleForm from './PointRuleForm';
import PointRuleList from './PointRuleList';

const PointRuleManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/points/rules');
      setRules(response.data || []);
    } catch (error) {
      message.error('获取积分规则失败');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRule(null);
    setModalVisible(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/points/rules/${id}`);
      message.success('删除成功');
      fetchRules();
    } catch (error) {
      message.error('删除失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values) => {
    setFormLoading(true);
    try {
      if (editingRule) {
        // 更新规则
        await axios.put(`/api/points/rules/${editingRule._id}`, values);
        message.success('更新成功');
      } else {
        // 创建规则
        await axios.post('/api/points/rules', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRules();
    } catch (error) {
      message.error((editingRule ? '更新' : '创建') + '失败: ' + 
        (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Card
      title="积分规则管理"
      extra={
        <Button type="primary" onClick={handleAdd}>
          添加规则
        </Button>
      }
    >
      <PointRuleList
        rules={rules}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        title={editingRule ? '编辑积分规则' : '创建积分规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <PointRuleForm
          initialValues={editingRule}
          onFinish={handleSubmit}
          loading={formLoading}
          mode={editingRule ? 'edit' : 'create'}
        />
      </Modal>
    </Card>
  );
};

export default PointRuleManagement;