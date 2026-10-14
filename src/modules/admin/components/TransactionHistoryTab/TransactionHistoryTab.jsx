import { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Card,
  Select,
  Button,
  Typography,
  Space,
  Modal,
  Descriptions,
  Divider,
  Spin,
} from 'antd'
import {
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime } from '../../../../utils/formatters'
import { useInvoiceStore } from '../../../../stores/invoiceStore'
import './TransactionHistoryTab.scss'

const { Text } = Typography

export default function TransactionHistoryTab() {
  const { invoices, loading, pagination, fetchInvoices, fetchInvoiceDetail } = useInvoiceStore()
  const [selectedStatus, setSelectedStatus] = useState(undefined)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchInvoices({ page: 1, limit: 8 })
  }, [fetchInvoices])

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    fetchInvoices({ page: 1, limit: pagination?.pageSize || 8, status })
  }

  const handleRefresh = () => {
    fetchInvoices({
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 8,
      status: selectedStatus,
    })
  }

  const handleTableChange = (pag) => {
    fetchInvoices({ page: pag.current, limit: pag.pageSize, status: selectedStatus })
  }

  // Bấm xem chi tiết: Gọi API GET /api/invoice/:id
  const handleOpenDetail = async (record) => {
    setViewingInvoice(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const detail = await fetchInvoiceDetail(record.invoiceId)
      if (detail) {
        setViewingInvoice(detail)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const safeInvoices = Array.isArray(invoices) ? invoices : []

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Khách Hàng',
      dataIndex: ['customer', 'fullName'],
      key: 'customerName',
      render: (name, rec) => (
        <div>
          <Text strong>{name || rec.customer?.fullName || 'Khách vãng lai'}</Text>
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
      title: 'Tổng Thanh Toán',
      key: 'finalAmount',
      render: (_, rec) => (
        <Text strong style={{ color: '#16a34a' }}>
          {formatCurrency(rec.finalAmount ?? rec.finalTotal ?? 0)}
        </Text>
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
    {
      title: 'Hành động',
      key: 'actions',
      width: 110,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleOpenDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  const itemColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'productName',
      key: 'productName',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      render: (q) => <Tag color="cyan">{q}</Tag>,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 130,
      render: (sub, r) => (
        <Text strong style={{ color: '#2563eb' }}>
          {formatCurrency(sub ?? (r.unitPrice * r.quantity))}
        </Text>
      ),
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
            onChange={handleStatusChange}
            style={{ width: 180 }}
            allowClear
          >
            <Select.Option value="PAID">Đã thanh toán</Select.Option>
            <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm Mới
          </Button>
        </Space>
      }
      bordered={false}
      className="transaction-history-tab"
    >
      <Table
        columns={columns}
        dataSource={safeInvoices}
        rowKey="invoiceId"
        loading={loading}
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || safeInvoices.length,
          showTotal: (total) => `Tổng cộng ${total} hóa đơn`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Xem Chi Tiết Hóa Đơn */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Hóa Đơn #{viewingInvoice?.invoiceId || ''}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setViewingInvoice(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={720}
      >
        <Spin spinning={detailLoading}>
          {viewingInvoice && (
            <div>
              <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Mã Hóa Đơn">
                  <Tag color="blue" style={{ fontWeight: 600 }}>{viewingInvoice.invoiceId}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời Gian">
                  {formatDateTime(viewingInvoice.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Khách Hàng">
                  {viewingInvoice.customer?.fullName || 'Khách vãng lai'}
                  {viewingInvoice.customer?.phoneNumber ? ` (${viewingInvoice.customer.phoneNumber})` : ''}
                </Descriptions.Item>
                <Descriptions.Item label="Thu Ngân Lập">
                  {viewingInvoice.employee?.fullName || viewingInvoice.employee?.username || 'Nhân viên'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                  <Tag color={viewingInvoice.status === 'PAID' ? 'success' : viewingInvoice.status === 'PENDING' ? 'warning' : 'error'}>
                    {viewingInvoice.status === 'PAID' ? 'Đã thanh toán' : viewingInvoice.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Thanh Toán">
                  <Text strong style={{ color: '#16a34a', fontSize: 15 }}>
                    {formatCurrency(viewingInvoice.finalAmount ?? viewingInvoice.finalTotal ?? 0)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '12px 0' }}>Danh Sách Mặt Hàng Trong Hóa Đơn</Divider>

              <Table
                dataSource={viewingInvoice.items || []}
                columns={itemColumns}
                rowKey={(r, idx) => r.invoiceDetailId || r.productId || idx}
                pagination={false}
                size="small"
              />

              {viewingInvoice.discountAmount > 0 && (
                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <Text type="secondary">Tổng tiền gốc: {formatCurrency(viewingInvoice.originalTotal)} | </Text>
                  <Text type="danger">Chiết khấu: -{formatCurrency(viewingInvoice.discountAmount)}</Text>
                </div>
              )}
            </div>
          )}
        </Spin>
      </Modal>
    </Card>
  )
}

