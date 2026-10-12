import { Tabs, Typography } from 'antd'
import {
  ShoppingCartOutlined,
  RollbackOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import DefaultLayout from '../../common/DefaultLayout'
import POSSaleView from './components/POSSaleView'
import ReturnDeskView from './components/ReturnDeskView'
import CustomerListView from './components/CustomerListView'
import CustomerRegisterModal from './components/CustomerRegisterModal'
import PaymentProcessModal from './components/PaymentProcessModal'

const { Title, Text } = Typography

export default function CashierDesktop({
  user,
  activeTab,
  onTabChange,
  // POS sale
  products,
  loadingProducts,
  productSearch,
  onProductSearchChange,
  cartItems,
  customer,
  usePoints,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  customerPhoneSearch,
  onCustomerPhoneSearchChange,
  onSearchCustomerByPhone,
  onToggleUsePoints,
  onRemoveCustomer,
  summary,
  onStartCheckout,
  isCreatingInvoice,
  // Modals
  isRegisterModalOpen,
  onCloseRegisterModal,
  onRegisterCustomer,
  isRegisteringCustomer,
  isPaymentModalOpen,
  pendingInvoice,
  onClosePaymentModal,
  onProcessPayment,
  isProcessingPayment,
  // Return desk
  onSearchInvoiceForReturn,
  onCreateReturn,
  returnReceipts,
  loadingReturn,
  // Customer list
  customers,
  loadingCustomers,
  customerSearchKeyword,
  onCustomerSearchChange,
  onSearchCustomerList,
  onOpenRegisterModal,
  onSelectCustomerForCart,
  onRefreshCustomers,
}) {
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
          products={products}
          loadingProducts={loadingProducts}
          productSearch={productSearch}
          onProductSearchChange={onProductSearchChange}
          cartItems={cartItems}
          customer={customer}
          usePoints={usePoints}
          onAddToCart={onAddToCart}
          onUpdateCartQty={onUpdateCartQty}
          onRemoveFromCart={onRemoveFromCart}
          onClearCart={onClearCart}
          customerPhoneSearch={customerPhoneSearch}
          onCustomerPhoneSearchChange={onCustomerPhoneSearchChange}
          onSearchCustomerByPhone={onSearchCustomerByPhone}
          onOpenRegisterModal={onOpenRegisterModal}
          onToggleUsePoints={onToggleUsePoints}
          onRemoveCustomer={onRemoveCustomer}
          summary={summary}
          onStartCheckout={onStartCheckout}
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
      children: (
        <ReturnDeskView
          onSearchInvoice={onSearchInvoiceForReturn}
          onCreateReturn={onCreateReturn}
          returnReceipts={returnReceipts}
          loadingReturn={loadingReturn}
        />
      ),
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
          customers={customers}
          loading={loadingCustomers}
          searchKeyword={customerSearchKeyword}
          onSearchChange={onCustomerSearchChange}
          onSearch={onSearchCustomerList}
          onOpenRegisterModal={onOpenRegisterModal}
          onSelectCustomerForCart={onSelectCustomerForCart}
          onRefresh={onRefreshCustomers}
        />
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          🛒 Quầy Thu Ngân Bán Hàng & Tiếp Nhận Khách Hàng
        </Title>
        <Text type="secondary">
          Thu ngân đang trực: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        size="large"
        type="card"
        style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      />

      {/* Modal đăng ký thành viên */}
      <CustomerRegisterModal
        open={isRegisterModalOpen}
        initialPhone={customerPhoneSearch}
        onCancel={onCloseRegisterModal}
        onRegister={onRegisterCustomer}
        loading={isRegisteringCustomer}
      />

      {/* Modal thanh toán */}
      {isPaymentModalOpen && pendingInvoice && (
        <PaymentProcessModal
          open={isPaymentModalOpen}
          invoiceData={pendingInvoice}
          onCancel={onClosePaymentModal}
          onProcessPayment={onProcessPayment}
          loading={isProcessingPayment}
        />
      )}
    </DefaultLayout>
  )
}
