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
  Descriptions,
  Spin,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  WarningOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useProductStore } from '../../../../stores/productStore'
import { useCategoryStore } from '../../../../stores/categoryStore'
import './ProductManagementTab.scss'

const { Text } = Typography

export default function ProductManagementTab() {
  const {
    products,
    loading,
    detailLoading,
    pagination,
    fetchProducts,
    fetchProductById,
    updateProduct,
  } = useProductStore()
  const { categories, allCategories, fetchAllCategories } = useCategoryStore()

  const safeCategories = allCategories.length > 0 ? allCategories : categories
  const safeProducts = Array.isArray(products) ? products : []

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm] = Form.useForm()

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState(null)

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState(undefined)
  const [categoryId, setCategoryId] = useState(undefined)
  const [onlyLowStock, setOnlyLowStock] = useState(false)

  useEffect(() => {
    fetchProducts(1, 8, {})
    fetchAllCategories()
  }, [fetchProducts, fetchAllCategories])

  const handleApplyFilter = () => {
    fetchProducts(1, pagination?.pageSize || 8, {
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
    fetchProducts(1, pagination?.pageSize || 8, {})
  }

  const handleTableChange = (pag) => {
    fetchProducts(pag.current, pag.pageSize, {
      keyword: keyword.trim(),
      categoryId,
      productStatus: status,
      isLowStock: onlyLowStock,
    })
  }

  // Bấm nút Sửa: Gọi API lấy chi tiết rồi fill dữ liệu vào form
  const handleOpenEdit = async (record) => {
    setEditingProduct(record)
    setIsEditModalOpen(true)
    const detail = await fetchProductById(record.productId)
    const prodData = detail || record
    setEditingProduct(prodData)
    editForm.setFieldsValue({
      productName: prodData.productName,
      categoryId: prodData.category?.categoryId || prodData.categoryId,
      unitPrice: prodData.unitPrice,
      productStatus: prodData.productStatus || 'ON_SALE',
    })
  }

  const handleEditSubmit = async (values) => {
    if (!editingProduct?.productId) return
    const payload = {
      productName: values.productName,
      categoryId: values.categoryId,
      unitPrice: Number(values.unitPrice),
      productStatus: values.productStatus,
    }
    const ok = await updateProduct(editingProduct.productId, payload)
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingProduct(null)
      fetchProducts(pagination?.current || 1, pagination?.pageSize || 8, {})
    }
  }

  // Bấm nút Xem chi tiết: Gọi API lấy chi tiết
  const handleOpenDetail = async (record) => {
    setViewingProduct(record)
    setIsDetailModalOpen(true)
    const detail = await fetchProductById(record.productId)
    if (detail) {
      setViewingProduct(detail)
    }
  }

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 110,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
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
      render: (c, r) => <Tag color="cyan">{c || r.category?.categoryName || 'Sản phẩm'}</Tag>,
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
        <Tag color={st === 'ON_SALE' ? 'green' : 'default'}>
          {st === 'ON_SALE' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleOpenDetail(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEdit(record)}
            title="Sửa mặt hàng"
          />
        </Space>
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
            name="categoryId"
            label="Ngành Hàng / Loại Sản Phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }]}
          >
            <Select placeholder="Chọn ngành hàng">
              {safeCategories.map((c) => (
                <Select.Option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </Select.Option>
              ))}
            </Select>
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
              <Select.Option value="ON_SALE">Đang bán (ON_SALE)</Select.Option>
              <Select.Option value="DISCONTINUED">Ngừng bán (DISCONTINUED)</Select.Option>
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

      {/* Modal Xem Chi Tiết Sản Phẩm */}
      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Mặt Hàng: {viewingProduct?.productName || ''}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setViewingProduct(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={580}
      >
        <Spin spinning={detailLoading}>
          {viewingProduct && (
            <Descriptions bordered column={1} size="middle" style={{ marginTop: 12 }}>
              <Descriptions.Item label="Mã Sản Phẩm">
                <Tag color="blue" style={{ fontWeight: 600 }}>{viewingProduct.productId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên Mặt Hàng">
                <Text strong>{viewingProduct.productName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngành Hàng">
                <Tag color="cyan">
                  {viewingProduct.category?.categoryName || viewingProduct.categoryName || 'Sản phẩm'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá Bán Lẻ">
                <Text strong style={{ color: '#2563eb', fontSize: 16 }}>
                  {formatCurrency(viewingProduct.unitPrice)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tồn Kho Hiện Tại">
                <Tag
                  color={viewingProduct.stockQuantity <= 10 ? 'red' : 'green'}
                  style={{ fontWeight: 600 }}
                >
                  {viewingProduct.stockQuantity <= 10 && <WarningOutlined />} {viewingProduct.stockQuantity} đơn vị
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hạn Sử Dụng (HSD)">
                {formatDate(viewingProduct.expirationDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái Kinh Doanh">
                <Tag color={viewingProduct.productStatus === 'ON_SALE' ? 'green' : 'default'}>
                  {viewingProduct.productStatus === 'ON_SALE' ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </Card>
  )
}

