import { useState } from 'react'
import { message } from 'antd'
import AdminDesktop from '../../layout/desktop/admin'
import { useAuthStore } from '../../../stores/authStore'
import { USER_ROLES } from '../../../constants/roles'

export default function AdminContainer() {
  const user = useAuthStore((state) => state.user)

  // Danh sách nhân sự mẫu (sẽ được thay bằng API /api/employee sau này)
  const [employeeList] = useState([
    {
      employeeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      username: 'admin',
      fullName: 'Nguyễn Văn Admin',
      phoneNumber: '0901234567',
      position: USER_ROLES.STORE_OWNER,
      status: true,
    },
    {
      employeeId: '4ba96a12-5818-4773-a4fd-3c974f77bfb7',
      username: 'cashier01',
      fullName: 'Trần Thị Thu Ngân',
      phoneNumber: '0902345678',
      position: USER_ROLES.CASHIER,
      status: true,
    },
    {
      employeeId: '5cb07b23-6929-4884-b5fe-4d085f88cfc8',
      username: 'warehouse01',
      fullName: 'Lê Văn Kho',
      phoneNumber: '0903456789',
      position: USER_ROLES.INVENTORY_MANAGER,
      status: true,
    },
  ])

  const handleAddEmployee = () => {
    message.info('Chức năng thêm tài khoản nhân viên mới sẽ kết nối với API POST /api/employee!')
  }

  return (
    <AdminDesktop
      user={user}
      employeeList={employeeList}
      onAddEmployee={handleAddEmployee}
    />
  )
}
