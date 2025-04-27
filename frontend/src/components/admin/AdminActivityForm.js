import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, Modal, message, Spin, Upload, Space } from 'antd';
import { createActivity, updateActivity } from '../../services/activityService';
import { getActivePointRulesForSelect } from '../../services/pointRuleService';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AdminActivityForm = ({ open, onClose, activity }) => {
  const [form] = Form.useForm();
  const [pointRules, setPointRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [tempFileList, setTempFileList] = useState([]);
  const [activityId, setActivityId] = useState(null);

  // 获取积分规则列表
  useEffect(() => {
    const fetchPointRules = async () => {
      setLoading(true);
      try {
        const rules = await getActivePointRulesForSelect();
        setPointRules(rules);
      } catch (error) {
        console.error('获取积分规则失败:', error);
        message.error('获取积分规则失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPointRules();
    }
  }, [open]);

  // 初始化表单数据
  useEffect(() => {
    if (open && activity) {
      // 活动基本信息
      form.setFieldsValue({
        ...activity,
        timeRange: [moment(activity.startDate), moment(activity.endDate)]
      });
      
      // 活动图片
      if (activity.images && activity.images.length > 0) {
        const images = activity.images.map((img, index) => ({
          uid: img._id || `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url: `http://localhost:5000${img.url}`,
          thumbUrl: `http://localhost:5000${img.url}`,
        }));
        setFileList(images);
      }
      setActivityId(activity._id);
      setTempFileList([]);
    } else if (open) {
      form.resetFields();
      setFileList([]);
      setTempFileList([]);
      setActivityId(null);
    }
  }, [open, activity, form]);

  // 处理图片预览
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // 转换文件为Base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 处理图片变化
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 处理临时图片变化
  const handleTempChange = ({ fileList: newFileList }) => {
    setTempFileList(newFileList);
  };

  // 处理临时图片上传前
  const beforeUploadTemp = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件！');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB！');
      return Upload.LIST_IGNORE;
    }
    return false;  // 阻止自动上传
  };

  // 自定义图片上传
  const customUpload = async ({ file, onSuccess, onError }) => {
    if (!activityId) {
      message.error('请先创建活动后再上传图片');
      onError('请先创建活动');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', '活动图片');
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/upload/activities/${activityId}/images`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      onSuccess(response.data);
      message.success('图片上传成功');
    } catch (error) {
      console.error('上传图片失败:', error);
      message.error('上传图片失败');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  // 上传所有临时图片
  const uploadTempFiles = async (newActivityId) => {
    if (tempFileList.length === 0) return;
    
    const token = localStorage.getItem('token');
    setUploading(true);
    
    try {
      for (let file of tempFileList) {
        if (!file.originFileObj) continue;
        
        const formData = new FormData();
        formData.append('image', file.originFileObj);
        formData.append('description', file.name || '活动图片');
        
        await axios.post(
          `http://localhost:5000/api/upload/activities/${newActivityId}/images`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      message.success('所有图片上传成功');
    } catch (error) {
      console.error('上传图片失败:', error);
      message.error('部分图片上传失败，请在编辑活动时重试');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      startDate: values.timeRange[0].format(),
      endDate: values.timeRange[1].format(),
      organizer: 'currentUser._id', // 替换为真实用户
      status: activity?.status || 'draft'
    };

    try {
      setLoading(true);
      const res = activity
        ? await updateActivity(activity._id, payload)
        : await createActivity(payload);

      if (res.success) {
        message.success(activity ? '更新成功' : '创建成功');
        
        // 如果是新创建的活动且有临时图片，上传这些图片
        if (!activity && tempFileList.length > 0 && res.data && res.data._id) {
          await uploadTempFiles(res.data._id);
        }
        
        onClose(true); // 通知父组件刷新
      } else {
        message.error(res.message || '提交失败');
      }
    } catch (err) {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Modal
      title={activity ? '编辑活动' : '创建活动'}
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Spin spinning={loading}>
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
          <Form.Item 
            name="points" 
            label="积分规则" 
            rules={[{ required: true, message: '请选择积分规则' }]}
            extra="选择一个适用于此活动的积分规则"
          >
            <Select
              placeholder="请选择积分规则"
              optionFilterProp="label"
              showSearch
              loading={loading}
              options={pointRules}
              notFoundContent={loading ? <Spin size="small" /> : '没有找到积分规则'}
            />
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
          
          {activityId && (
            <Form.Item 
              label="活动图片" 
              extra="上传活动相关图片，第一张图片将作为封面"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                customRequest={customUpload}
                accept="image/*"
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
            </Form.Item>
          )}
          
          {!activityId && (
            <Form.Item 
              label="活动图片" 
              extra="选择活动相关图片，将在活动创建后上传，第一张图片将作为封面"
            >
              <Upload
                listType="picture-card"
                fileList={tempFileList}
                onPreview={handlePreview}
                onChange={handleTempChange}
                beforeUpload={beforeUploadTemp}
                accept="image/*"
              >
                {tempFileList.length >= 8 ? null : uploadButton}
              </Upload>
            </Form.Item>
          )}
          
          <Modal
            visible={previewVisible}
            title="图片预览"
            footer={null}
            onCancel={() => setPreviewVisible(false)}
          >
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          </Modal>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading || uploading}>
                {activity ? '更新' : '创建'}
              </Button>
              <Button onClick={() => onClose(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AdminActivityForm;
