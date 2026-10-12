import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import CashierDesktop from '../../layout/desktop/cashier'
import { useAuthStore } from '../../../stores/authStore'
import { useCartStore } from '../../../stores/cartStore'
import { getProducts } from '../../../services/productService'
import { getCustomers, createCustomer } from '../../../services/customerService'
import { createInvoice, getInvoiceById } from '../../../services/invoiceService'
import { processPayment } from '../../../services/paymentService'
import { createReturnReceipt, getReturnReceipts } from '../../../services/returnReceiptService'
import { extractArray, extractObject } from '../../../utils/apiHelper'

export default function CashierContainer() {
  const user = useAuthStore((state) => state.user)

  // Zustand Cart Store
  const cartItems = useCartStore((state) => state.cartItems)
  const customer = useCartStore((state) => state.customer)
  const usePoints = useCartStore((state) => state.usePoints)
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const setCustomer = useCartStore((state) => state.setCustomer)
  const setUsePoints = useCartStore((state) => state.setUsePoints)
  const getSummary = useCartStore((state) => state.getSummary)

  const summary = getSummary()

  // Navigation tab
  const [activeTab, setActiveTab] = useState('pos')

  // Products
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
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

  // Return desk
  const [returnReceipts, setReturnReceipts] = useState([])
  const [loadingReturn, setLoadingReturn] = useState(false)

  // Customers tab
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('')

  // 1. Tải danh mục sản phẩm đang kinh doanh
  const fetchProducts = useCallback(async (keyword = '') => {
    setLoadingProducts(true)
    try {
      const res = await getProducts({
        keyword,
        productStatus: 'ON_SALE',
        limit: 50,
      })
      setProducts(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách sản phẩm')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // 2. Tải danh sách hội viên
  const fetchCustomers = useCallback(async (keyword = '') => {
    setLoadingCustomers(true)
    try {
      const res = await getCustomers({ keyword, limit: 20 })
      setCustomers(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách hội viên')
    } finally {
      setLoadingCustomers(false)
    }
  }, [])

  // 3. Tải danh sách phiếu trả hàng
  const fetchReturnReceipts = useCallback(async () => {
    try {
      const res = await getReturnReceipts({ limit: 10 })
      setReturnReceipts(extractArray(res))
    } catch {
      // Bỏ qua lỗi nhẹ
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchReturnReceipts()
  }, [fetchProducts, fetchCustomers, fetchReturnReceipts])

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
    if (!customerPhoneSearch.trim()) return
    try {
      const res = await getCustomers({ keyword: customerPhoneSearch.trim() })
      const list = extractArray(res)
      const found = list.find((c) => c.phoneNumber === customerPhoneSearch.trim()) || list[0]
      if (found) {
        setCustomer(found)
        message.success(`Đã tìm thấy khách hàng: ${found.fullName} (${found.loyaltyPoints || 0} điểm)`)
      } else {
        message.info('Không tìm thấy thông tin thành viên với SĐT này. Mở form đăng ký mới!')
        setIsRegisterModalOpen(true)
      }
    } catch (err) {
      message.error(err?.message || 'Có lỗi khi tìm kiếm khách hàng')
    }
  }

  // Đăng ký thành viên mới tại quầy
  const handleRegisterCustomer = async (values) => {
    setIsRegisteringCustomer(true)
    try {
      const res = await createCustomer(values)
      const newCust = extractObject(res)
      if (newCust) {
        message.success('Đăng ký thành viên mới thành công!')
        setCustomer(newCust)
        setCustomerPhoneSearch('')
        setIsRegisterModalOpen(false)
        fetchCustomers()
        return true
      }
    } catch (err) {
      message.error(err?.message || 'Đăng ký thành viên thất bại!')
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

      const res = await createInvoice(payload)
      const invoiceData = extractObject(res)
      if (invoiceData && invoiceData.invoiceId) {
        setPendingInvoice(invoiceData)
        setIsPaymentModalOpen(true)
      } else {
        message.error('Không thể tạo hóa đơn hoặc phản hồi máy chủ không hợp lệ!')
      }
    } catch (err) {
      message.error(err?.message || 'Không thể khởi tạo hóa đơn bán lẻ!')
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  // Xử lý xác nhận thanh toán (Tiền mặt hoặc VNPay)
  const handleProcessPayment = async ({ invoiceId, paymentMethod }) => {
    setIsProcessingPayment(true)
    try {
      const res = await processPayment({ invoiceId, paymentMethod })
      const data = extractObject(res)

      if (paymentMethod === 'VNPAY' && data?.paymentUrl) {
        return { paymentUrl: data.paymentUrl }
      }

      message.success('Thanh toán thành công! Đã hoàn tất hóa đơn.')
      clearCart()
      setPendingInvoice(null)
      setIsPaymentModalOpen(false)
      fetchProducts() // Cập nhật lại tồn kho sau khi bán
      fetchCustomers() // Cập nhật lại điểm thưởng
    } catch (err) {
      message.error(err?.message || 'Xử lý thanh toán thất bại!')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Tìm hóa đơn cho quầy trả hàng
  const handleSearchInvoiceForReturn = async (invoiceId) => {
    try {
      const res = await getInvoiceById(invoiceId)
      return extractObject(res)
    } catch (err) {
      message.error(err?.message || 'Không tìm thấy hóa đơn với mã này!')
      return null
    }
  }

  // Tạo phiếu trả hàng
  const handleCreateReturn = async (payload) => {
    setLoadingReturn(true)
    try {
      const res = await createReturnReceipt(payload)
      message.success(res?.message || 'Lập phiếu trả hàng & hoàn tiền thành công!')
      fetchReturnReceipts()
      fetchProducts()
      return true
    } catch (err) {
      message.error(err?.message || 'Không thể tạo phiếu trả hàng!')
      return false
    } finally {
      setLoadingReturn(false)
    }
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
        fetchProducts(val)
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
      onSearchCustomerList={() => fetchCustomers(customerSearchKeyword)}
      onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      onSelectCustomerForCart={(cust) => {
        setCustomer(cust)
        setActiveTab('pos')
        message.success(`Đã gắn khách hàng ${cust.fullName} vào hóa đơn POS!`)
      }}
      onRefreshCustomers={() => fetchCustomers(customerSearchKeyword)}
    />
  )
}
