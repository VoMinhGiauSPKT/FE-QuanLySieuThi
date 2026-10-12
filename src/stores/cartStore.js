import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  cartItems: [],
  customer: null, // { customerId, fullName, phoneNumber, loyaltyPoints }
  usePoints: false,

  // Thêm sản phẩm vào giỏ
  addToCart: (product) => {
    const { cartItems } = get()
    const existingIndex = cartItems.findIndex((item) => item.productId === product.productId)

    if (existingIndex > -1) {
      const updated = [...cartItems]
      const currentQty = updated[existingIndex].quantity
      // Kiểm tra tồn kho nếu có
      if (product.stockQuantity !== undefined && currentQty >= product.stockQuantity) {
        return { success: false, message: 'Số lượng trong giỏ đã đạt giới hạn tồn kho!' }
      }
      updated[existingIndex].quantity = currentQty + 1
      set({ cartItems: updated })
      return { success: true }
    } else {
      if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
        return { success: false, message: 'Sản phẩm này hiện đã hết hàng trong kho!' }
      }
      set({
        cartItems: [
          ...cartItems,
          {
            productId: product.productId,
            productName: product.productName,
            unitPrice: Number(product.unitPrice),
            quantity: 1,
            stockQuantity: product.stockQuantity,
            categoryName: product.category?.categoryName || product.categoryName || 'Sản phẩm',
          },
        ],
      })
      return { success: true }
    }
  },

  // Cập nhật số lượng
  updateQuantity: (productId, quantity) => {
    const qty = Number(quantity)
    if (qty <= 0) {
      get().removeFromCart(productId)
      return
    }
    const { cartItems } = get()
    const updated = cartItems.map((item) => {
      if (item.productId === productId) {
        const validQty = item.stockQuantity !== undefined ? Math.min(qty, item.stockQuantity) : qty
        return { ...item, quantity: validQty }
      }
      return item
    })
    set({ cartItems: updated })
  },

  // Xóa 1 mặt hàng khỏi giỏ
  removeFromCart: (productId) => {
    const { cartItems } = get()
    set({ cartItems: cartItems.filter((item) => item.productId !== productId) })
  },

  // Xóa toàn bộ giỏ
  clearCart: () => {
    set({
      cartItems: [],
      customer: null,
      usePoints: false,
    })
  },

  // Thiết lập khách hàng
  setCustomer: (customer) => {
    set({ customer, usePoints: false })
  },

  // Thiết lập dùng điểm
  setUsePoints: (usePoints) => {
    set({ usePoints })
  },

  // Tính toán tiền
  getSummary: () => {
    const { cartItems, customer, usePoints } = get()
    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    
    let discount = 0
    if (customer && usePoints && customer.loyaltyPoints > 0) {
      // Giả sử 1 điểm = 100 VNĐ, tối đa 50% hóa đơn theo API doc
      const maxDiscount = subtotal * 0.5
      const pointDiscount = customer.loyaltyPoints * 100
      discount = Math.min(pointDiscount, maxDiscount)
    }

    const finalTotal = Math.max(0, subtotal - discount)
    return {
      subtotal,
      discount,
      finalTotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    }
  },
}))
