import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Modal } from 'antd';
import axios from 'axios';
import MemberForm from './MemberForm';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      message.error('获取成员列表失败');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingMember(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/members/${id}`);
      message.success('成员删除成功');
      fetchMembers();
    } catch (error) {
      message.error('成员删除失败');
    }
  };

  const columns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="primary" danger onClick={() => handleDelete(record._id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingMember(null);
  };

  const handleSave = async (values) => {
    try {
      if (editingMember) {
        await axios.put(`/api/members/${editingMember._id}`, values);
        message.success('成员信息更新成功');
      } else {
        await axios.post('/api/members', values);
        message.success('成员添加成功');
      }
      handleModalClose();
      fetchMembers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          添加成员
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={members}
        loading={loading}
        rowKey="_id"
      />
      <Modal
        title={editingMember ? '编辑成员信息' : '添加新成员'}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <MemberForm
          initialValues={editingMember}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default MemberManagement; 