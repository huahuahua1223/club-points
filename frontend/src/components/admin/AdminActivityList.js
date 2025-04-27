import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Tag, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getActivities, deleteActivity } from '../../services/activityService';
import AdminActivityForm from './AdminActivityForm';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

const AdminActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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

  const columns = [
    { title: '活动标题', dataIndex: 'title', key: 'title' },
    {
      title: '活动类型',
      dataIndex: 'type',
      render: (type) => {
        const map = {
          volunteer: { color: 'red', text: '志愿服务' },
          academic: { color: 'green', text: '学术活动' },
          sports: { color: 'blue', text: '体育活动' },
          art: { color: 'pink', text: '文艺活动' },
          other: { color: 'orange', text: '其他' }
        };
        const item = map[type] || { color: 'gray', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        const map = {
          draft: { color: 'default', text: '草稿' },
          ongoing: { color: 'green', text: '进行中' },
          completed: { color: 'red', text: '已完成' },
          cancelled: { color: 'yellow', text: '已取消' }
        };
        const item = map[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} type="text" onClick={() => handleView(record._id)}>查看</Button>
          <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(record)}>编辑</Button>
          {record.status === 'draft' && (
            <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(record._id)}>删除</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建活动</Button>
        <Input.Search
          placeholder="搜索活动标题"
          allowClear
          onSearch={handleSearch}
          style={{ width: 240, marginLeft: 12 }}
        />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={activities}
        pagination={{ current: currentPage, pageSize, total }}
        loading={loading}
        onChange={handleTableChange}
      />
      <AdminActivityForm
        open={isModalVisible}
        onClose={handleModalClose}
        activity={editingActivity}
      />
    </div>
  );
};

export default AdminActivityList;
