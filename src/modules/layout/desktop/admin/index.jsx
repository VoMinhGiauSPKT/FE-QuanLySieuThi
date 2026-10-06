import { Card, Row, Col, Typography, Statistic, Table, Tag, Button, Space, Tabs } from 'antd'
import {
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  AlertOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import DefaultLayout from '../../common/DefaultLayout'
import { getRoleTagColor } from '../../../../utils/roleHelper'

const { Title, Text } = Typography

export default function AdminDesktop({ user, employeeList, onAddEmployee }) {
  const employeeColumns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (u) => <Text strong>{u}</Text>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      render: (pos) => (
        <Tag color={getRoleTagColor(pos)} style={{ fontWeight: 500 }}>
          {pos}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'success' : 'error'}>
          {status ? 'Đang làm việc' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng Quan Hoạt Động',
      children: (
        <div>
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #52c41a' }}>
                <Statistic
                  title="Doanh Thu Hôm Nay"
                  value={18650000}
                  precision={0}
                  suffix="VNĐ"
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #1890ff' }}>
                <Statistic
                  title="Hóa Đơn Bán Hàng"
                  value={142}
                  suffix="Đơn"
                  prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #faad14' }}>
                <Statistic
                  title="Cảnh Báo Hết Hàng"
                  value={8}
                  suffix="Mặt hàng"
                  prefix={<AlertOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #722ed1' }}>
                <Statistic
                  title="Nhân Sự Đang Trực"
                  value={12}
                  suffix="Người"
                  prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Truy Cập Nhanh Các Phân Hệ Nghiệp Vụ" style={{ borderRadius: 12 }}>
            <Space orientation="horizontal" size="large" wrap>
              <Link to="/cashier">
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Mở Quầy Thu Ngân (Bán Hàng)
                </Button>
              </Link>
              <Link to="/inventory">
                <Button
                  type="primary"
                  icon={<InboxOutlined />}
                  size="large"
                  style={{ backgroundColor: '#1890ff' }}
                >
                  Mở Phân Hệ Quản Lý Kho
                </Button>
              </Link>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'employees',
      label: 'Quản Lý Nhân Viên Siêu Thị',
      children: (
        <Card
          title="Danh Sách Nhân Viên Hệ Thống"
          extra={
            <Button type="primary" icon={<UserAddOutlined />} onClick={onAddEmployee}>
              Thêm Nhân Viên
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            columns={employeeColumns}
            dataSource={employeeList}
            rowKey="employeeId"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          👑 Bảng Điều Khiển Quản Trị (Store Owner)
        </Title>
        <Text type="secondary">
          Xin chào <strong>{user?.fullName}</strong>! Giám sát toàn diện doanh thu, nhân sự và chuỗi cung ứng siêu thị.
        </Text>
      </div>

      <Tabs defaultActiveKey="overview" items={tabItems} size="large" />
    </DefaultLayout>
  )
}
