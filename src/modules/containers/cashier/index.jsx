import { useState } from 'react'
import { Modal, message } from 'antd'
import CashierDesktop from '../../layout/desktop/cashier'
import { useAuthStore } from '../../../stores/authStore'

export default function CashierContainer() {
  const user = useAuthStore((state) => state.user)

  // Danh mục sản phẩm mẫu chuẩn theo thiết kế backend (/api/product)
  const [products] = useState([
    {
      productId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      productName: 'Coca Cola lon 330ml',
      unitPrice: 10000,
      stockQuantity: 100,
      category: { categoryName: 'Đồ uống' },
    },
    {
      productId: '550e8400-e29b-41d4-a716-446655440000',
      productName: 'Bánh Oreo gói 133g',
      unitPrice: 18000,
      stockQuantity: 50,
      category: { categoryName: 'Bánh kẹo' },
    },
    {
      productId: '8ca73b9e-69ab-4221-a477-9801bcd3d543',
      productName: 'Mì Omachi Xốt Bò Hầm',
      unitPrice: 11000,
      stockQuantity: 80,
      category: { categoryName: 'Mì ăn liền' },
    },
    {
      productId: '7db62a8d-58ba-3110-9366-87f0abc2c432',
      productName: 'Red Bull lon 250ml',
      unitPrice: 15000,
      stockQuantity: 5,
      category: { categoryName: 'Đồ uống' },
    },
  ])

  const [cart, setCart] = useState([])
  const [customerPhone, setCustomerPhone] = useState('')

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.productId)
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    message.success(`Đã thêm ${product.productName} vào hóa đơn`)
  }

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
  }

  const handleClearCart = () => {
    setCart([])
    setCustomerPhone('')
  }

  const handleCheckout = () => {
    const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

    Modal.confirm({
      title: 'Xác Nhận Xuất Hóa Đơn & Thu Tiền',
      content: (
        <div>
          <p>Số lượng món: <strong>{cart.length} món</strong></p>
          <p>Khách hàng: <strong>{customerPhone || 'Khách vãng lai'}</strong></p>
          <p>Tổng tiền thanh toán: <strong style={{ color: '#52c41a', fontSize: 18 }}>{totalAmount.toLocaleString('vi-VN')} đ</strong></p>
        </div>
      ),
      okText: 'In Hóa Đơn & Hoàn Tất',
      cancelText: 'Quay lại',
      onOk: () => {
        message.success('Tạo hóa đơn bán lẻ thành công!')
        handleClearCart()
      },
    })
  }

  return (
    <CashierDesktop
      user={user}
      products={products}
      cart={cart}
      customerPhone={customerPhone}
      onCustomerPhoneChange={setCustomerPhone}
      onAddToCart={handleAddToCart}
      onRemoveFromCart={handleRemoveFromCart}
      onClearCart={handleClearCart}
      onCheckout={handleCheckout}
    />
  )
}
