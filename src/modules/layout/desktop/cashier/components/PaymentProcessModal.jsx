import { useState } from 'react'
import {
  Modal,
  Radio,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Card,
} from 'antd'
import {
  DollarOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { formatCurrency } from '../../../../../utils/formatters'

const { Title, Text } = Typography

export default function PaymentProcessModal({
  open,
  invoiceData,
  onCancel,
  onProcessPayment,
  loading,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [cashGiven, setCashGiven] = useState(0)
  const [vnpayUrl, setVnpayUrl] = useState('')

  if (!open || !invoiceData) return null

  const totalAmount = invoiceData?.finalTotal || 0
  const changeAmount = Math.max(0, cashGiven - totalAmount)

  const handleQuickCash = (amount) => {
    setCashGiven(amount)
  }

  const handleConfirm = async () => {
    if (!invoiceData?.invoiceId) return
    const res = await onProcessPayment({
      invoiceId: invoiceData.invoiceId,
      paymentMethod,
    })

    if (res?.paymentUrl) {
      setVnpayUrl(res.paymentUrl)
    }
  }

  const invoiceShortId = invoiceData?.invoiceId ? String(invoiceData.invoiceId).substring(0, 8) : ''

  return (
    <Modal
      title={
        <Space>
          <CreditCardOutlined style={{ color: '#52c41a' }} />
          <span>Thanh Toán Hóa Đơn Bán Lẻ #{invoiceShortId}</span>
        </Space>
      }
      open={open}
      onCancel={() => {
        setVnpayUrl('')
        onCancel()
      }}
      footer={null}
      width={560}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', margin: '16px 0 24px 0' }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tổng tiền thanh toán
        </Text>
        <Title level={2} style={{ margin: '4px 0', color: '#52c41a', fontWeight: 700 }}>
          {formatCurrency(totalAmount)}
        </Title>
        {invoiceData?.discountAmount > 0 && (
          <Text type="danger" style={{ fontSize: 13 }}>
            (Đã trừ chiết khấu điểm: {formatCurrency(invoiceData.discountAmount)})
          </Text>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Phương thức thanh toán:
        </Text>
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value)
            setVnpayUrl('')
          }}
          buttonStyle="solid"
          size="large"
          style={{ width: '100%', display: 'flex' }}
        >
          <Radio.Button value="CASH" style={{ flex: 1, textAlign: 'center' }}>
            <DollarOutlined /> Tiền Mặt (CASH)
          </Radio.Button>
          <Radio.Button value="VNPAY" style={{ flex: 1, textAlign: 'center' }}>
            <QrcodeOutlined /> VNPay (Quét Mã QR)
          </Radio.Button>
        </Radio.Group>
      </div>

      {paymentMethod === 'CASH' ? (
        <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
          <div style={{ marginBottom: 12 }}>
            <Text strong>Tiền khách đưa (VNĐ):</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 6 }}
              size="large"
              value={cashGiven}
              onChange={(val) => setCashGiven(val || 0)}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
              Chọn nhanh:
            </Text>
            <Space size="small" wrap>
              <Button size="small" onClick={() => handleQuickCash(totalAmount)}>
                Đúng tiền ({formatCurrency(totalAmount)})
              </Button>
              <Button size="small" onClick={() => handleQuickCash(50000)}>
                50,000 đ
              </Button>
              <Button size="small" onClick={() => handleQuickCash(100000)}>
                100,000 đ
              </Button>
              <Button size="small" onClick={() => handleQuickCash(200000)}>
                200,000 đ
              </Button>
              <Button size="small" onClick={() => handleQuickCash(500000)}>
                500,000 đ
              </Button>
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 15 }}>
              Tiền thừa thối lại:
            </Text>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              {formatCurrency(changeAmount)}
            </Title>
          </div>
        </Card>
      ) : (
        <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
          {vnpayUrl ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Alert
                type="info"
                message="Đã tạo liên kết thanh toán VNPay!"
                description="Bấm vào nút bên dưới để chuyển hướng khách sang cổng thanh toán quét mã QR của VNPay."
                style={{ marginBottom: 16 }}
              />
              <Button
                type="primary"
                size="large"
                href={vnpayUrl}
                target="_blank"
                icon={<QrcodeOutlined />}
                style={{ height: 44, borderRadius: 8, backgroundColor: '#005baa' }}
              >
                Mở Cổng VNPay Quét Mã
              </Button>
            </div>
          ) : (
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <Text type="secondary">
                Hệ thống sẽ kết nối với cổng thanh toán điện tử VNPay để tạo mã QR thanh toán tức thời.
              </Text>
            </div>
          )}
        </Card>
      )}

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>Hủy Bỏ</Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            loading={loading}
            disabled={paymentMethod === 'CASH' && cashGiven < totalAmount && cashGiven > 0}
            onClick={handleConfirm}
            style={{
              borderRadius: 8,
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              fontWeight: 600,
            }}
          >
            {paymentMethod === 'CASH'
              ? 'Xác Nhận Thu Tiền & Hoàn Tất'
              : vnpayUrl
                ? 'Hoàn Tất Sau Khi Khách Quét Mã'
                : 'Tạo Mã Thanh Toán VNPay'}
          </Button>
        </Space>
      </div>
    </Modal>
  )
}
