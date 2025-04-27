//创建活动积分规则模型组件
import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message } from 'antd';
import { createPointRule, updatePointRule } from '../../services/pointRuleService';

const { TextArea } = Input;
const { Option } = Select;

const PointRuleForm = ({ onSuccess, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialValues;

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 确保活动类型与后端模型一致
  const activityTypes = [
    { label: '志愿者活动', value: 'volunteer' },
    { label: '学术活动', value: 'academic' },
    { label: '文体活动', value: 'sports' },
    { label: '艺术活动', value: 'art' },
    { label: '其他活动', value: 'other' }
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // 确保提交的数据格式正确
      const submitData = {
        ...values,
        basePoints: Number(values.basePoints),
        bonusPoints: Number(values.bonusPoints)
      };

      if (isEditing) {
        await updatePointRule(initialValues._id, submitData);
        message.success('更新积分规则成功');
      } else {
        await createPointRule(submitData);
        message.success('创建积分规则成功');
      }
      onSuccess?.();
    } catch (error) {
      message.error(error.message || (isEditing ? '更新积分规则失败' : '创建积分规则失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ 
        status: 'active',
        basePoints: 0,
        bonusPoints: 0,
        ...initialValues 
      }}
    >
      <Form.Item
        name="ruleName"
        label="规则名称"
        rules={[
          { required: true, message: '请输入规则名称' },
          { max: 50, message: '规则名称不能超过50个字符' }
        ]}
      >
        <Input placeholder="请输入规则名称" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="activityType"
        label="活动类型"
        rules={[{ required: true, message: '请选择活动类型' }]}
      >
        <Select placeholder="请选择活动类型">
          {activityTypes.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="basePoints"
        label="基础积分"
        rules={[
          { required: true, message: '请输入基础积分' },
          { type: 'number', min: 0, message: '基础积分不能小于0' }
        ]}
      >
        <InputNumber
          min={0}
          placeholder="请输入基础积分"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="bonusPoints"
        label="奖励积分"
        rules={[
          { required: true, message: '请输入奖励积分' },
          { type: 'number', min: 0, message: '奖励积分不能小于0' }
        ]}
      >
        <InputNumber
          min={0}
          placeholder="请输入奖励积分"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="规则描述"
        rules={[
          { required: true, message: '请输入规则描述' },
          { max: 500, message: '规则描述不能超过500个字符' }
        ]}
      >
        <TextArea 
          rows={4} 
          placeholder="请详细描述积分规则"
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select>
          <Option value="active">启用</Option>
          <Option value="inactive">禁用</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? '更新' : '创建'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default PointRuleForm;