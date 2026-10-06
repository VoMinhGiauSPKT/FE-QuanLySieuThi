/**
 * Lấy màu sắc Tag Ant Design tương ứng cho từng chức vụ
 */
export const getRoleTagColor = (role) => {
  switch (role) {
    case 'STORE_OWNER':
      return 'red'
    case 'CASHIER':
      return 'green'
    case 'INVENTORY_MANAGER':
      return 'blue'
    default:
      return 'default'
  }
}

/**
 * Lấy tên tiếng Việt hiển thị cho chức vụ
 */
export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'STORE_OWNER':
      return 'Chủ Cửa Hàng (Admin)'
    case 'CASHIER':
      return 'Thu Ngân'
    case 'INVENTORY_MANAGER':
      return 'Quản Lý Kho'
    default:
      return role || 'Nhân Viên'
  }
}

/**
 * Lấy đường dẫn trang mặc định theo vai trò nhân viên
 */
export const getRoleDefaultPath = (role) => {
  switch (role) {
    case 'STORE_OWNER':
      return '/admin'
    case 'CASHIER':
      return '/cashier'
    case 'INVENTORY_MANAGER':
      return '/inventory'
    default:
      return '/'
  }
}
