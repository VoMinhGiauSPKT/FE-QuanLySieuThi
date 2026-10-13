import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Card,
  Modal,
  Form,
  InputNumber,
  Typography,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDate } from '../../../../../utils/formatters'
import { useProductStore } from '../../../../../stores/productStore'
import { useCategoryStore } from '../../../../../stores/categoryStore'

const { Text } = Typography

export default function ProductManagementTab({
  products: propProducts,
  loading: propLoading,
  pagination: propPagination,
  onTableChange,
  onSearch,
  onUpdateProduct,
  onRefresh,
  categories: propCategories,
}) {
  const productStore = useProductStore()
  const categoryStore = useCategoryStore()

  const products = propProducts ?? productStore.products
  const loading = propLoading ?? productStore.loading
  const pagination = propPagination ?? productStore.pagination
  const categories = propCategories && propCategories.length > 0 
    ? propCategories 
    : (categoryStore.allCategories.length > 0 ? categoryStore.allCategories : categoryStore.categories)

  const safeProducts = Array.isArray(products) ? products : []

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm] = Form.useForm()

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState(undefined)
  const [categoryId, setCategoryId] = useState(undefined)
  const [onlyLowStock, setOnlyLowStock] = useState(false)

  useEffect(() => {
    if (!propProducts) {
      productStore.fetchProducts(1, 8, {})
    }
    if (!propCategories || propCategories.length === 0) {
      categoryStore.fetchAllCategories()
    }
  }, [propProducts, propCategories])

  const handleApplyFilter = () => {
    const filters = {
      keyword,
      categoryId,
      productStatus: status,
      isLowStock: onlyLowStock,
    }
    if (onSearch) {
      onSearch(filters)
    } else {
      productStore.fetchProducts(1, pagination?.pageSize || 8, filters)
    }
  }

  const handleResetFilter = () => {
    setKeyword('')
    setStatus(undefined)
    setCategoryId(undefined)
    setOnlyLowStock(false)
    if (onRefresh) {
      onRefresh()
    } else if (onSearch) {
      onSearch({})
    } else {
      productStore.fetchProducts(1, pagination?.pageSize || 8, {})
    }
  }

  const handleTableChange = (pag) => {
    if (onTableChange) {
      onTableChange(pag)
    } else {
      productStore.fetchProducts(pag.current, pag.pageSize, {
        keyword,
        categoryId,
        productStatus: status,
        isLowStock: onlyLowStock,
      })
    }
  }

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod)
    editForm.setFieldsValue({
      productName: prod.productName,
      categoryId: prod.category?.categoryId || prod.categoryId,
      unitPrice: prod.unitPrice,
      productStatus: prod.productStatus,
    })
    setIsEditModalOpen(true)
  }

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
      render: (cat, record) => (
        <Tag color="cyan">{cat || record.category?.categoryName || 'Khác'}</Tag>
      ),
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty) => (
        <Tag color={qty <= 10 ? 'red' : 'green'} style={{ fontWeight: 600 }}>
          {qty} {qty <= 10 && <WarningOutlined style={{ marginLeft: 4 }} />}
        </Tag>
      ),
    },
    {
      title: 'Giá Bán',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (p) => <Text strong style={{ color: '#1890ff' }}>{formatCurrency(p)}</Text>,
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (d) => formatDate(d),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'productStatus',
      key: 'productStatus',
      render: (st) => (
        <Tag color={st === 'ON_SALE' ? 'processing' : 'default'}>
          {st === 'ON_SALE' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleOpenEdit(record)}
        >
          Sửa
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Danh Mục Sản Phẩm & Trạng Thái Kinh Doanh"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleApplyFilter}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="Tất cả loại sản phẩm"
            value={categoryId}
            onChange={setCategoryId}
            style={{ width: 180 }}
            allowClear
          >
            {categories.map((c) => (
              <Select.Option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái kinh doanh"
            value={status}
            onChange={setStatus}
            style={{ width: 170 }}
            allowClear
          >
            <Select.Option value="ON_SALE">Đang kinh doanh</Select.Option>
            <Select.Option value="DISCONTINUED">Ngừng kinh doanh</Select.Option>
          </Select>
          <Button
            type={onlyLowStock ? 'primary' : 'default'}
            danger={onlyLowStock}
            icon={<WarningOutlined />}
            onClick={() => setOnlyLowStock(!onlyLowStock)}
          >
            {onlyLowStock ? 'Đang lọc hàng sắp hết' : 'Chỉ xem hàng sắp hết (<=10)'}
          </Button>
          <Button type="primary" onClick={handleApplyFilter}>
            Tìm Kiếm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
            Làm Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={safeProducts}
          rowKey="productId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal cập nhật sản phẩm */}
      <Modal
        title="Cập Nhật Thông Tin Sản Phẩm"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (editingProduct) {
              const ok = onUpdateProduct
                ? await onUpdateProduct(editingProduct.productId, values)
                : await productStore.updateProduct(editingProduct.productId, values)
              if (ok) {
                setIsEditModalOpen(false)
              }
            }
          }}
        >
          <Form.Item
            name="productName"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Loại sản phẩm (Danh mục)"
            rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }]}
          >
            <Select placeholder="Chọn loại sản phẩm">
              {categories.map((c) => (
                <Select.Option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName} ({c.categoryId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Đơn giá bán lẻ (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập đơn giá bán!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              min={1000}
              step={1000}
            />
          </Form.Item>

          <Form.Item name="productStatus" label="Trạng thái kinh doanh">
            <Select>
              <Select.Option value="ON_SALE">Đang kinh doanh (Bán tại quầy)</Select.Option>
              <Select.Option value="DISCONTINUED">Ngừng kinh doanh</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu Thay Đổi
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
