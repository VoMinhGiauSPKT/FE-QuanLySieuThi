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
  Modal,
  Form,
  InputNumber,
  Select,
  Descriptions,
  Spin,
} from 'antd'
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useProductStore } from '../../../../stores/productStore'
import { useCategoryStore } from '../../../../stores/categoryStore'
import './StockOverviewView.scss'

const { Text } = Typography

export default function StockOverviewView() {
  const {
    products,
    loading,
    detailLoading,
    selectedProduct,
    lowStockCount,
    fetchProducts,
    fetchProductById,
    updateProduct,
    fetchLowStockAlerts,
  } = useProductStore()

  const { categories, allCategories, fetchAllCategories } = useCategoryStore()

  const safeCategories = allCategories.length > 0 ? allCategories : categories
  const safeProducts = Array.isArray(products) ? products : []

  const [searchKeyword, setSearchKeyword] = useState('')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm] = Form.useForm()

  useEffect(() => {
    fetchProducts({ limit: 50 })
    fetchLowStockAlerts(10)
    fetchAllCategories()
  }, [fetchProducts, fetchLowStockAlerts, fetchAllCategories])

  const handleSearch = () => {
    fetchProducts({ keyword: searchKeyword.trim(), limit: 50 })
  }

  const handleRefresh = () => {
    fetchProducts({ keyword: searchKeyword.trim(), limit: 50 })
    fetchLowStockAlerts(10)
  }

  const handleOpenDetail = async (record) => {
    setIsDetailModalOpen(true)
    await fetchProductById(record.productId)
  }

  const handleOpenEdit = async (record) => {
    setIsEditModalOpen(true)
    editForm.resetFields()
    const product = await fetchProductById(record.productId)
    if (product) {
      editForm.setFieldsValue({
        productName: product.productName,
        categoryId: product.category?.categoryId || product.categoryId,
        unitPrice: product.unitPrice,
        productStatus: product.productStatus || 'ON_SALE',
      })
    }
  }

  const handleUpdateProduct = async (values) => {
    if (!selectedProduct?.productId) return
    const success = await updateProduct(selectedProduct.productId, values)
    if (success) {
      setIsEditModalOpen(false)
      fetchProducts({ keyword: searchKeyword.trim(), limit: 50 })
    }
  }

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 110,
      render: (id) => <Text code>{id ? String(id).substring(0, 10) : 'N/A'}</Text>,
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
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          >
            Chi Tiết
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>
        </Space>
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

      {/* Modal Xem Chi Tiết Sản Phẩm */}
      <Modal
        title={`Chi Tiết Sản Phẩm: ${selectedProduct?.productName || ''}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Đang tải dữ liệu chi tiết..." />
          </div>
        ) : selectedProduct ? (
          <Descriptions bordered column={1} size="middle" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Mã Sản Phẩm">
              <Text code>{selectedProduct.productId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên Sản Phẩm">
              <Text strong>{selectedProduct.productName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngành Hàng / Danh Mục">
              <Tag color="blue">
                {selectedProduct.category?.categoryName || selectedProduct.categoryName || 'Sản phẩm'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn Giá Bán Lẻ">
              <Text strong style={{ color: '#2563eb', fontSize: 16 }}>
                {formatCurrency(selectedProduct.unitPrice)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số Lượng Tồn Kho">
              <Tag
                color={selectedProduct.stockQuantity <= 10 ? 'red' : 'green'}
                style={{ fontSize: 14, padding: '2px 8px' }}
              >
                {selectedProduct.stockQuantity} đơn vị
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hạn Sử Dụng (HSD)">
              {formatDate(selectedProduct.expirationDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái Kinh Doanh">
              <Tag color={selectedProduct.productStatus === 'ON_SALE' ? 'cyan' : 'default'}>
                {selectedProduct.productStatus === 'ON_SALE' ? 'Đang kinh doanh' : 'Ngừng bán'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      {/* Modal Chỉnh Sửa Sản Phẩm */}
      <Modal
        title="Chỉnh Sửa Thông Tin Sản Phẩm"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          <Form form={editForm} layout="vertical" onFinish={handleUpdateProduct}>
            <Form.Item
              name="productName"
              label="Tên Sản Phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Tên sản phẩm" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Ngành Hàng / Phân Loại"
              rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
            >
              <Select placeholder="Chọn loại sản phẩm">
                {safeCategories.map((cat) => (
                  <Select.Option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="Đơn Giá Bán Lẻ (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={500}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="productStatus"
              label="Trạng Thái Kinh Doanh"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="ON_SALE">Đang kinh doanh</Select.Option>
                <Select.Option value="DISCONTINUED">Ngừng bán</Select.Option>
              </Select>
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  Lưu Thay Đổi
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}
