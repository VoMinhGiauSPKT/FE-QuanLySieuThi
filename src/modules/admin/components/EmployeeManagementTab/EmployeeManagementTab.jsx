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
  Popconfirm,
  Typography,
} from 'antd'
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { getRoleTagColor, getRoleDisplayName } from '../../../../utils/roleHelper'
import { USER_ROLES } from '../../../../constants/roles'
import { formatDateTime } from '../../../../utils/formatters'
import { useEmployeeStore } from '../../../../stores/employeeStore'
import './EmployeeManagementTab.scss'

const { Text } = Typography

export default function EmployeeManagementTab() {
  const {
    employees,
    loading,
    pagination,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeStore()

  const safeEmployees = Array.isArray(employees) ? employees : []

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [keyword, setKeyword] = useState('')
  const [selectedRole, setSelectedRole] = useState(undefined)
  const [selectedStatus, setSelectedStatus] = useState(undefined)

  useEffect(() => {
    fetchEmployees(1, 8, {})
  }, [fetchEmployees])

  const handleApplyFilter = () => {
    fetchEmployees(1, pagination?.pageSize || 8, {
      keyword: keyword.trim(),
      position: selectedRole,
      status: selectedStatus,
    })
  }

  const handleResetFilter = () => {
    setKeyword('')
    setSelectedRole(undefined)
    setSelectedStatus(undefined)
    fetchEmployees(1, pagination?.pageSize || 8, {})
  }

  const handleTableChange = (pag) => {
    fetchEmployees(pag.current, pag.pageSize, {
      keyword: keyword.trim(),
      position: selectedRole,
      status: selectedStatus,
    })
  }

  const handleCreateSubmit = async (values) => {
    const ok = await createEmployee(values)
    if (ok) {
      setIsCreateModalOpen(false)
      createForm.resetFields()
      fetchEmployees(1, pagination?.pageSize || 8, {})
    }
  }

  const handleOpenEdit = (record) => {
    setEditingEmployee(record)
    editForm.setFieldsValue({
      fullName: record.fullName,
      position: record.position,
      status: record.status !== false,
      phoneNumber: record.phoneNumber,
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (values) => {
    if (!editingEmployee?.employeeId) return
    const ok = await updateEmployee(editingEmployee.employeeId, values)
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingEmployee(null)
      fetchEmployees(pagination?.current || 1, pagination?.pageSize || 8, {})
    }
  }

  const handleDelete = async (employeeId) => {
    await deleteEmployee(employeeId)
  }

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100,
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Chức Vụ',
      dataIndex: 'position',
      key: 'position',
      render: (pos) => (
        <Tag color={getRoleTagColor(pos)} style={{ fontWeight: 500 }}>
          {getRoleDisplayName(pos)}
        </Tag>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (p) => p || <Text type="secondary">-</Text>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <Tag color={st === false ? 'red' : 'green'}>
          {st === false ? 'Bị khóa' : 'Đang hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Xóa tài khoản nhân viên?"
            description={`Bạn có chắc muốn xóa nhân viên ${record.fullName}?`}
            onConfirm={() => handleDelete(record.employeeId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.position === USER_ROLES.STORE_OWNER}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Danh Sách Nhân Viên Hệ Thống"
      extra={
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ borderRadius: 8 }}
        >
          Thêm Nhân Viên Mới
        </Button>
      }
      bordered={false}
      className="employee-management-tab"
    >
      {/* Bộ lọc nhân viên */}
      <div className="employee-management-tab__filters">
        <Input
          placeholder="Tìm kiếm họ tên, username..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleApplyFilter}
          style={{ width: 240 }}
          allowClear
        />

        <Select
          placeholder="Chọn chức vụ"
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ width: 170 }}
          allowClear
        >
          <Select.Option value={USER_ROLES.STORE_OWNER}>Chủ Cửa Hàng</Select.Option>
          <Select.Option value={USER_ROLES.CASHIER}>Thu Ngân</Select.Option>
          <Select.Option value={USER_ROLES.INVENTORY_MANAGER}>Quản Lý Kho</Select.Option>
        </Select>

        <Select
          placeholder="Trạng thái"
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 150 }}
          allowClear
        >
          <Select.Option value="true">Đang hoạt động</Select.Option>
          <Select.Option value="false">Bị khóa</Select.Option>
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
        dataSource={safeEmployees}
        rowKey="employeeId"
        loading={loading}
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || safeEmployees.length,
          showTotal: (total) => `Tổng cộng ${total} nhân viên`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Thêm Nhân Viên Mới */}
      <Modal
        title="Thêm Mới Nhân Viên"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ position: USER_ROLES.CASHIER }}
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên Đăng Nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập username!' },
              { min: 3, message: 'Tối thiểu 3 ký tự!' },
            ]}
          >
            <Input placeholder="Ví dụ: cashier01" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật Khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu cho nhân viên" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức Vụ Phân Quyền"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select>
              <Select.Option value={USER_ROLES.CASHIER}>Thu Ngân (CASHIER)</Select.Option>
              <Select.Option value={USER_ROLES.INVENTORY_MANAGER}>
                Quản Lý Kho (INVENTORY_MANAGER)
              </Select.Option>
              <Select.Option value={USER_ROLES.STORE_OWNER}>
                Chủ Cửa Hàng (STORE_OWNER)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số Điện Thoại">
            <Input placeholder="Ví dụ: 0901234567" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu Nhân Viên
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chỉnh Sửa Nhân Viên */}
      <Modal
        title={`Chỉnh Sửa Nhân Viên: ${editingEmployee?.fullName || ''}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức Vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select disabled={editingEmployee?.position === USER_ROLES.STORE_OWNER}>
              <Select.Option value={USER_ROLES.CASHIER}>Thu Ngân</Select.Option>
              <Select.Option value={USER_ROLES.INVENTORY_MANAGER}>Quản Lý Kho</Select.Option>
              <Select.Option value={USER_ROLES.STORE_OWNER}>Chủ Cửa Hàng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số Điện Thoại">
            <Input />
          </Form.Item>

          <Form.Item name="status" label="Trạng Thái Hoạt Động">
            <Select disabled={editingEmployee?.position === USER_ROLES.STORE_OWNER}>
              <Select.Option value={true}>Đang hoạt động</Select.Option>
              <Select.Option value={false}>Khóa tài khoản</Select.Option>
            </Select>
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
