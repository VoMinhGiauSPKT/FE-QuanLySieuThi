import { useState } from 'react'
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
import { getRoleTagColor, getRoleDisplayName } from '../../../../../utils/roleHelper'
import { USER_ROLES } from '../../../../../constants/roles'
import { formatDateTime } from '../../../../../utils/formatters'

const { Text } = Typography

export default function EmployeeManagementTab({
  employees,
  loading,
  pagination,
  onTableChange,
  onSearch,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onRefresh,
}) {
  const safeEmployees = Array.isArray(employees) ? employees : []

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [keyword, setKeyword] = useState('')
  const [selectedRole, setSelectedRole] = useState(undefined)
  const [selectedStatus, setSelectedStatus] = useState(undefined)

  const handleApplyFilter = () => {
    onSearch({
      keyword,
      position: selectedRole,
      status: selectedStatus,
    })
  }

  const handleResetFilter = () => {
    setKeyword('')
    setSelectedRole(undefined)
    setSelectedStatus(undefined)
    if (onRefresh) onRefresh()
    else onSearch({})
  }

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp)
    editForm.setFieldsValue({
      fullName: emp.fullName,
      phoneNumber: emp.phoneNumber,
      email: emp.email,
      position: emp.position,
      status: emp.status,
    })
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (u) => <Text strong>{u}</Text>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || <Text type="secondary">Chưa có</Text>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      render: (pos) => (
        <Tag color={getRoleTagColor(pos)} style={{ fontWeight: 500 }}>
          {getRoleDisplayName(pos)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'success' : 'error'}>
          {status ? 'Đang làm việc' : 'Đã khóa tài khoản'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEdit(record)}
          />
          {record.status && (
            <Popconfirm
              title="Khóa tài khoản nhân viên?"
              description="Nhân viên này sẽ không thể đăng nhập vào hệ thống!"
              onConfirm={() => onDeleteEmployee(record.employeeId)}
              okText="Đồng ý khóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Danh Sách Nhân Sự & Tài Khoản Hệ Thống"
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
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        {/* Bộ lọc tìm kiếm */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên hoặc username..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleApplyFilter}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo chức vụ"
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: 180 }}
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
            style={{ width: 160 }}
            allowClear
          >
            <Select.Option value="true">Đang làm việc</Select.Option>
            <Select.Option value="false">Đã khóa</Select.Option>
          </Select>
          <Button type="primary" onClick={handleApplyFilter}>
            Tìm Kiếm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
            Làm Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={safeEmployees}
          rowKey="employeeId"
          loading={loading}
          pagination={pagination}
          onChange={onTableChange}
        />
      </Card>

      {/* Modal tạo nhân viên */}
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
          onFinish={async (values) => {
            const ok = await onCreateEmployee(values)
            if (ok) {
              createForm.resetFields()
              setIsCreateModalOpen(false)
            }
          }}
          initialValues={{ position: USER_ROLES.CASHIER, status: true }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input placeholder="Ví dụ: cashier02" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu ban đầu" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Thị Lan" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="Ví dụ: 0912345678" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="Ví dụ: lan@gmail.com" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select>
              <Select.Option value={USER_ROLES.CASHIER}>Thu Ngân</Select.Option>
              <Select.Option value={USER_ROLES.INVENTORY_MANAGER}>Quản Lý Kho</Select.Option>
              <Select.Option value={USER_ROLES.STORE_OWNER}>Chủ Cửa Hàng (Admin)</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo Nhân Viên
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa nhân viên */}
      <Modal
        title="Chỉnh Sửa Thông Tin Nhân Viên"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (editingEmployee) {
              const ok = await onUpdateEmployee(editingEmployee.employeeId, values)
              if (ok) {
                setIsEditModalOpen(false)
              }
            }
          }}
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select>
              <Select.Option value={USER_ROLES.CASHIER}>Thu Ngân</Select.Option>
              <Select.Option value={USER_ROLES.INVENTORY_MANAGER}>Quản Lý Kho</Select.Option>
              <Select.Option value={USER_ROLES.STORE_OWNER}>Chủ Cửa Hàng (Admin)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái tài khoản">
            <Select>
              <Select.Option value={true}>Đang làm việc (Kích hoạt)</Select.Option>
              <Select.Option value={false}>Khóa tài khoản</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập Nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
