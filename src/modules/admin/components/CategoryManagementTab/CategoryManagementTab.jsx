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
  Descriptions,
  Spin,
  Badge,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useCategoryStore } from '../../../../stores/categoryStore'
import './CategoryManagementTab.scss'

const { Text } = Typography

export default function CategoryManagementTab() {
  const {
    categories,
    loading,
    detailLoading,
    pagination,
    fetchCategories,
    fetchCategoryById,
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

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingCategory, setViewingCategory] = useState(null)

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
    // Không truyền categoryId vì BE tự sinh LSP001, LSP002...
    const ok = await createCategory({
      categoryName: values.categoryName,
    })
    if (ok) {
      setIsCreateModalOpen(false)
      createForm.resetFields()
      fetchCategories(1, pagination?.pageSize || 8, '')
    }
  }

  // Bấm nút Sửa: Gọi API lấy chi tiết rồi fill dữ liệu vào form
  const handleOpenEdit = async (record) => {
    setEditingCategory(record)
    setIsEditModalOpen(true)
    const detail = await fetchCategoryById(record.categoryId)
    const catData = detail || record
    setEditingCategory(catData)
    editForm.setFieldsValue({
      categoryName: catData.categoryName,
    })
  }

  const handleEditSubmit = async (values) => {
    if (!editingCategory?.categoryId) return
    const ok = await updateCategory(editingCategory.categoryId, {
      categoryName: values.categoryName,
    })
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingCategory(null)
      fetchCategories(pagination?.current || 1, pagination?.pageSize || 8, keyword.trim())
    }
  }

  // Bấm nút Xem chi tiết: Gọi API lấy chi tiết
  const handleOpenDetail = async (record) => {
    setViewingCategory(record)
    setIsDetailModalOpen(true)
    const detail = await fetchCategoryById(record.categoryId)
    if (detail) {
      setViewingCategory(detail)
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
      title: 'Số Mặt Hàng',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 140,
      render: (count) => (
        <Badge
          count={count ?? 0}
          overflowCount={999}
          style={{ backgroundColor: count > 0 ? '#108ee9' : '#d9d9d9', fontWeight: 600 }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
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
            title="Sửa ngành hàng"
          />
          <Popconfirm
            title="Xóa ngành hàng này?"
            description={`Bạn có chắc chắn muốn xóa "${record.categoryName}"?`}
            onConfirm={() => handleDelete(record.categoryId)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
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

      {/* Modal Xem Chi Tiết Ngành Hàng */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Ngành Hàng: {viewingCategory?.categoryName || ''}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setViewingCategory(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={500}
      >
        <Spin spinning={detailLoading}>
          {viewingCategory && (
            <Descriptions bordered column={1} size="middle" style={{ marginTop: 12 }}>
              <Descriptions.Item label="Mã Ngành Hàng">
                <Tag color="blue" style={{ fontWeight: 600 }}>{viewingCategory.categoryId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên Ngành Hàng">
                <Text strong>{viewingCategory.categoryName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số Lượng Sản Phẩm">
                <Badge
                  count={viewingCategory.productCount ?? 0}
                  overflowCount={999}
                  style={{ backgroundColor: '#108ee9', fontWeight: 600 }}
                />
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </Card>
  )
}

