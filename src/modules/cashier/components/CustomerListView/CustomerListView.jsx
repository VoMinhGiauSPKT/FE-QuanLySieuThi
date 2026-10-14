import { useState, useEffect } from 'react'
import { Table, Button, Card, Input, Tag, Typography, Modal, Space, Spin } from 'antd'
import {
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  TrophyOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { formatDateTime, formatCurrency } from '../../../../utils/formatters'
import { useCustomerStore } from '../../../../stores/customerStore'
import { useCartStore } from '../../../../stores/cartStore'
import './CustomerListView.scss'

const { Text } = Typography

export default function CustomerListView({ onOpenRegisterModal, onSelectCustomerForCart }) {
  const {
    customers,
    loading,
    pagination,
    fetchCustomers,
    fetchCustomerInvoices,
  } = useCustomerStore()
  const setCustomer = useCartStore((state) => state.setCustomer)
  const [keyword, setKeyword] = useState('')

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyCustomer, setHistoryCustomer] = useState(null)
  const [customerInvoices, setCustomerInvoices] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchCustomers({ page: 1, limit: 8 })
  }, [fetchCustomers])

  const handleSearch = () => {
    fetchCustomers({ keyword: keyword.trim(), page: 1, limit: pagination?.pageSize || 8 })
  }

  const handleTableChange = (pag) => {
    fetchCustomers({ keyword: keyword.trim(), page: pag.current, limit: pag.pageSize })
  }

  const handleSelect = (record) => {
    setCustomer(record)
    if (onSelectCustomerForCart) {
      onSelectCustomerForCart(record)
    }
  }

  // Bấm xem lịch sử hóa đơn mua hàng của khách
  const handleOpenHistory = async (record) => {
    setHistoryCustomer(record)
    setIsHistoryModalOpen(true)
    setHistoryLoading(true)
    try {
      const list = await fetchCustomerInvoices(record.customerId)
      setCustomerInvoices(list || [])
    } finally {
      setHistoryLoading(false)
    }
  }

  const safeCustomers = Array.isArray(customers) ? customers : []

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 110,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => <Tag color="blue">{phone}</Tag>,
    },
    {
      title: 'Điểm Tích Lũy',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points) => (
        <Tag color="gold" style={{ fontWeight: 600, fontSize: 13 }}>
          <TrophyOutlined /> {points || 0} điểm
        </Tag>
      ),
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<HistoryOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenHistory(record)}
            title="Lịch sử mua sắm"
          >
            Lịch Sử Đơn
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleSelect(record)}
          >
            Gắn Vào Đơn
          </Button>
        </Space>
      ),
    },
  ]

  const historyColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      width: 110,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thu Ngân',
      dataIndex: ['employee', 'fullName'],
      key: 'cashier',
      render: (n) => n || 'Thu ngân',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'finalTotal',
      key: 'finalTotal',
      render: (val, r) => (
        <Text strong style={{ color: '#16a34a' }}>
          {formatCurrency(val ?? r.finalAmount ?? 0)}
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <Tag color={st === 'PAID' ? 'success' : st === 'PENDING' ? 'warning' : 'error'}>
          {st === 'PAID' ? 'Đã thanh toán' : st === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
        </Tag>
      ),
    },
  ]

  return (
    <Card
      title="Danh Sách Hội Viên Thân Thiết"
      extra={
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => onOpenRegisterModal && onOpenRegisterModal()}
          style={{ borderRadius: 8 }}
        >
          Đăng Ký Hội Viên Mới
        </Button>
      }
      bordered={false}
      className="customer-list-view"
    >
      <div className="customer-list-view__search-bar">
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          className="search-input"
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm Kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => fetchCustomers({ limit: 20 })}>
          Làm Mới
        </Button>
      </div>

      <Table
        dataSource={safeCustomers}
        columns={columns}
        rowKey="customerId"
        loading={loading}
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || safeCustomers.length,
          showTotal: (t) => `Tổng cộng ${t} hội viên`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Lịch Sử Đơn Hàng Của Khách */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#1890ff' }} />
            <span>Lịch Sử Mua Hàng: {historyCustomer?.fullName || ''} ({historyCustomer?.phoneNumber || ''})</span>
          </Space>
        }
        open={isHistoryModalOpen}
        onCancel={() => {
          setIsHistoryModalOpen(false)
          setHistoryCustomer(null)
          setCustomerInvoices([])
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsHistoryModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <Spin spinning={historyLoading}>
          <Table
            dataSource={customerInvoices}
            columns={historyColumns}
            rowKey="invoiceId"
            pagination={{ pageSize: 5 }}
            size="small"
            style={{ marginTop: 12 }}
          />
        </Spin>
      </Modal>
    </Card>
  )
}

