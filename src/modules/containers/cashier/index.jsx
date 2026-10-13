import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import CashierDesktop from '../../layout/desktop/cashier'
import {
  useAuthStore,
  useCartStore,
  useProductStore,
  useCustomerStore,
  useInvoiceStore,
  usePaymentStore,
  useReturnReceiptStore,
} from '../../../stores'

export default function CashierContainer() {
  const user = useAuthStore((state) => state.user)

  // Zustand Cart Store
  const {
    cartItems,
    customer,
    usePoints,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomer,
    setUsePoints,
    getSummary,
  } = useCartStore()

  const summary = getSummary()

  // Domain Zustand Stores
  const {
    products,
    loading: loadingProducts,
    fetchProducts,
  } = useProductStore()

  const {
    customers,
    loading: loadingCustomers,
    fetchCustomers,
    createCustomer,
  } = useCustomerStore()

  const { createInvoice, fetchInvoiceDetail } = useInvoiceStore()
  const { processPayment } = usePaymentStore()

  const {
    returnReceipts,
    loading: loadingReturn,
    fetchReturnReceipts,
    createReturnReceipt,
  } = useReturnReceiptStore()

  // Navigation tab
  const [activeTab, setActiveTab] = useState('pos')
  const [productSearch, setProductSearch] = useState('')

  // Customer phone search in POS
  const [customerPhoneSearch, setCustomerPhoneSearch] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isRegisteringCustomer, setIsRegisteringCustomer] = useState(false)

  // Payment flow
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [pendingInvoice, setPendingInvoice] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Customers tab
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('')

  // Khởi tạo dữ liệu
  const loadInitialData = useCallback(async () => {
    await Promise.allSettled([
      fetchProducts(1, 50, { productStatus: 'ON_SALE' }),
      fetchCustomers({ limit: 20 }),
      fetchReturnReceipts({ limit: 10 }),
    ])
  }, [fetchProducts, fetchCustomers, fetchReturnReceipts])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Thêm vào giỏ hàng
  const handleAddToCart = (prod) => {
    const result = addToCart(prod)
    if (!result.success) {
      message.warning(result.message)
    } else {
      message.success(`Đã thêm ${prod.productName}`)
    }
  }

  // Tìm khách hàng bằng SĐT
  const handleSearchCustomerByPhone = async () => {
    const phone = customerPhoneSearch.trim()
    if (!phone) return
    const list = await fetchCustomers({ keyword: phone })
    const found = list.find((c) => c.phoneNumber === phone) || list[0]
    if (found) {
      setCustomer(found)
      message.success(`Đã tìm thấy khách hàng: ${found.fullName} (${found.loyaltyPoints || 0} điểm)`)
    } else {
      message.info('Không tìm thấy thông tin thành viên với SĐT này. Mở form đăng ký mới!')
      setIsRegisterModalOpen(true)
    }
  }

  // Đăng ký thành viên mới tại quầy
  const handleRegisterCustomer = async (values) => {
    setIsRegisteringCustomer(true)
    try {
      const newCust = await createCustomer(values)
      if (newCust) {
        setCustomer(newCust)
        setCustomerPhoneSearch('')
        setIsRegisterModalOpen(false)
        await fetchCustomers({ limit: 20 })
        return true
      }
    } finally {
      setIsRegisteringCustomer(false)
    }
    return false
  }

  // Bắt đầu thanh toán (Tạo hóa đơn trước)
  const handleStartCheckout = async () => {
    if (cartItems.length === 0) return
    setIsCreatingInvoice(true)
    try {
      const payload = {
        phoneNumber: customer?.phoneNumber || undefined,
        usePoints: Boolean(usePoints && customer?.loyaltyPoints > 0),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const invoiceData = await createInvoice(payload)
      if (invoiceData && invoiceData.invoiceId) {
        setPendingInvoice(invoiceData)
        setIsPaymentModalOpen(true)
      }
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  // Xử lý xác nhận thanh toán (Tiền mặt hoặc VNPay)
  const handleProcessPayment = async ({ invoiceId, paymentMethod }) => {
    setIsProcessingPayment(true)
    try {
      const data = await processPayment({ invoiceId, paymentMethod })

      if (paymentMethod === 'VNPAY' && data?.paymentUrl) {
        return { paymentUrl: data.paymentUrl }
      }

      if (data) {
        message.success('Thanh toán thành công! Đã hoàn tất hóa đơn.')
        clearCart()
        setPendingInvoice(null)
        setIsPaymentModalOpen(false)
        fetchProducts(1, 50, { productStatus: 'ON_SALE' })
        fetchCustomers({ limit: 20 })
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Tìm hóa đơn cho quầy trả hàng
  const handleSearchInvoiceForReturn = async (invoiceId) => {
    const detail = await fetchInvoiceDetail(invoiceId)
    if (!detail) {
      message.error('Không tìm thấy hóa đơn với mã này!')
    }
    return detail
  }

  // Tạo phiếu trả hàng
  const handleCreateReturn = async (payload) => {
    const res = await createReturnReceipt(payload)
    if (res) {
      fetchProducts(1, 50, { productStatus: 'ON_SALE' })
      return true
    }
    return false
  }

  return (
    <CashierDesktop
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // POS sale
      products={products}
      loadingProducts={loadingProducts}
      productSearch={productSearch}
      onProductSearchChange={(val) => {
        setProductSearch(val)
        fetchProducts(1, 50, { keyword: val, productStatus: 'ON_SALE' })
      }}
      cartItems={cartItems}
      customer={customer}
      usePoints={usePoints}
      onAddToCart={handleAddToCart}
      onUpdateCartQty={updateQuantity}
      onRemoveFromCart={removeFromCart}
      onClearCart={clearCart}
      customerPhoneSearch={customerPhoneSearch}
      onCustomerPhoneSearchChange={setCustomerPhoneSearch}
      onSearchCustomerByPhone={handleSearchCustomerByPhone}
      onToggleUsePoints={setUsePoints}
      onRemoveCustomer={() => setCustomer(null)}
      summary={summary}
      onStartCheckout={handleStartCheckout}
      isCreatingInvoice={isCreatingInvoice}
      // Modals
      isRegisterModalOpen={isRegisterModalOpen}
      onCloseRegisterModal={() => setIsRegisterModalOpen(false)}
      onRegisterCustomer={handleRegisterCustomer}
      isRegisteringCustomer={isRegisteringCustomer}
      isPaymentModalOpen={isPaymentModalOpen}
      pendingInvoice={pendingInvoice}
      onClosePaymentModal={() => setIsPaymentModalOpen(false)}
      onProcessPayment={handleProcessPayment}
      isProcessingPayment={isProcessingPayment}
      // Return desk
      onSearchInvoiceForReturn={handleSearchInvoiceForReturn}
      onCreateReturn={handleCreateReturn}
      returnReceipts={returnReceipts}
      loadingReturn={loadingReturn}
      // Customer list
      customers={customers}
      loadingCustomers={loadingCustomers}
      customerSearchKeyword={customerSearchKeyword}
      onCustomerSearchChange={setCustomerSearchKeyword}
      onSearchCustomerList={() => fetchCustomers({ keyword: customerSearchKeyword, limit: 20 })}
      onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      onSelectCustomerForCart={(cust) => {
        setCustomer(cust)
        setActiveTab('pos')
        message.success(`Đã gắn khách hàng ${cust.fullName} vào hóa đơn POS!`)
      }}
      onRefreshCustomers={() => fetchCustomers({ keyword: customerSearchKeyword, limit: 20 })}
    />
  )
}
