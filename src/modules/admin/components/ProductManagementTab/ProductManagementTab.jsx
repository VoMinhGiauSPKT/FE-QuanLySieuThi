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
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useProductStore } from '../../../../stores/productStore'
import { useCategoryStore } from '../../../../stores/categoryStore'
import './ProductManagementTab.scss'

const { Text } = Typography

export default function ProductManagementTab() {
  const { products, loading, pagination, fetchProducts, updateProduct } = useProductStore()
  const { categories, allCategories, fetchAllCategories } = useCategoryStore()

  const safeCategories = allCategories.length > 0 ? allCategories : categories
  const safeProducts = Array.isArray(products) ? products : []

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm] = Form.useForm()

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState(undefined)
  const [categoryId, setCategoryId] = useState(undefined)
  const [onlyLowStock, setOnlyLowStock] = useState(false)

  useEffect(() => {
    fetchProducts({ page: 1, limit: 8 })
    fetchAllCategories()
  }, [fetchProducts, fetchAllCategories])

  const handleApplyFilter = () => {
    fetchProducts({
      page: 1,
      limit: pagination?.pageSize || 8,
      keyword: keyword.trim(),
      categoryId,
      productStatus: status,
      isLowStock: onlyLowStock,
    })
  }

  const handleResetFilter = () => {
    setKeyword('')
    setStatus(undefined)
    setCategoryId(undefined)
    setOnlyLowStock(false)
    fetchProducts({ page: 1, limit: pagination?.pageSize || 8 })
  }

  const handleTableChange = (pag) => {
    fetchProducts({
      page: pag.current,
      limit: pag.pageSize,
      keyword: keyword.trim(),
      categoryId,
      productStatus: status,
      isLowStock: onlyLowStock,
    })
  }

  const handleOpenEdit = (record) => {
    setEditingProduct(record)
    editForm.setFieldsValue({
      productName: record.productName,
      unitPrice: record.unitPrice,
      productStatus: record.productStatus,
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (values) => {
    if (!editingProduct?.productId) return
    const ok = await updateProduct(editingProduct.productId, values)
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingProduct(null)
      fetchProducts({ page: pagination?.current || 1, limit: pagination?.pageSize || 8 })
    }
  }

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'productName',
      key: 'productName',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Ngành Hàng',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (c, r) => <Tag color="blue">{c || r.category?.categoryName || 'Sản phẩm'}</Tag>,
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (q) => (
        <Tag color={q <= 10 ? 'red' : 'green'} style={{ fontWeight: 600 }}>
          {q <= 10 && <WarningOutlined />} {q} đơn vị
        </Tag>
      ),
    },
    {
      title: 'Giá Bán',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (p) => formatCurrency(p),
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
        <Tag color={st === 'ON_SALE' ? 'cyan' : 'default'}>
          {st === 'ON_SALE' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
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
    <Card title="Quản Lý Danh Sách Mặt Hàng" bordered={false} className="product-management-tab">
      <div className="product-management-tab__filters">
        <Input
          placeholder="Tìm tên mặt hàng..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleApplyFilter}
          style={{ width: 220 }}
          allowClear
        />

        <Select
          placeholder="Lọc theo ngành hàng"
          value={categoryId}
          onChange={setCategoryId}
          style={{ width: 180 }}
          allowClear
        >
          {safeCategories.map((c) => (
            <Select.Option key={c.categoryId} value={c.categoryId}>
              {c.categoryName}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Trạng thái"
          value={status}
          onChange={setStatus}
          style={{ width: 140 }}
          allowClear
        >
          <Select.Option value="ON_SALE">Đang bán</Select.Option>
          <Select.Option value="DISCONTINUED">Ngừng bán</Select.Option>
        </Select>

        <Select
          value={onlyLowStock}
          onChange={setOnlyLowStock}
          style={{ width: 160 }}
        >
          <Select.Option value={false}>Tất cả số lượng</Select.Option>
          <Select.Option value={true}>Chỉ hàng sắp hết (&le;10)</Select.Option>
        </Select>

        <Button type="primary" onClick={handleApplyFilter}>
          Lọc
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
          Đặt Lại
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={safeProducts}
        rowKey="productId"
        loading={loading}
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || safeProducts.length,
          showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Chỉnh Sửa Sản Phẩm */}
      <Modal
        title={`Cập Nhật Mặt Hàng: ${editingProduct?.productName || ''}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="productName"
            label="Tên Mặt Hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên mặt hàng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Giá Bán Lẻ (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <InputNumber min={0} step={500} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="productStatus" label="Trạng Thái Kinh Doanh">
            <Select>
              <Select.Option value="ON_SALE">Đang kinh doanh (ON_SALE)</Select.Option>
              <Select.Option value="DISCONTINUED">Ngừng kinh doanh (DISCONTINUED)</Select.Option>
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
      </Modal>
    </Card>
  )
}
