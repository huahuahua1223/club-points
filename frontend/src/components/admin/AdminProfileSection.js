import React, { useState } from 'react';
import { Form, Input, Button, message, Avatar, Upload } from 'antd';
import { UserOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfileSection = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 'success') {
        message.success('个人信息更新成功');
        // 更新本地存储的用户信息
        const updatedUser = {
          ...user,
          ...response.data.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // 更新全局用户状态
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
    }
    return isImage && isLt2M;
  };

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setUploadLoading(false);
      setImageUrl(URL.createObjectURL(info.file.originFileObj));
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );

  return (
    <div style={{ 
      padding: '24px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>个人资料</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess("ok");
            }, 0);
          }}
        >
          {imageUrl ? (
            <Avatar 
              src={imageUrl} 
              size={100}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : uploadButton}
        </Upload>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          username: user?.username,
          email: user?.email,
          phone: user?.phone
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input type="email" placeholder="邮箱" />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
          ]}
        >
          <Input placeholder="手机号" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '200px' }}>
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminProfileSection; 