import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { userApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

const roleColors: Record<string, string> = {
  admin: 'red',
  member: 'blue',
  pa: 'green',
};

const roleLabels: Record<string, string> = {
  admin: '管理员',
  member: '成员',
  pa: 'PA',
};

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      message.success('用户创建成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => userApi.updateUser(id, data),
    onSuccess: () => {
      message.success('用户更新成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => {
      message.error('更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      message.success('用户删除成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => userApi.resetPassword(id, password),
    onSuccess: () => {
      message.success('密码重置成功');
      passwordForm.resetFields();
    },
    onError: () => {
      message.error('密码重置失败');
    },
  });

  const handleSubmit = async (values: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    passwordForm.resetFields();
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    passwordForm.resetFields();
    setIsModalOpen(true);
  };

  const handleResetPassword = async (values: { newPassword: string }) => {
    if (editingUser) {
      resetPasswordMutation.mutate({ id: editingUser.id, password: values.newPassword });
    }
  };

  const canResetPassword = (targetUser: User) => {
    if (!currentUser) return false;
    // 管理员可以重置任何人的密码，普通用户只能重置自己的
    return currentUser.role === 'admin' || currentUser.id === targetUser.id;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role]}>{roleLabels[role] || role}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          {currentUser?.role === 'admin' && currentUser?.id !== record.id && (
            <Popconfirm
              title="确定删除此用户？"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          currentUser?.role === 'admin' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={users || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码">
              <Input.Password placeholder="留空使用默认密码" />
            </Form.Item>
          )}
          <Form.Item name="fullName" label="姓名">
            <Input />
          </Form.Item>
          {currentUser?.role === 'admin' && (
            <Form.Item name="role" label="角色">
              <Select>
                <Select.Option value="member">成员</Select.Option>
                <Select.Option value="pa">PA</Select.Option>
                <Select.Option value="admin">管理员</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>

        {editingUser && canResetPassword(editingUser) && (
          <>
            <Divider />
            <Form form={passwordForm} layout="vertical" onFinish={handleResetPassword}>
              <Form.Item
                name="newPassword"
                label={<span><LockOutlined /> 重置密码</span>}
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password placeholder="输入新密码" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={resetPasswordMutation.isPending}
                  icon={<LockOutlined />}
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
