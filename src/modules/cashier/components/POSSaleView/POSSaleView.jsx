import { useState, useMemo } from 'react'
import {
  Input,
  Button,
  Space,
  Typography,
  AutoComplete,
  Empty,
  Tag,
  Checkbox,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  CloseOutlined,
  UserOutlined,
  UserAddOutlined,
  TrophyOutlined,
  BarcodeOutlined,
} from '@ant-design/icons'
import { useCartStore } from '../../../../stores/cartStore'
import { useProductStore } from '../../../../stores/productStore'
import { useCustomerStore } from '../../../../stores/customerStore'
import { formatCurrency } from '../../../../utils/formatters'
import './POSSaleView.scss'

const { Title, Text } = Typography

export default function POSSaleView({ onStartCheckout, onOpenRegisterModal, isCreatingInvoice }) {
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

  // Zustand Product Store
  const products = useProductStore((state) => state.products)
  const safeProducts = Array.isArray(products) ? products : []

  // Zustand Customer Store
  const searchCustomerByPhone = useCustomerStore((state) => state.searchCustomerByPhone)

  // Local component states
  const [searchValue, setSearchValue] = useState('')
  const [showCustomerBar, setShowCustomerBar] = useState(false)
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [searchingCustomer, setSearchingCustomer] = useState(false)

  // Gợi ý tìm kiếm sản phẩm theo tên hoặc mã
  const searchOptions = useMemo(() => {
    const list = safeProducts
    if (!searchValue.trim()) {
      return list.slice(0, 8).map((prod) => ({
        value: prod.productId,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="pos-sale-view__item-badge" style={{ width: 32, height: 32, fontSize: 11 }}>
                SP
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{prod.productName}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Mã: {prod.productId || 'SP'} • Tồn: {prod.stockQuantity}
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 14 }}>
              {formatCurrency(prod.unitPrice)}
            </div>
          </div>
        ),
        product: prod,
      }))
    }

    const keyword = searchValue.toLowerCase().trim()
    const filtered = list.filter(
      (p) =>
        p.productName?.toLowerCase().includes(keyword) ||
        p.productId?.toLowerCase().includes(keyword) ||
        p.categoryName?.toLowerCase().includes(keyword)
    )

    return filtered.slice(0, 10).map((prod) => ({
      value: prod.productId,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pos-sale-view__item-badge" style={{ width: 32, height: 32, fontSize: 11 }}>
              SP
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{prod.productName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Mã: {prod.productId || 'SP'} • Tồn: {prod.stockQuantity}
              </div>
            </div>
          </div>
          <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 14 }}>
            {formatCurrency(prod.unitPrice)}
          </div>
        </div>
      ),
      product: prod,
    }))
  }, [safeProducts, searchValue])

  const handleSelectProduct = (productId, option) => {
    if (option?.product) {
      addToCart(option.product)
      setSearchValue('')
    }
  }

  // Quét mã vạch hoặc nhấn Enter trực tiếp
  const handleSearchEnter = () => {
    if (!searchValue.trim()) return
    const keyword = searchValue.toLowerCase().trim()
    const found = safeProducts.find(
      (p) =>
        p.productId?.toLowerCase() === keyword ||
        p.barcode?.toLowerCase() === keyword ||
        p.productName?.toLowerCase().includes(keyword)
    )

    if (found) {
      addToCart(found)
      setSearchValue('')
    }
  }

  // Tìm khách hàng bằng số điện thoại
  const handleSearchCustomer = async () => {
    if (!customerPhoneInput.trim()) return
    setSearchingCustomer(true)
    try {
      const foundCust = await searchCustomerByPhone(customerPhoneInput.trim())
      if (foundCust) {
        setCustomer(foundCust)
      }
    } finally {
      setSearchingCustomer(false)
    }
  }

  return (
    <div className="pos-sale-view">
      {/* 1. Header: Tiêu đề & Gắn khách hàng */}
      <div className="pos-sale-view__header">
        <Title level={2} className="title">
          Tạo hóa đơn
        </Title>

        <div>
          {customer ? (
            <Space align="center" style={{ background: '#f0fdf4', padding: '6px 14px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
              <UserOutlined style={{ color: '#16a34a' }} />
              <Text strong style={{ color: '#15803d', fontSize: 13 }}>
                {customer.fullName} ({customer.phoneNumber})
              </Text>
              <Tag color="gold" style={{ marginRight: 0 }}>
                <TrophyOutlined /> {customer.points || 0} điểm
              </Tag>
              <Button
                type="text"
                size="small"
                danger
                onClick={() => setCustomer(null)}
                style={{ height: 22, padding: '0 4px', fontSize: 12 }}
              >
                Gỡ
              </Button>
            </Space>
          ) : (
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => setShowCustomerBar(!showCustomerBar)}
              style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}
            >
              + Gắn khách hàng
            </Button>
          )}
        </div>
      </div>

      {/* Thanh tìm kiếm khách hàng mở rộng */}
      {showCustomerBar && !customer && (
        <div className="pos-sale-view__customer-box">
          <Space>
            <UserOutlined style={{ color: '#2563eb' }} />
            <Text style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 500 }}>
              Tìm khách hàng thân thiết:
            </Text>
          </Space>
          <Space.Compact style={{ maxWidth: 360, width: '100%' }}>
            <Input
              placeholder="Nhập số điện thoại khách hàng"
              value={customerPhoneInput}
              onChange={(e) => setCustomerPhoneInput(e.target.value)}
              onPressEnter={handleSearchCustomer}
              size="middle"
            />
            <Button
              type="primary"
              loading={searchingCustomer}
              onClick={handleSearchCustomer}
            >
              Tìm
            </Button>
          </Space.Compact>
          {onOpenRegisterModal && (
            <Button
              type="dashed"
              icon={<UserAddOutlined />}
              onClick={() => onOpenRegisterModal(customerPhoneInput)}
              style={{ fontSize: 13 }}
            >
              Đăng ký mới
            </Button>
          )}
        </div>
      )}

      {/* 2. Ô tìm kiếm sản phẩm hoặc quét mã vạch */}
      <div className="pos-sale-view__search-container">
        <AutoComplete
          value={searchValue}
          options={searchOptions}
          onSelect={handleSelectProduct}
          onChange={setSearchValue}
          style={{ width: '100%' }}
        >
          <Input
            placeholder="Tìm tên sản phẩm hoặc quét mã vạch"
            prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: 18, marginRight: 8 }} />}
            suffix={
              <Tooltip title="Nhấn Enter để thêm trực tiếp sản phẩm đầu tiên tìm thấy hoặc thiết bị quét mã vạch">
                <BarcodeOutlined style={{ color: '#94a3b8', fontSize: 20, cursor: 'pointer' }} />
              </Tooltip>
            }
            onPressEnter={handleSearchEnter}
            className="search-input"
          />
        </AutoComplete>
      </div>

      {/* 3. Bảng danh sách sản phẩm trong hóa đơn */}
      <div className="pos-sale-view__table-wrapper">
        {/* Table Header */}
        <div className="pos-sale-view__table-header">
          <div style={{ flex: '2 1 0', textAlign: 'left' }}>Sản phẩm</div>
          <div style={{ flex: '1 1 0', textAlign: 'center' }}>Đơn giá</div>
          <div style={{ flex: '1 1 0', textAlign: 'center' }}>Số lượng</div>
          <div style={{ flex: '1 1 0', textAlign: 'center' }}>Thành tiền</div>
          <div style={{ width: 40, textAlign: 'center' }}></div>
        </div>

        {/* Table Body / Rows */}
        {cartItems.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#94a3b8', fontSize: 14 }}>
                  Chưa có sản phẩm nào. Hãy tìm kiếm tên hoặc quét mã vạch ở ô phía trên!
                </span>
              }
            />
          </div>
        ) : (
          <div className="pos-sale-view__table-body">
            {cartItems.map((item, index) => {
              const itemTotal = item.unitPrice * item.quantity
              const shortCode = item.productId || `SP00${index + 1}`

              return (
                <div
                  key={item.productId}
                  className={`pos-sale-view__table-row ${index < cartItems.length - 1 ? 'pos-sale-view__table-row--bordered' : ''}`}
                >
                  {/* Cột 1: Thông tin sản phẩm */}
                  <div style={{ flex: '2 1 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="pos-sale-view__item-badge">
                      SP
                    </div>
                    <div>
                      <div className="pos-sale-view__item-name">
                        {item.productName}
                      </div>
                      <div className="pos-sale-view__item-code">
                        Mã: {shortCode}
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Đơn giá */}
                  <div style={{ flex: '1 1 0', textAlign: 'center', color: '#1e293b', fontSize: 14, fontWeight: 500 }}>
                    {formatCurrency(item.unitPrice)}
                  </div>

                  {/* Cột 3: Bộ tăng/giảm số lượng */}
                  <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                    <div className="pos-sale-view__qty-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="stepper-btn"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="qty-display">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="stepper-btn"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cột 4: Thành tiền */}
                  <div style={{ flex: '1 1 0', textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                    {formatCurrency(itemTotal)}
                  </div>

                  {/* Cột 5: Nút xóa */}
                  <div style={{ width: 40, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="pos-sale-view__delete-btn"
                      title="Xóa sản phẩm"
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tùy chọn sử dụng điểm tích lũy */}
      {customer && (customer.points || 0) > 0 && cartItems.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
          <Checkbox
            checked={usePoints}
            onChange={(e) => setUsePoints(e.target.checked)}
          >
            <Text style={{ fontSize: 14 }}>
              Dùng điểm thưởng ({customer.points} điểm = {formatCurrency(customer.points * 1000)})
            </Text>
          </Checkbox>
        </div>
      )}

      {/* 4. Footer Section - Ghim cố định ở chân trang */}
      <div className="pos-sale-view__footer">
        {/* Dòng Tổng cộng */}
        <div className="pos-sale-view__total-display">
          {summary.discount > 0 && (
            <div style={{ marginRight: 16 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>Chiết khấu điểm: </Text>
              <Text strong type="danger" style={{ fontSize: 16 }}>
                -{formatCurrency(summary.discount)}
              </Text>
            </div>
          )}

          <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>
            Tổng cộng:
          </Text>
          <div className="total-amount">
            {formatCurrency(summary.finalTotal)}
          </div>
        </div>

        {/* Hai nút hành động ở chân trang: [Hủy hóa đơn] và [Tạo hóa đơn] */}
        <div className="pos-sale-view__actions">
          <Button
            size="large"
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="clear-btn"
          >
            Hủy hóa đơn
          </Button>

          <Button
            type="primary"
            size="large"
            loading={isCreatingInvoice}
            disabled={cartItems.length === 0}
            onClick={onStartCheckout}
            className="checkout-btn"
          >
            Tạo hóa đơn
          </Button>
        </div>
      </div>
    </div>
  )
}
