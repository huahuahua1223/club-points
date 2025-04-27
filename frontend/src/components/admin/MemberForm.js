import React from 'react';
import { Form, Input, Button, message } from 'antd';

const MemberForm = ({ initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await onSave(values);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || '保存失败');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="username"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item
        name="studentId"
        label="学号"
        rules={[{ required: true, message: '请输入学号' }]}
      >
        <Input placeholder="请输入学号" />
      </Form.Item>

      <Form.Item
        name="college"
        label="专业"
        rules={[{ required: true, message: '请输入专业' }]}
      >
        <Input placeholder="请输入专业" />
      </Form.Item>

      <Form.Item
        name="class"
        label="班级"
        rules={[{ required: true, message: '请输入班级' }]}
      >
        <Input placeholder="请输入班级" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="联系电话"
        rules={[
          { required: true, message: '请输入联系电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
        ]}
      >
        <Input placeholder="请输入联系电话" />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      {!initialValues && (
        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能小于6位' }
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
      )}

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? '保存修改' : '添加成员'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default MemberForm;