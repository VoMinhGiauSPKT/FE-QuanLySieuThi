import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Typography, message } from 'antd'
import {
  ShoppingCartOutlined,
  RollbackOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { DefaultLayout } from '../../layouts'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useProductStore } from '../../stores/productStore'
import { useCustomerStore } from '../../stores/customerStore'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { usePaymentStore } from '../../stores/paymentStore'
import POSSaleView from './components/POSSaleView/POSSaleView'
import ReturnDeskView from './components/ReturnDeskView/ReturnDeskView'
import CustomerListView from './components/CustomerListView/CustomerListView'
import CustomerRegisterModal from './components/CustomerRegisterModal/CustomerRegisterModal'
import PaymentProcessModal from './components/PaymentProcessModal/PaymentProcessModal'
import './CashierPage.scss'

const { Title, Text } = Typography

export default function CashierPage() {
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()

  // Stores
  const { cartItems, customer, usePoints, clearCart, setCustomer, getSummary } = useCartStore()
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const createCustomer = useCustomerStore((state) => state.createCustomer)
  const createInvoice = useInvoiceStore((state) => state.createInvoice)
  const cancelInvoice = useInvoiceStore((state) => state.cancelInvoice)
  const processPayment = usePaymentStore((state) => state.processPayment)

  // Tab & Modals State
  const [activeTab, setActiveTab] = useState('pos')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registerInitialPhone, setRegisterInitialPhone] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [pendingInvoice, setPendingInvoice] = useState(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [isCancelingInvoice, setIsCancelingInvoice] = useState(false)

  // Load products when mounting
  useEffect(() => {
    fetchProducts({ limit: 100 })
  }, [fetchProducts])

  // Lắng nghe kết quả điều hướng trở lại từ cổng VNPay Sandbox
  useEffect(() => {
    const vnpayStatus = searchParams.get('vnpay_status')
    const invoiceId = searchParams.get('invoice_id')
    const txnRef = searchParams.get('txnRef')

    if (vnpayStatus === 'success') {
      message.success(`Thanh toán VNPay thành công cho hóa đơn #${invoiceId || txnRef || ''}!`)
      clearCart()
      fetchProducts({ limit: 100 })
      searchParams.delete('vnpay_status')
      searchParams.delete('invoice_id')
      searchParams.delete('txnRef')
      setSearchParams(searchParams, { replace: true })
    } else if (vnpayStatus === 'cancel') {
      message.warning(`Giao dịch VNPay đã bị hủy. Hóa đơn #${invoiceId || txnRef || ''} đã chuyển sang trạng thái HỦY và hoàn lại tồn kho!`)
      fetchProducts({ limit: 100 })
      searchParams.delete('vnpay_status')
      searchParams.delete('invoice_id')
      searchParams.delete('txnRef')
      searchParams.delete('code')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, clearCart, fetchProducts])

  // Đăng ký khách hàng mới
  const handleOpenRegisterModal = (phone = '') => {
    setRegisterInitialPhone(phone)
    setIsRegisterModalOpen(true)
  }

  const handleRegisterCustomer = async (formData) => {
    setIsRegistering(true)
    try {
      const res = await createCustomer(formData)
      const newCust = res?.customerId ? res : (res?.data?.customerId ? res.data : null)
      if (newCust) {
        setCustomer(newCust)
        message.success('Đăng ký khách hàng thành công!')
        setIsRegisterModalOpen(false)
        return true
      }
    } finally {
      setIsRegistering(false)
    }
    return false
  }

  // Bắt đầu thanh toán
  const handleStartCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      message.warning('Giỏ hàng đang trống, vui lòng thêm sản phẩm!')
      return
    }

    setIsCreatingInvoice(true)
    try {
      // Đúng schema BE: Module 7, customerId, useLoyaltyPoints, items: [{ productId, quantity }]
      // Không truyền invoiceId vì mã tự sinh trong BE
      const payload = {
        customerId: customer?.customerId || null,
        useLoyaltyPoints: Boolean(usePoints),
        usePoints: Boolean(usePoints),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const res = await createInvoice(payload)
      const invoiceData = res?.invoiceId ? res : (res?.data?.invoiceId ? res.data : null)
      if (invoiceData) {
        const summary = getSummary()
        setPendingInvoice({
          ...invoiceData,
          finalTotal: invoiceData.finalAmount ?? invoiceData.finalTotal ?? summary.finalTotal,
          discountAmount: invoiceData.discountAmount ?? summary.discount,
        })
        setIsPaymentModalOpen(true)
      }
    } finally {
      setIsCreatingInvoice(false)
    }
  }, [cartItems, customer, usePoints, createInvoice, getSummary])

  // Xử lý xác nhận thanh toán
  const handleProcessPayment = async ({ invoiceId, paymentMethod }) => {
    setIsProcessingPayment(true)
    try {
      const res = await processPayment({
        invoiceId,
        paymentMethod,
        amount: pendingInvoice?.finalTotal,
      })

      const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl
      if (paymentUrl) {
        // Có link VNPay sandbox -> chuyển hướng trình duyệt ngay lập tức sang Sandbox!
        window.location.href = paymentUrl
        return { paymentUrl }
      }

      // Thanh toán tiền mặt thành công tại quầy
      message.success('Thanh toán tiền mặt thành công!')
      setIsPaymentModalOpen(false)
      setPendingInvoice(null)
      clearCart()
      fetchProducts({ limit: 100 })
      return { success: true }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Hủy hóa đơn khi bấm Hủy trong modal thanh toán
  const handleCancelPayment = async () => {
    if (pendingInvoice?.invoiceId) {
      setIsCancelingInvoice(true)
      try {
        await cancelInvoice(pendingInvoice.invoiceId)
        await fetchProducts({ limit: 100 })
      } finally {
        setIsCancelingInvoice(false)
      }
    }
    setIsPaymentModalOpen(false)
    setPendingInvoice(null)
  }

  const tabItems = [
    {
      key: 'pos',
      label: (
        <span>
          <ShoppingCartOutlined /> Bán Hàng (POS Terminal)
        </span>
      ),
      children: (
        <POSSaleView
          onStartCheckout={handleStartCheckout}
          onOpenRegisterModal={handleOpenRegisterModal}
          isCreatingInvoice={isCreatingInvoice}
        />
      ),
    },
    {
      key: 'return',
      label: (
        <span>
          <RollbackOutlined /> Quầy Tiếp Nhận Trả Hàng
        </span>
      ),
      children: <ReturnDeskView />,
    },
    {
      key: 'customers',
      label: (
        <span>
          <UsergroupAddOutlined /> Khách Hàng Thành Viên
        </span>
      ),
      children: (
        <CustomerListView
          onOpenRegisterModal={() => handleOpenRegisterModal()}
          onSelectCustomerForCart={(cust) => {
            setCustomer(cust)
            setActiveTab('pos')
            message.success(`Đã chọn khách hàng: ${cust.fullName}`)
          }}
        />
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div className="cashier-page__header">
        <Title level={2} className="page-title">
          <ShoppingCartOutlined className="title-icon" />
          Quầy Thu Ngân Bán Hàng & Tiếp Nhận Khách Hàng
        </Title>
        <Text type="secondary">
          Thu ngân đang trực: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        type="card"
        className="cashier-page__tabs"
      />

      {/* Modal đăng ký thành viên */}
      <CustomerRegisterModal
        open={isRegisterModalOpen}
        initialPhone={registerInitialPhone}
        onCancel={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterCustomer}
        loading={isRegistering}
      />

      {/* Modal thanh toán */}
      {isPaymentModalOpen && pendingInvoice && (
        <PaymentProcessModal
          open={isPaymentModalOpen}
          invoiceData={pendingInvoice}
          onCancel={handleCancelPayment}
          onProcessPayment={handleProcessPayment}
          loading={isProcessingPayment}
          cancelLoading={isCancelingInvoice}
        />
      )}
    </DefaultLayout>
  )
}
