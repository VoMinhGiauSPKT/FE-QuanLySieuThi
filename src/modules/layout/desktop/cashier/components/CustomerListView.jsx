import { useState, useEffect } from 'react'
import { Table, Button, Card, Input, Tag, Typography } from 'antd'
import {
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../../utils/formatters'
import { useCustomerStore } from '../../../../../stores/customerStore'

const { Text } = Typography

export default function CustomerListView({
  customers: propCustomers,
  loading: propLoading,
  searchKeyword: propSearchKeyword,
  onSearchChange,
  onSearch,
  onOpenRegisterModal,
  onSelectCustomerForCart,
  onRefresh,
}) {
  const store = useCustomerStore()

  const customers = propCustomers ?? store.customers
  const loading = propLoading ?? store.loading
  const [internalKeyword, setInternalKeyword] = useState('')
  const searchKeyword = propSearchKeyword !== undefined ? propSearchKeyword : internalKeyword

  useEffect(() => {
    if (!propCustomers) {
      store.fetchCustomers({ limit: 20 })
    }
  }, [propCustomers])

  const handleSearchChange = (val) => {
    if (onSearchChange) {
      onSearchChange(val)
    } else {
      setInternalKeyword(val)
    }
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch()
    } else {
      store.fetchCustomers({ keyword: searchKeyword, limit: 20 })
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      store.fetchCustomers({ keyword: searchKeyword, limit: 20 })
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
          onClick={() => onSelectCustomerForCart(record)}
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
          onClick={onOpenRegisterModal}
          style={{ borderRadius: 8 }}
        >
          Đăng Ký Hội Viên Mới
        </Button>
      }
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => handleSearchChange(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>
          Tìm Kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Làm Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={safeCustomers}
        rowKey="customerId"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  )
}
