import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Alert,
  Statistic,
} from 'antd'
import {
  WarningOutlined,
  PlusOutlined,
  InboxOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import DefaultLayout from '../../common/DefaultLayout'

const { Title, Text } = Typography

export default function InventoryDesktop({ user, inventoryItems, lowStockItems, onNewImport }) {
  const inventoryColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Danh Mục',
      dataIndex: ['category', 'categoryName'],
      key: 'categoryName',
      render: (cat) => <Tag color="blue">{cat || 'Khác'}</Tag>,
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty) => (
        <Tag color={qty <= 10 ? 'red' : 'green'} style={{ fontWeight: 600 }}>
          {qty} đơn vị
        </Tag>
      ),
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#888' }} />
          <span>{date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'productStatus',
      key: 'productStatus',
      render: (status) => (
        <Tag color={status === 'ON_SALE' ? 'cyan' : 'default'}>
          {status === 'ON_SALE' ? 'Đang kinh doanh' : 'Ngừng bán'}
        </Tag>
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          📦 Quản Lý Kho Hàng & Nhập Xuất (Inventory)
        </Title>
        <Text type="secondary">
          Quản lý kho phụ trách: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      {/* Cảnh báo các mặt hàng sắp hết tồn kho */}
      {lowStockItems.length > 0 && (
        <Alert
          message={
            <Space>
              <WarningOutlined style={{ color: '#faad14' }} />
              <strong>Cảnh báo: Có {lowStockItems.length} mặt hàng sắp hết tồn kho (Dưới ngưỡng 10 đơn vị)</strong>
            </Space>
          }
          description="Vui lòng kiểm tra danh sách bên dưới và tạo phiếu nhập hàng mới gửi chủ cửa hàng."
          type="warning"
          showIcon={false}
          style={{ marginBottom: 24, borderRadius: 10 }}
        />
      )}

      {/* Thống kê nhanh chỉ số kho */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Tổng Số Mặt Hàng Trong Kho"
              value={inventoryItems.length}
              suffix="Sản phẩm"
              prefix={<InboxOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Mặt Hàng Cận Tồn Kho (<= 10)"
              value={lowStockItems.length}
              suffix="Mặt hàng"
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Trạng Thái Kho"
              value="Ổn định"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách hàng hóa */}
      <Card
        title="Danh Sách Tồn Kho & Hạn Dùng Sản Phẩm"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewImport}>
            Tạo Phiếu Nhập Hàng
          </Button>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          columns={inventoryColumns}
          dataSource={inventoryItems}
          rowKey="productId"
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </DefaultLayout>
  )
}
