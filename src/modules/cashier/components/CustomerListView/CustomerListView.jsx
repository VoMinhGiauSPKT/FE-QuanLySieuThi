import { useState, useEffect } from 'react'
import { Table, Button, Card, Input, Tag, Typography } from 'antd'
import {
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../utils/formatters'
import { useCustomerStore } from '../../../../stores/customerStore'
import { useCartStore } from '../../../../stores/cartStore'
import './CustomerListView.scss'

const { Text } = Typography

export default function CustomerListView({ onOpenRegisterModal, onSelectCustomerForCart }) {
  const { customers, loading, fetchCustomers } = useCustomerStore()
  const setCustomer = useCartStore((state) => state.setCustomer)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchCustomers({ limit: 20 })
  }, [fetchCustomers])

  const handleSearch = () => {
    fetchCustomers({ keyword: keyword.trim(), limit: 20 })
  }

  const handleSelect = (record) => {
    setCustomer(record)
    if (onSelectCustomerForCart) {
      onSelectCustomerForCart(record)
    }
  }

  const safeCustomers = Array.isArray(customers) ? customers : []

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 110,
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (em) => em || <Text type="secondary">-</Text>,
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
      width: 140,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => handleSelect(record)}
        >
          Gắn Vào Đơn
        </Button>
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
        pagination={{ pageSize: 8, showTotal: (t) => `Tổng cộng ${t} hội viên` }}
      />
    </Card>
  )
}
