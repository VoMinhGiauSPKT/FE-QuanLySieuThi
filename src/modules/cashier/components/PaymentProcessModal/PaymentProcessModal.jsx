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
  cancelLoading,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [cashGiven, setCashGiven] = useState(null)
  const [vnpayUrl, setVnpayUrl] = useState('')

  if (!open || !invoiceData) return null

  const totalAmount = invoiceData?.finalTotal || 0
  const isCashEntered = cashGiven !== null && cashGiven !== undefined
  const isCashSufficient = isCashEntered && typeof cashGiven === 'number' && cashGiven >= totalAmount
  const isCashDeficit = isCashEntered && typeof cashGiven === 'number' && cashGiven < totalAmount
  const changeAmount = isCashSufficient ? (cashGiven - totalAmount) : 0
  const deficitAmount = isCashDeficit ? (totalAmount - cashGiven) : 0

  const handleQuickCash = (amount) => {
    setCashGiven(amount)
  }

  const handleConfirm = async () => {
    if (!invoiceData?.invoiceId) return
    if (paymentMethod === 'CASH' && !isCashSufficient) {
      return
    }
    const methodToSend = paymentMethod === 'VNPAY' ? 'BANK_TRANSFER' : paymentMethod
    const res = await onProcessPayment({
      invoiceId: invoiceData.invoiceId,
      paymentMethod: methodToSend,
    })

    if (res?.paymentUrl) {
      window.location.href = res.paymentUrl
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
        if (!loading && !cancelLoading) {
          setVnpayUrl('')
          onCancel()
        }
      }}
      maskClosable={!loading && !cancelLoading}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>
                Tiền khách đưa (VNĐ): <span style={{ color: '#ff4d4f' }}>*</span>
              </Text>
              {isCashDeficit && (
                <Text type="danger" style={{ fontSize: 13, fontWeight: 600 }}>
                  (Còn thiếu {formatCurrency(deficitAmount)})
                </Text>
              )}
            </div>
            <InputNumber
              style={{ width: '100%', marginTop: 6 }}
              size="large"
              placeholder="Nhập số tiền khách đưa..."
              value={cashGiven}
              onChange={(val) => setCashGiven(val !== null && val !== undefined ? val : null)}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              min={0}
              status={isCashDeficit ? 'error' : ''}
            />
            {!isCashEntered && (
              <div style={{ marginTop: 4 }}>
                <Text type="danger" style={{ fontSize: 12 }}>
                  * Bắt buộc phải nhập số tiền khách đưa
                </Text>
              </div>
            )}
            {isCashDeficit && (
              <div style={{ marginTop: 4 }}>
                <Text type="danger" style={{ fontSize: 12 }}>
                  * Số tiền khách đưa phải lớn hơn hoặc bằng tổng tiền ({formatCurrency(totalAmount)})
                </Text>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
              Chọn nhanh:
            </Text>
            <Space size="small" wrap>
              <Button
                size="small"
                type={cashGiven === totalAmount ? 'primary' : 'default'}
                onClick={() => handleQuickCash(totalAmount)}
              >
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
              {isCashDeficit ? 'Còn thiếu:' : 'Tiền thừa thối lại:'}
            </Text>
            <Title
              level={4}
              style={{
                margin: 0,
                color: isCashDeficit ? '#ff4d4f' : '#1890ff',
              }}
            >
              {!isCashEntered
                ? '0 đ'
                : isCashDeficit
                  ? formatCurrency(deficitAmount)
                  : formatCurrency(changeAmount)}
            </Title>
          </Flex>
        </Card>
      ) : (
        <Card size="small" className="payment-process-modal__card">
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <QrcodeOutlined style={{ fontSize: 44, color: '#005baa', marginBottom: 12 }} />
            <Title level={4} style={{ margin: '0 0 8px 0', color: '#005baa' }}>
              Cổng Thanh Toán Trực Tuyến VNPay Sandbox
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Bấm nút <strong>"Chuyển Đến Cổng Thanh Toán VNPay"</strong> bên dưới. Hệ thống sẽ kết nối trực tiếp đến cổng VNPay Sandbox để khách quét mã QR hoặc chọn ngân hàng thanh toán.
            </Text>
            <Alert
              type="info"
              showIcon
              message="Tự động đồng bộ hóa đơn"
              description="Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật hóa đơn sang 'ĐÃ THANH TOÁN' và quay về máy POS. Nếu không chuyển khoản hoặc hủy giao dịch, hóa đơn sẽ tự động chuyển sang 'HỦY' và hoàn trả tồn kho."
              style={{ textAlign: 'left', fontSize: 13 }}
            />
          </div>
        </Card>
      )}

      <div className="payment-process-modal__actions">
        <Space>
          <Button onClick={onCancel} loading={cancelLoading} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            loading={loading}
            disabled={
              cancelLoading ||
              (paymentMethod === 'CASH' && !isCashSufficient)
            }
            onClick={handleConfirm}
            className="confirm-btn"
          >
            {paymentMethod === 'CASH'
              ? 'Xác Nhận Thu Tiền & Hoàn Tất'
              : 'Chuyển Đến Cổng Thanh Toán VNPay'}
          </Button>
        </Space>
      </div>
    </Modal>
  )
}
