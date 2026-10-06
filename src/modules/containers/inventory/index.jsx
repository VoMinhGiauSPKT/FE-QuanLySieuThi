import { useState } from 'react'
import { message } from 'antd'
import InventoryDesktop from '../../layout/desktop/inventory'
import { useAuthStore } from '../../../stores/authStore'

export default function InventoryContainer() {
  const user = useAuthStore((state) => state.user)

  // Danh sách kho mẫu theo đúng thiết kế /api/product và /api/product/low-stock
  const [inventoryItems] = useState([
    {
      productId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      productName: 'Coca Cola lon 330ml',
      stockQuantity: 100,
      expirationDate: '2027-12-31T00:00:00.000Z',
      productStatus: 'ON_SALE',
      category: { categoryName: 'Đồ uống' },
    },
    {
      productId: '550e8400-e29b-41d4-a716-446655440000',
      productName: 'Bánh Oreo gói 133g',
      stockQuantity: 50,
      expirationDate: '2026-06-30T00:00:00.000Z',
      productStatus: 'ON_SALE',
      category: { categoryName: 'Bánh kẹo' },
    },
    {
      productId: '8ca73b9e-69ab-4221-a477-9801bcd3d543',
      productName: 'Mì Omachi Xốt Bò Hầm',
      stockQuantity: 8, // <= 10 (Cận tồn kho)
      expirationDate: '2026-11-20T00:00:00.000Z',
      productStatus: 'ON_SALE',
      category: { categoryName: 'Mì ăn liền' },
    },
    {
      productId: '7db62a8d-58ba-3110-9366-87f0abc2c432',
      productName: 'Red Bull lon 250ml',
      stockQuantity: 5, // <= 10 (Cận tồn kho)
      expirationDate: '2027-01-01T00:00:00.000Z',
      productStatus: 'ON_SALE',
      category: { categoryName: 'Đồ uống' },
    },
  ])

  // Lọc các mặt hàng có tồn kho <= 10
  const lowStockItems = inventoryItems.filter((item) => item.stockQuantity <= 10)

  const handleNewImport = () => {
    message.info('Chức năng tạo phiếu nhập hàng sẽ kết nối với API phân hệ Nhập Kho!')
  }

  return (
    <InventoryDesktop
      user={user}
      inventoryItems={inventoryItems}
      lowStockItems={lowStockItems}
      onNewImport={handleNewImport}
    />
  )
}
