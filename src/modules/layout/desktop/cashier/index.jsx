import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Divider,
} from 'antd'
import {
  ShoppingCartOutlined,
  SearchOutlined,
  DeleteOutlined,
  CreditCardOutlined,
} from '@ant-design/icons'
import DefaultLayout from '../../common/DefaultLayout'

const { Title, Text } = Typography

export default function CashierDesktop({
  user,
  products,
  cart,
  customerPhone,
  onCustomerPhoneChange,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = 0
  const total = subtotal - discount

  const cartColumns = [
    {
      title: 'Tên món',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <Tag color="blue">x{qty}</Tag>,
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (_, item) => (
        <Text strong style={{ color: '#1890ff' }}>
          {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_, item) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveFromCart(item.productId)}
        />
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          🛒 Quầy Thu Ngân Bán Hàng (POS Terminal)
        </Title>
        <Text type="secondary">
          Thu ngân đang trực: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        {/* Cột trái: Tìm kiếm & Danh mục sản phẩm để thêm vào đơn */}
        <Col xs={24} lg={14}>
          <Card
            title="Danh Mục Sản Phẩm Đang Bán (ON_SALE)"
            extra={<Input orientation="horizontal" prefix={<SearchOutlined />} placeholder="Tìm kiếm theo tên sản phẩm..." style={{ width: 240 }} />}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Row gutter={[12, 12]}>
              {products.map((prod) => (
                <Col xs={24} sm={12} key={prod.productId}>
                  <Card
                    hoverable
                    size="small"
                    style={{
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => onAddToCart(prod)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 15 }}>{prod.productName}</Text>
                      <Tag color="cyan">{prod.category?.categoryName || 'Sản phẩm'}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="success" style={{ fontWeight: 600, fontSize: 16 }}>
                        {prod.unitPrice.toLocaleString('vi-VN')} đ
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tồn: {prod.stockQuantity}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Cột phải: Giỏ hàng & Hóa đơn bán lẻ */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                <span>Hóa Đơn Hiện Tại ({cart.length} món)</span>
              </Space>
            }
            extra={
              cart.length > 0 && (
                <Button type="link" danger onClick={onClearCart}>
                  Làm mới
                </Button>
              )
            }
            style={{ borderRadius: 12 }}
          >
            {/* Nhập số điện thoại khách hàng */}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, marginBottom: 4, display: 'block' }}>
                Số điện thoại khách hàng (Tích điểm):
              </Text>
              <Input
                placeholder="Ví dụ: 0912345678"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                allowClear
              />
            </div>

            <Table
              columns={cartColumns}
              dataSource={cart}
              rowKey="productId"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có món hàng nào được chọn' }}
              style={{ marginBottom: 16 }}
            />

            <Divider style={{ margin: '12px 0' }} />

            {/* Chi tiết thanh toán */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">Tạm tính:</Text>
              <Text strong>{subtotal.toLocaleString('vi-VN')} đ</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">Chiết khấu hội viên:</Text>
              <Text type="danger">-{discount.toLocaleString('vi-VN')} đ</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Tổng Tiền:</Title>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {total.toLocaleString('vi-VN')} đ
              </Title>
            </div>

            <Button
              type="primary"
              size="large"
              block
              icon={<CreditCardOutlined />}
              disabled={cart.length === 0}
              onClick={onCheckout}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                borderRadius: 8,
              }}
            >
              Thanh Toán Hóa Đơn ({total.toLocaleString('vi-VN')} đ)
            </Button>
          </Card>
        </Col>
      </Row>
    </DefaultLayout>
  )
}
