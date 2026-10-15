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
  Spin,
  Tooltip,
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
import { useEmployeeStore } from '../../../../stores/employeeStore'
import './EmployeeManagementTab.scss'

const { Text } = Typography

export default function EmployeeManagementTab() {
  const {
    employees,
    loading,
    detailLoading,
    pagination,
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [keyword, setKeyword] = useState('')
  const [selectedRole, setSelectedRole] = useState(undefined)
  const [selectedStatus, setSelectedStatus] = useState(undefined)

  // Khởi tạo tải danh sách trang 1, limit 10 theo đúng chuẩn API BE
  useEffect(() => {
    fetchEmployees(1, 10, {})
  }, [fetchEmployees])

  const safeEmployees = Array.isArray(employees) ? employees : []

  // Lọc tìm kiếm nhân viên (luôn quay về trang 1)
  const handleApplyFilter = () => {
    fetchEmployees(1, pagination?.pageSize || 10, {
      keyword: keyword.trim() || undefined,
      position: selectedRole || undefined,
      status: selectedStatus !== undefined && selectedStatus !== '' ? selectedStatus : undefined,
    })
  }

  // Đặt lại bộ lọc
  const handleResetFilter = () => {
    setKeyword('')
    setSelectedRole(undefined)
    setSelectedStatus(undefined)
    fetchEmployees(1, 10, {})
  }

  // Xử lý chuyển trang hoặc thay đổi số lượng bản ghi / trang (page, limit)
  const handleTableChange = (pag) => {
    fetchEmployees(pag.current, pag.pageSize, {
      keyword: keyword.trim() || undefined,
      position: selectedRole || undefined,
      status: selectedStatus !== undefined && selectedStatus !== '' ? selectedStatus : undefined,
    })
  }

  // Thêm mới nhân viên: Gửi đầy đủ thông tin, không truyền mã nhân viên
  const handleCreateSubmit = async (values) => {
    const ok = await createEmployee({
      fullName: values.fullName,
      username: values.username,
      password: values.password,
      phoneNumber: values.phoneNumber || '',
      position: values.position,
      status: values.status ?? true,
    })
    if (ok) {
      setIsCreateModalOpen(false)
      createForm.resetFields()
      fetchEmployees(1, pagination?.pageSize || 10, {})
    }
  }

  // Bấm nút Sửa: Gọi API lấy chi tiết rồi fill dữ liệu vào form
  const handleOpenEdit = async (record) => {
    setEditingEmployee(record)
    setIsEditModalOpen(true)
    editForm.resetFields()

    // Gọi API lấy dữ liệu chi tiết mới nhất từ Backend
    const detail = await fetchEmployeeById(record.employeeId)
    const empData = detail || record
    setEditingEmployee(empData)

    // Điền dữ liệu vào form
    editForm.setFieldsValue({
      fullName: empData.fullName,
      username: empData.username,
      position: empData.position,
      phoneNumber: empData.phoneNumber || '',
      status: empData.status !== false,
      password: '',
    })
  }

  // Cập nhật nhân viên
  const handleEditSubmit = async (values) => {
    if (!editingEmployee?.employeeId) return
    const payload = {
      fullName: values.fullName,
      username: values.username || editingEmployee.username,
      phoneNumber: values.phoneNumber || '',
      position: values.position,
      status: values.status,
    }
    if (values.password && values.password.trim()) {
      payload.password = values.password.trim()
    }

    const ok = await updateEmployee(editingEmployee.employeeId, payload)
    if (ok) {
      setIsEditModalOpen(false)
      editForm.resetFields()
      setEditingEmployee(null)
      fetchEmployees(pagination?.current || 1, pagination?.pageSize || 10, {
        keyword: keyword.trim() || undefined,
        position: selectedRole || undefined,
        status: selectedStatus !== undefined && selectedStatus !== '' ? selectedStatus : undefined,
      })
    }
  }

  // Xóa / vô hiệu hóa nhân viên
  const handleDelete = async (employeeId) => {
    await deleteEmployee(employeeId)
  }

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 110,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong>{name}</Text>,
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
      title: 'Hành động',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tài khoản nhân viên?"
            description={`Bạn có chắc muốn vô hiệu hóa tài khoản ${record.fullName}?`}
            onConfirm={() => handleDelete(record.employeeId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Vô hiệu hóa">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={record.position === USER_ROLES.STORE_OWNER}
              />
            </Tooltip>
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
          placeholder="Tìm kiếm họ tên, mã NV..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleApplyFilter}
          style={{ width: 250 }}
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
          pageSize: pagination?.pageSize || 10,
          total: pagination?.total != null ? pagination.total : safeEmployees.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} trên tổng số ${total} nhân viên`,
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
          initialValues={{ position: USER_ROLES.CASHIER, status: true }}
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

          <Form.Item
            name="phoneNumber"
            label="Số Điện Thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{9,15}$/, message: 'Số điện thoại gồm 9 đến 15 chữ số!' },
            ]}
          >
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
        onCancel={() => {
          setIsEditModalOpen(false)
          setEditingEmployee(null)
        }}
        footer={null}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item
              name="fullName"
              label="Họ và Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="Họ và tên nhân viên" />
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên Đăng Nhập"
            >
              <Input disabled />
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

            <Form.Item
              name="phoneNumber"
              label="Số Điện Thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{9,15}$/, message: 'Số điện thoại gồm 9 đến 15 chữ số!' },
              ]}
            >
              <Input placeholder="Số điện thoại liên hệ" />
            </Form.Item>

            <Form.Item name="status" label="Trạng Thái Hoạt Động">
              <Select disabled={editingEmployee?.position === USER_ROLES.STORE_OWNER}>
                <Select.Option value={true}>Đang hoạt động</Select.Option>
                <Select.Option value={false}>Khóa tài khoản</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật Khẩu Mới (để trống nếu không đổi)"
              rules={[
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự nếu muốn đổi!' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới nếu muốn đặt lại" />
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
    </Card>
  )
}
