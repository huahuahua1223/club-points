import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Input
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllPointRules, deletePointRule } from '../../services/pointRuleService';
import PointRuleForm from './PointRuleForm';

const PointRuleList = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchRules = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      const response = await getAllPointRules(page, limit, search);
      console.log('获取到的积分规则数据:', response);
      if (response && response.rules) {
        setRules(response.rules);
        setPagination({
          current: response.pagination.currentPage,
          pageSize: response.pagination.itemsPerPage,
          total: response.pagination.totalItems
        });
      } else {
        message.error('获取积分规则数据格式错误');
      }
    } catch (error) {
      console.error('获取积分规则列表错误:', error);
      message.error(error.message || '获取积分规则列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules(pagination.current, pagination.pageSize, searchText);
  }, [searchText]);

  const handleEdit = (record) => {
    console.log('编辑的规则数据:', record); // 添加调试日志
    setEditingRule({
      ...record,
      _id: record._id // 确保_id被正确传递
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条积分规则吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePointRule(id);
          message.success('删除成功');
          fetchRules(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          console.error('删除积分规则错误:', error);
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  const handleTableChange = (newPagination) => {
    fetchRules(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // 重置到第一页
  };

  const activityTypeMap = {
    academic: '学术活动',
    volunteer: '志愿者活动',
    sports: '文体活动',
    art: '艺术活动',
    other: '其他活动'
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: '20%',
    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      key: 'activityType',
      width: '15%',
      render: (type) => activityTypeMap[type] || type,
    },
    {
      title: '积分值',
      width: '15%',
      render: (_, record) => (
        <>
          基础：{record.basePoints}
          <br />
          奖励：{record.bonusPoints}
        </>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingRule(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchRules(pagination.current, pagination.pageSize, searchText);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>积分规则管理</h2>
        <Space>
          <Input
            placeholder="搜索规则名称或描述"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            添加规则
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={rules}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingRule ? '编辑积分规则' : '新增积分规则'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <PointRuleForm
          initialValues={editingRule}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default PointRuleList;