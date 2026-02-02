import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Card, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { taskApi, userApi } from '../api/services';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import dayjs from 'dayjs';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
};

const statusLabels: Record<string, string> = {
  pending: '待分配',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

const priorityColors: Record<string, string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export default function Tasks() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getTasks,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('任务创建成功');
      handleCloseModal();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) => taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('任务更新成功');
      handleCloseModal();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      message.success('任务删除成功');
    },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeIds: task.assignees?.map((a: any) => a.id) || [],
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      ticketUrl: task.ticketUrl,
      notes: task.notes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      dueDate: values.dueDate ? dayjs(values.dueDate).format('YYYY-MM-DD') : undefined,
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data as CreateTaskRequest);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Task) => (
        <Space>
          <span>{title}</span>
          {record.ticketUrl && (
            <a href={record.ticketUrl} target="_blank" rel="noopener noreferrer">
              <LinkOutlined />
            </a>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: Object.entries(statusLabels).map(([value, text]) => ({ text, value })),
      onFilter: (value: any, record: Task) => record.status === value,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      filters: Object.entries(priorityLabels).map(([value, text]) => ({ text, value })),
      onFilter: (value: any, record: Task) => record.priority === value,
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priorityLabels[priority] || priority}</Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
      render: (creator: any) => creator?.fullName || creator?.username || '-',
    },
    {
      title: '负责人',
      dataIndex: 'assignees',
      key: 'assignees',
      width: 150,
      render: (assignees: any[]) => (
        <Space size={[0, 4]} wrap>
          {assignees?.slice(0, 2).map((user) => (
            <Tag key={user.id}>{user.fullName || user.username}</Tag>
          ))}
          {assignees?.length > 2 && <Tag>+{assignees.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: '创建日期',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Task) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此任务？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="任务管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="输入任务标题" />
          </Form.Item>

          <Form.Item label="任务描述" name="description">
            <Input.TextArea rows={3} placeholder="输入任务描述" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item label="状态" name="status" initialValue="pending" style={{ width: 200 }}>
              <Select>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="优先级" name="priority" initialValue="medium" style={{ width: 200 }}>
              <Select>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item label="负责人" name="assigneeIds">
            <Select mode="multiple" placeholder="选择负责人" allowClear>
              {users?.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullName || user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item label="截止日期" name="dueDate" style={{ width: 200 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="工单链接" name="ticketUrl" style={{ flex: 1 }}>
              <Input placeholder="输入工单链接" />
            </Form.Item>
          </Space>

          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={2} placeholder="输入备注" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal}>取消</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingTask ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
