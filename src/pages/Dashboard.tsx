import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Spin } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import { taskApi } from '../api/services';

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

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: taskApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: any) => (
        <a href={record.ticketUrl} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priority}</Tag>
      ),
    },
    {
      title: '创建日期',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats?.total || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="完成率"
              value={stats?.completionRate || 0}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
            <Progress percent={stats?.completionRate || 0} showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats?.byStatus?.in_progress || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待分配"
              value={stats?.byStatus?.pending || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="按状态分布">
            <Row gutter={[8, 8]}>
              {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                <Col span={12} key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
                    <span style={{ fontWeight: 'bold' }}>{count as number}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="按负责人分布">
            {stats?.byAssignee?.slice(0, 6).map((item: any) => (
              <div key={item.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{item.fullName || item.username}</span>
                <Tag color="blue">{item.count} 个任务</Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="最近任务" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={stats?.recentTasks || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
