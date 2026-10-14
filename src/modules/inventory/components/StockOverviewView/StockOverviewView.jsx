import { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Typography,
} from 'antd'
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useProductStore } from '../../../../stores/productStore'
import './StockOverviewView.scss'

const { Text } = Typography

export default function StockOverviewView() {
  const { products, loading, lowStockCount, fetchProducts, fetchLowStockAlerts } = useProductStore()
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchProducts({ limit: 50 })
    fetchLowStockAlerts(10)
  }, [fetchProducts, fetchLowStockAlerts])

  const handleSearch = () => {
    fetchProducts({ keyword: searchKeyword.trim(), limit: 50 })
  }

  const handleRefresh = () => {
    fetchProducts({ keyword: searchKeyword.trim(), limit: 50 })
    fetchLowStockAlerts(10)
  }

  const safeProducts = Array.isArray(products) ? products : []

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 110,
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
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat, rec) => (
        <Tag color="blue">{cat || rec.category?.categoryName || 'Sản phẩm'}</Tag>
      ),
    },
    {
      title: 'Tồn Kho Hiện Tại',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty) => (
        <Tag color={qty <= 10 ? 'red' : 'green'} style={{ fontWeight: 600 }}>
          {qty} đơn vị {qty <= 10 && '(Sắp hết)'}
        </Tag>
      ),
    },
    {
      title: 'Giá Bán Lẻ',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Hạn Sử Dụng (HSD)',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (d) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <span>{formatDate(d)}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'productStatus',
      key: 'productStatus',
      render: (st) => (
        <Tag color={st === 'ON_SALE' ? 'cyan' : 'default'}>
          {st === 'ON_SALE' ? 'Đang kinh doanh' : 'Ngừng bán'}
        </Tag>
      ),
    },
  ]

  return (
    <div className="stock-overview-view">
      {/* Thẻ chỉ số kho */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stock-overview-view__stat-card stock-overview-view__stat-card--blue">
            <Statistic
              title={<Text type="secondary">Tổng Mặt Hàng Quản Lý</Text>}
              value={safeProducts.length}
              suffix="Sản phẩm"
              prefix={<InboxOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} className="stock-overview-view__stat-card stock-overview-view__stat-card--red">
            <Statistic
              title={<Text type="secondary">Hàng Sắp Hết (Tồn Kho &le; 10)</Text>}
              value={lowStockCount}
              valueStyle={{ color: '#cf1322' }}
              suffix="Mặt hàng"
              prefix={<WarningOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} className="stock-overview-view__stat-card stock-overview-view__stat-card--green">
            <Statistic
              title={<Text type="secondary">Tình Trạng Kho Hàng</Text>}
              value="Đang hoạt động tốt"
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Danh sách sản phẩm trong kho */}
      <Card
        title="Danh Mục Sản Phẩm & Tồn Kho Chi Tiết"
        extra={
          <Space>
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 260 }}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>
              Tìm Kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm Mới
            </Button>
          </Space>
        }
        bordered={false}
        className="stock-overview-view__table-card"
      >
        <Table
          columns={columns}
          dataSource={safeProducts}
          rowKey="productId"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  )
}
