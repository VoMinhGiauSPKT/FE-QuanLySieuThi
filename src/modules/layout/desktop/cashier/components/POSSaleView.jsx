import { useState, useMemo } from 'react'
import {
  Card,
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
import { formatCurrency } from '../../../../../utils/formatters'

const { Title, Text } = Typography

export default function POSSaleView({
  products,
  cartItems,
  customer,
  usePoints,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  // Thao tác khách hàng
  customerPhoneSearch,
  onCustomerPhoneSearchChange,
  onSearchCustomerByPhone,
  onOpenRegisterModal,
  onToggleUsePoints,
  onRemoveCustomer,
  // Thanh toán
  summary,
  onStartCheckout,
  isCreatingInvoice,
}) {
  const safeProducts = Array.isArray(products) ? products : []
  const [searchValue, setSearchValue] = useState('')
  const [showCustomerBar, setShowCustomerBar] = useState(false)

  // Danh sách gợi ý tìm kiếm theo tên hoặc mã sản phẩm
  const searchOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return safeProducts.slice(0, 8).map((prod) => ({
        value: prod.productId,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                }}
              >
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
    const filtered = safeProducts.filter(
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
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
              }}
            >
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
      onAddToCart(option.product)
      setSearchValue('')
    }
  }

  // Hỗ trợ quét mã vạch hoặc nhấn Enter trực tiếp
  const handleSearchEnter = () => {
    if (!searchValue.trim()) return
    const keyword = searchValue.toLowerCase().trim()
    const found = safeProducts.find(
      (p) =>
        p.productId?.toLowerCase() === keyword ||
        p.productName?.toLowerCase() === keyword ||
        p.productName?.toLowerCase().includes(keyword)
    )

    if (found) {
      onAddToCart(found)
      setSearchValue('')
    }
  }

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        background: '#ffffff',
        padding: '8px 12px',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header: Tạo hóa đơn */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title
          level={2}
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}
        >
          Tạo hóa đơn
        </Title>

        {/* Nút bật/tắt quản lý khách hàng thân thiết */}
        <Button
          type={customer ? 'primary' : 'text'}
          icon={<UserOutlined />}
          onClick={() => setShowCustomerBar(!showCustomerBar)}
          style={{
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 13,
            backgroundColor: customer ? '#e0e7ff' : undefined,
            color: customer ? '#3730a3' : '#6b7280',
            borderColor: customer ? '#c7d2fe' : undefined,
          }}
        >
          {customer ? `Khách: ${customer.fullName} (${customer.loyaltyPoints || 0} điểm)` : '+ Gắn khách hàng'}
        </Button>
      </div>

      {/* Dải thông tin khách hàng thân thiết (hiển thị khi bấm nút hoặc đã có khách) */}
      {(showCustomerBar || customer) && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {customer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                <Text strong style={{ fontSize: 14 }}>{customer.fullName}</Text>
                <Tag color="blue">{customer.phoneNumber}</Tag>
                <Tag color="gold" style={{ fontWeight: 600 }}>
                  <TrophyOutlined /> {customer.loyaltyPoints || 0} điểm tích lũy
                </Tag>
              </div>

              {customer.loyaltyPoints > 0 && (
                <Checkbox checked={usePoints} onChange={(e) => onToggleUsePoints(e.target.checked)}>
                  <span style={{ fontSize: 13, color: '#4b5563' }}>Dùng điểm giảm giá hóa đơn</span>
                </Checkbox>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 500 }}>
              <Input
                placeholder="Nhập số điện thoại khách hàng để tích điểm..."
                value={customerPhoneSearch}
                onChange={(e) => onCustomerPhoneSearchChange(e.target.value)}
                onPressEnter={onSearchCustomerByPhone}
                style={{ borderRadius: 6 }}
              />
              <Button type="primary" onClick={onSearchCustomerByPhone} style={{ borderRadius: 6 }}>
                Tìm
              </Button>
              <Button icon={<UserAddOutlined />} onClick={onOpenRegisterModal} style={{ borderRadius: 6 }}>
                Đăng Ký
              </Button>
            </div>
          )}

          {customer && (
            <Button size="small" type="text" danger onClick={onRemoveCustomer}>
              Bỏ chọn
            </Button>
          )}
        </div>
      )}

      {/* 2. Ô tìm kiếm sản phẩm hoặc quét mã vạch */}
      <div style={{ marginBottom: 20 }}>
        <AutoComplete
          options={searchOptions}
          style={{ width: '100%' }}
          value={searchValue}
          onChange={setSearchValue}
          onSelect={handleSelectProduct}
        >
          <Input
            size="large"
            placeholder="Tìm tên sản phẩm hoặc quét mã vạch"
            onPressEnter={handleSearchEnter}
            style={{
              height: 46,
              borderRadius: 8,
              fontSize: 14,
              borderColor: '#e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: 'none',
              paddingLeft: 16,
            }}
          />
        </AutoComplete>
      </div>

      {/* 3. Bảng danh sách sản phẩm trong hóa đơn */}
      <div
        style={{
          border: '1px solid #edf2f7',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 32,
          flex: 1,
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #edf2f7',
            padding: '14px 24px',
            color: '#64748b',
            fontWeight: 600,
            fontSize: 13,
            userSelect: 'none',
          }}
        >
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
          <div>
            {cartItems.map((item, index) => {
              const itemTotal = item.unitPrice * item.quantity
              const shortCode = item.productId || `SP00${index + 1}`

              return (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: index < cartItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {/* Cột 1: Thumbnail & Tên Sản Phẩm */}
                  <div style={{ flex: '2 1 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      SP
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>
                        Mã: {shortCode}
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Đơn Giá */}
                  <div style={{ flex: '1 1 0', textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#334155' }}>
                    {formatCurrency(item.unitPrice)}
                  </div>

                  {/* Cột 3: Bộ tăng giảm số lượng [-] [1] [+] */}
                  <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        overflow: 'hidden',
                        height: 34,
                        background: '#ffffff',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.productId, item.quantity - 1)}
                        style={{
                          width: 32,
                          height: 34,
                          background: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: 16,
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        –
                      </button>
                      <span
                        style={{
                          width: 42,
                          height: 34,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderLeft: '1px solid #e2e8f0',
                          borderRight: '1px solid #e2e8f0',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.productId, item.quantity + 1)}
                        style={{
                          width: 32,
                          height: 34,
                          background: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: 16,
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cột 4: Thành Tiền */}
                  <div style={{ flex: '1 1 0', textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    {formatCurrency(itemTotal)}
                  </div>

                  {/* Cột 5: Nút xóa đỏ 'x' */}
                  <div style={{ width: 40, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.productId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 6,
                        color: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        borderRadius: 4,
                      }}
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

      {/* 4. Footer Section */}
      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
        {/* Dòng Tổng cộng */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'baseline',
            gap: 20,
            marginBottom: 24,
          }}
        >
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
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#2563eb',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(summary.finalTotal)}
          </div>
        </div>

        {/* Hai nút hành động ở chân trang: [Hủy hóa đơn] và [Tạo hóa đơn] */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="large"
            onClick={onClearCart}
            disabled={cartItems.length === 0}
            style={{
              height: 46,
              borderRadius: 8,
              padding: '0 28px',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Hủy hóa đơn
          </Button>

          <Button
            type="primary"
            size="large"
            loading={isCreatingInvoice}
            disabled={cartItems.length === 0}
            onClick={onStartCheckout}
            style={{
              height: 46,
              borderRadius: 8,
              padding: '0 36px',
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            Tạo hóa đơn
          </Button>
        </div>
      </div>
    </Card>
  )
}
