import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Space, message } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import MemberForm from './MemberForm';

const { confirm } = Modal;

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total) => `共 ${total} 条记录`
  });

  // 获取成员列表
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        const memberData = response.data.data.students || [];
        console.log('获取到的成员数据:', memberData); // 添加调试日志
        setMembers(memberData);
        setPagination(prev => ({
          ...prev,
          total: memberData.length
        }));
      } else {
        message.error('获取成员列表失败');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
        // 清除本地存储并重定向到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      } else {
        message.error(error.response?.data?.message || '获取成员列表失败');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 处理表格变化（排序、筛选、分页）
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // 过滤数据
  const getFilteredData = () => {
    if (!searchText) return members;

    return members.filter(member => {
      const searchFields = [
        member.studentId,
        member.username,
        member.college,
        member.class,
        member.phone,
        member.email,
        member.major // 添加专业字段到搜索范围
      ].filter(Boolean); // 过滤掉undefined和null值
      
      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  // 显示添加/编辑模态框
  const showModal = (member = null) => {
    setEditingMember(member);
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingMember(null);
  };

  // 保存成员信息
  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingMember) {
        // 编辑现有成员
        response = await axios.put(
          `http://localhost:5000/api/auth/users/${editingMember._id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // 添加新成员
        response = await axios.post(
          'http://localhost:5000/api/auth/register',
          { ...values, role: 'student' },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      if (response.data.status === 'success') {
        message.success(editingMember ? '成员信息更新成功' : '成员添加成功');
        handleModalClose();
        fetchMembers();
      }
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 删除成员
  const handleDelete = (record) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除成员 ${record.username} 吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.delete(
            `http://localhost:5000/api/auth/users/${record._id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.status === 'success') {
            message.success('成员删除成功');
            fetchMembers();
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error(error.response?.data?.message || '删除失败');
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
      sortDirections: ['ascend', 'descend'],
      width: '120px',
    },
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
      width: '100px',
    },
    {
      title: '专业',
      dataIndex: 'college',
      key: 'college',
      width: '150px',
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
      width: '100px',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: '120px',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: '180px',
    },
    {
      title: '操作',
      key: 'action',
      width: '150px',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="primary" danger size="small" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = getFilteredData();

  return (
    <div className="member-list-container" style={{ padding: '24px' }}>
      <div className="member-list-header" style={{ 
        marginBottom: '24px',
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div style={{
            marginBottom: '0',
            fontSize: '18px',
            fontWeight: '500',
            color: '#1f1f1f'
          }}>
            成员管理
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <Input.Search
              placeholder="搜索成员信息"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ 
                width: '300px',
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              style={{
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              添加成员
            </Button>
          </div>
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            style: { marginTop: '16px' }
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </div>

      <Modal
        title={editingMember ? '编辑成员信息' : '添加新成员'}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
        style={{ top: 20 }}
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

export default MemberList;