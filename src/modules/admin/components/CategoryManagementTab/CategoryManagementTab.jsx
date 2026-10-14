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
import { useCategoryStore } from '../../../../stores/categoryStore'
import './CategoryManagementTab.scss'

const { Text } = Typography

export default function CategoryManagementTab() {
  const {
    categories,
    loading,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore()

  const safeCategories = Array.isArray(categories) ? categories : []
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchCategories(1, 8, '')
  }, [fetchCategories])

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editForm] = Form.useForm()

  const handleApplyFilter = () => {
    fetchCategories(1, pagination?.pageSize || 8, keyword.trim())
  }

  const handleResetFilter = () => {
    setKeyword('')
    fetchCategories(1, pagination?.pageSize || 8, '')
  }

  const handleTableChange = (pag) => {
    fetchCategories(pag.current, pag.pageSize, keyword.trim())
  }

  const handleCreateSubmit = async (values) => {
    const ok = await createCategory(values)
    if (ok) {
      setIsCreateModalOpen(false)
      createForm.resetFields()
      fetchCategories(1, pagination?.pageSize || 8, '')
    }
  }

  const handleOpenEdit = (record) => {
    setEditingCategory(record)
    editForm.setFieldsValue({
      categoryName: record.categoryName,
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (values) => {
    if (!editingCategory?.categoryId) return
    const ok = await updateCategory(editingCategory.categoryId, values)
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingCategory(null)
      fetchCategories(pagination?.current || 1, pagination?.pageSize || 8, keyword.trim())
    }
  }

  const handleDelete = async (categoryId) => {
    await deleteCategory(categoryId)
  }

  const columns = [
    {
      title: 'Mã Ngành Hàng',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 140,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Tên Ngành Hàng / Loại Sản Phẩm',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (name) => (
        <Space>
          <AppstoreOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa ngành hàng này?"
            description={`Bạn có chắc chắn muốn xóa "${record.categoryName}"? Các sản phẩm thuộc ngành này có thể bị ảnh hưởng.`}
            onConfirm={() => handleDelete(record.categoryId)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Quản Lý Ngành Hàng & Loại Sản Phẩm"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ borderRadius: 8 }}
        >
          Thêm Ngành Hàng Mới
        </Button>
      }
      bordered={false}
      className="category-management-tab"
    >
      <Alert
        message="Hệ thống tự động sinh mã định danh chuẩn dạng LSP001, LSP002... khi bạn tạo mới ngành hàng."
        type="info"
        showIcon
        className="category-management-tab__alert"
      />

      <div className="category-management-tab__search-bar">
        <Input
          placeholder="Tìm theo tên ngành hàng..."
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
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || safeCategories.length,
          showTotal: (total) => `Tổng cộng ${total} ngành hàng`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Thêm Mới */}
      <Modal
        title="Thêm Mới Ngành Hàng"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            name="categoryName"
            label="Tên Ngành Hàng / Loại Sản Phẩm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên ngành hàng!' },
              { min: 2, message: 'Tên tối thiểu 2 ký tự!' },
            ]}
          >
            <Input placeholder="Ví dụ: Bánh kẹo & Snack, Sữa & Chế phẩm sữa..." size="large" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu Ngành Hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chỉnh Sửa */}
      <Modal
        title={`Chỉnh Sửa Ngành Hàng: ${editingCategory?.categoryName || ''}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="categoryName"
            label="Tên Ngành Hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên ngành hàng!' },
              { min: 2, message: 'Tên tối thiểu 2 ký tự!' },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </Card>
  )
}
