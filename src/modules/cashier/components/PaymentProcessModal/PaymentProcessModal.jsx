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
  Flex,
} from 'antd'
import {
  DollarOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { formatCurrency } from '../../../../utils/formatters'
import './PaymentProcessModal.scss'

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
      className="payment-process-modal"
    >
      <div className="payment-process-modal__header">
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tổng tiền thanh toán
        </Text>
        <Title level={2} className="total-title">
          {formatCurrency(totalAmount)}
        </Title>
        {invoiceData?.discountAmount > 0 && (
          <Text type="danger" style={{ fontSize: 13 }}>
            (Đã trừ chiết khấu điểm: {formatCurrency(invoiceData.discountAmount)})
          </Text>
        )}
      </div>

      <div className="payment-process-modal__methods">
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
          className="payment-process-modal__method-group"
        >
          <Radio.Button value="CASH">
            <DollarOutlined /> Tiền Mặt (CASH)
          </Radio.Button>
          <Radio.Button value="VNPAY">
            <QrcodeOutlined /> VNPay (Quét Mã QR)
          </Radio.Button>
        </Radio.Group>
      </div>

      {paymentMethod === 'CASH' ? (
        <Card size="small" className="payment-process-modal__card">
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

          <Flex align="center" justify="space-between">
            <Text strong style={{ fontSize: 15 }}>
              Tiền thừa thối lại:
            </Text>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              {formatCurrency(changeAmount)}
            </Title>
          </Flex>
        </Card>
      ) : (
        <Card size="small" className="payment-process-modal__card">
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

      <div className="payment-process-modal__actions">
        <Space>
          <Button onClick={onCancel}>Hủy Bỏ</Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            loading={loading}
            disabled={paymentMethod === 'CASH' && cashGiven < totalAmount && cashGiven > 0}
            onClick={handleConfirm}
            className="confirm-btn"
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
