import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Card,
  Modal,
  Form,
  Typography,
  Popconfirm,
  Tooltip,
  Alert,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { useCategoryStore } from '../../../../../stores/categoryStore'

const { Text, Title } = Typography

export default function CategoryManagementTab({
  categories: propCategories,
  loading: propLoading,
  pagination: propPagination,
  onTableChange,
  onSearch,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRefresh,
}) {
  const store = useCategoryStore()

  const categories = propCategories ?? store.categories
  const loading = propLoading ?? store.loading
  const pagination = propPagination ?? store.pagination

  const safeCategories = Array.isArray(categories) ? categories : []
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    if (!propCategories) {
      store.fetchCategories(1, 8, '')
      store.fetchAllCategories()
    }
  }, [propCategories])

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editForm] = Form.useForm()

  const handleApplyFilter = () => {
    if (onSearch) {
      onSearch({ keyword })
    } else {
      store.fetchCategories(1, pagination?.pageSize || 8, keyword)
    }
  }

  const handleResetFilter = () => {
    setKeyword('')
    if (onRefresh) {
      onRefresh()
    } else if (onSearch) {
      onSearch({})
    } else {
      store.fetchCategories(1, pagination?.pageSize || 8, '')
    }
  }

  const handleTableChange = (pag) => {
    if (onTableChange) {
      onTableChange(pag)
    } else {
      store.fetchCategories(pag.current, pag.pageSize, keyword)
    }
  }

  const handleOpenEdit = (record) => {
    setEditingCategory(record)
    editForm.setFieldsValue({
      categoryName: record.categoryName,
    })
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      title: 'Mã Loại SP',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 150,
      render: (id) => <Text code strong>{id}</Text>,
    },
    {
      title: 'Tên Loại Sản Phẩm',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (name) => (
        <Space>
          <AppstoreOutlined orientation="vertical" orientationMargin={4} orientationPosition="left" orientationDirection="vertical" orientationAlignment="center" style={{ color: '#1890ff' }} />
          <Text orientationMargin={0} strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Số Lượng SP Thuộc Loại',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 200,
      align: 'center',
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'} style={{ fontSize: 13, padding: '2px 10px', borderRadius: 12 }}>
          {count || 0} sản phẩm
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space orientation="horizontal" size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>
          {record.productCount > 0 ? (
            <Tooltip title={`Có ${record.productCount} sản phẩm đang thuộc loại này. Không thể xóa!`}>
              <Button
                type="text"
                danger
                disabled
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Tooltip>
          ) : (
            <Popconfirm
              title="Xóa loại sản phẩm"
              description={`Bạn có chắc chắn muốn xóa "${record.categoryName}" không?`}
              onConfirm={() => {
                if (onDeleteCategory) onDeleteCategory(record.categoryId)
                else store.deleteCategory(record.categoryId)
              }}
              okText="Đồng ý xóa"
              cancelText="Hủy"
              icon={<QuestionCircleOutlined style={{ color: '#ff4d4f' }} />}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span>Quản Lý Phân Loại Sản Phẩm (Danh Mục Hàng Hóa)</span>
          </Space>
        }
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              createForm.resetFields()
              setIsCreateModalOpen(true)
            }}
          >
            Thêm Loại Sản Phẩm
          </Button>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo mã hoặc tên loại..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleApplyFilter}
            style={{ width: 280 }}
            allowClear
          />
          <Button type="primary" onClick={handleApplyFilter}>
            Tìm Kiếm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
            Làm Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={safeCategories}
          rowKey="categoryId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal Thêm mới loại sản phẩm */}
      <Modal
        title="Thêm Mới Loại Sản Phẩm"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            const ok = onCreateCategory ? await onCreateCategory(values) : await store.createCategory(values)
            if (ok) {
              setIsCreateModalOpen(false)
              createForm.resetFields()
            }
          }}
        >
          <Alert
            type="info"
            showIcon
            message="Mã loại sản phẩm sẽ được hệ thống tự động cấp theo thứ tự (Ví dụ: LSP001, LSP002...)"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="categoryName"
            label="Tên loại sản phẩm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại sản phẩm!' },
              { whitespace: true, message: 'Tên loại sản phẩm không được chỉ chứa khoảng trắng!' },
            ]}
          >
            <Input placeholder="Ví dụ: Bánh kẹo, Nước giải khát, Gia vị..." autoFocus />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo Loại Sản Phẩm
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Cập nhật loại sản phẩm */}
      <Modal
        title={`Cập Nhật Loại Sản Phẩm: ${editingCategory?.categoryId || ''}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (editingCategory) {
              const ok = onUpdateCategory
                ? await onUpdateCategory(editingCategory.categoryId, values)
                : await store.updateCategory(editingCategory.categoryId, values)
              if (ok) {
                setIsEditModalOpen(false)
              }
            }
          }}
        >
          <Form.Item
            name="categoryName"
            label="Tên loại sản phẩm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại sản phẩm!' },
              { whitespace: true, message: 'Tên loại sản phẩm không được chỉ chứa khoảng trắng!' },
            ]}
          >
            <Input placeholder="Nhập tên mới..." />
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
    </div>
  )
}
