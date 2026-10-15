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
  Popconfirm,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
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

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState(undefined)
  const [categoryId, setCategoryId] = useState(undefined)

  useEffect(() => {
    fetchProducts(1, 8, {})
    fetchAllCategories()
  }, [fetchProducts, fetchAllCategories])

  const handleApplyFilter = () => {
    fetchProducts(1, pagination?.pageSize || 8, {
      keyword: keyword.trim(),
      categoryId,
      productStatus: status,
    })
  }

  const handleResetFilter = () => {
    setKeyword('')
    setStatus(undefined)
    setCategoryId(undefined)
    fetchProducts(1, pagination?.pageSize || 8, {})
  }

  const handleTableChange = (pag) => {
    fetchProducts(pag.current, pag.pageSize, {
      keyword: keyword.trim(),
      categoryId,
      productStatus: status,
    })
  }

  // Chuyển trạng thái mặt hàng sang 'Ngừng bán' khi bấm vào nút thùng rác
  const handleDiscontinue = async (record) => {
    const ok = await updateProduct(record.productId, {
      productStatus: 'DISCONTINUED',
    })
    if (ok) {
      fetchProducts(pagination?.current || 1, pagination?.pageSize || 8, {
        keyword: keyword.trim(),
        categoryId,
        productStatus: status,
      })
    }
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
      fetchProducts(pagination?.current || 1, pagination?.pageSize || 8, {
        keyword: keyword.trim(),
        categoryId,
        productStatus: status,
      })
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
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (c, r) => <Tag color="cyan">{c || r.category?.categoryName || 'Sản phẩm'}</Tag>,
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 110,
      render: (q) => (
        <Tag color={q <= 10 ? 'red' : 'green'} style={{ fontWeight: 600 }}>
          {q <= 10 && <WarningOutlined />} {q ?? 0}
        </Tag>
      ),
    },
    {
      title: 'Giá Bán',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (d) => {
        if (!d) return '-'
        const isExpired = new Date(d).getTime() < Date.now()
        if (isExpired) {
          return (
            <Space size={6}>
              <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>{formatDate(d)}</Text>
              <Tag color="red" style={{ fontWeight: 600 }}>Hết hạn</Tag>
            </Space>
          )
        }
        return formatDate(d)
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'productStatus',
      key: 'productStatus',
      width: 120,
      render: (st) => (
        <Tag color={st === 'ON_SALE' ? 'green' : 'default'}>
          {st === 'ON_SALE' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 110,
      render: (_, record) => {
        const isDiscontinued = record.productStatus === 'DISCONTINUED'
        return (
          <Space size="small">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Ngừng bán sản phẩm?"
              description={`Bạn có chắc muốn chuyển "${record.productName}" sang Ngừng bán?`}
              onConfirm={() => handleDiscontinue(record)}
              okText="Ngừng bán"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={isDiscontinued}
            >
              <Tooltip title={isDiscontinued ? 'Đã ngừng bán' : 'Ngừng bán'}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={isDiscontinued}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <Card title="Quản Lý Danh Sách Mặt Hàng" bordered={false} className="product-management-tab">
      <div className="product-management-tab__filters">
        <Input
          placeholder="Tìm theo mã, tên mặt hàng..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleApplyFilter}
          style={{ width: 250 }}
          allowClear
        />

        <Select
          placeholder="Lọc theo loại sản phẩm"
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
          total: pagination?.total != null ? pagination.total : safeProducts.length,
          showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
          showSizeChanger: true,
          pageSizeOptions: ['8', '16', '24', '50'],
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
    </Card>
  )
}
