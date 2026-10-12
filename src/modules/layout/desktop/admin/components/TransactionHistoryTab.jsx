import { Table, Tag, Card, Select, Button, Typography, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { formatCurrency, formatDateTime } from '../../../../../utils/formatters'

const { Text } = Typography

export default function TransactionHistoryTab({
  invoices,
  loading,
  selectedStatus,
  onStatusChange,
  onRefresh,
}) {
  const safeInvoices = Array.isArray(invoices) ? invoices : []

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Khách Hàng',
      dataIndex: ['customer', 'fullName'],
      key: 'customerName',
      render: (name, rec) => (
        <div>
          <Text strong>{name || 'Khách vãng lai'}</Text>
          {rec.customer?.phoneNumber && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{rec.customer.phoneNumber}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Thu Ngân Lập',
      dataIndex: ['employee', 'fullName'],
      key: 'employeeName',
      render: (name, rec) => name || rec.employee?.username || 'Nhân viên',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'finalTotal',
      key: 'finalTotal',
      render: (total) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: 'Điểm Tích/Dùng',
      key: 'points',
      render: (_, rec) => (
        <Space direction="vertical" size={2}>
          {rec.pointsEarned > 0 && <Tag color="green">+{rec.pointsEarned} điểm</Tag>}
          {rec.pointsUsed > 0 && <Tag color="orange">-{rec.pointsUsed} điểm</Tag>}
          {!rec.pointsEarned && !rec.pointsUsed && <Text type="secondary">-</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => {
        switch (st) {
          case 'PAID':
            return <Tag color="success">Đã thanh toán</Tag>
          case 'PENDING':
            return <Tag color="warning">Chờ thanh toán</Tag>
          case 'CANCELLED':
            return <Tag color="error">Đã hủy</Tag>
          default:
            return <Tag>{st || 'N/A'}</Tag>
        }
      },
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
  ]

  return (
    <Card
      title="Lịch Sử Hóa Đơn Bán Hàng & Giao Dịch"
      extra={
        <Space>
          <Select
            placeholder="Lọc theo trạng thái"
            value={selectedStatus}
            onChange={onStatusChange}
            style={{ width: 180 }}
            allowClear
          >
            <Select.Option value="PAID">Đã thanh toán</Select.Option>
            <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            Làm Mới
          </Button>
        </Space>
      }
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Table
        columns={columns}
        dataSource={safeInvoices}
        rowKey="invoiceId"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  )
}
