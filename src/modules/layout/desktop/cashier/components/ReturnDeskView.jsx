import { useState, useEffect } from 'react'
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  InputNumber,
  Divider,
  Alert,
  Popconfirm,
  Descriptions,
} from 'antd'
import {
  SearchOutlined,
  RollbackOutlined,
  HistoryOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime } from '../../../../../utils/formatters'
import { useReturnReceiptStore } from '../../../../../stores/returnReceiptStore'
import { useInvoiceStore } from '../../../../../stores/invoiceStore'

const { Title, Text } = Typography

export default function ReturnDeskView({
  onSearchInvoice,
  onCreateReturn,
  returnReceipts: propReturnReceipts,
  loadingReturn: propLoadingReturn,
}) {
  const returnReceiptStore = useReturnReceiptStore()
  const invoiceStore = useInvoiceStore()

  const returnReceipts = propReturnReceipts ?? returnReceiptStore.returnReceipts
  const loadingReturn = propLoadingReturn ?? returnReceiptStore.loading

  const [searchInvoiceId, setSearchInvoiceId] = useState('')
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [selectedReturns, setSelectedReturns] = useState({}) // { [productId]: quantity }
  const [returnReason, setReturnReason] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!propReturnReceipts) {
      returnReceiptStore.fetchReturnReceipts({ limit: 10 })
    }
  }, [propReturnReceipts])

  const handleSearch = async () => {
    if (!searchInvoiceId.trim()) return
    setSearching(true)
    let result = null
    if (onSearchInvoice) {
      result = await onSearchInvoice(searchInvoiceId.trim())
    } else {
      result = await invoiceStore.fetchInvoiceDetail(searchInvoiceId.trim())
    }
    setInvoiceDetail(result)
    setSelectedReturns({})
    setSearching(false)
  }

  const handleReturnQtyChange = (productId, qty) => {
    setSelectedReturns((prev) => ({
      ...prev,
      [productId]: qty,
    }))
  }

  // Tính tổng tiền hoàn lại
  const itemsToReturn = invoiceDetail?.items?.filter(
    (item) => selectedReturns[item.productId] > 0
  ) || []

  const totalRefund = itemsToReturn.reduce(
    (sum, item) => sum + item.unitPrice * (selectedReturns[item.productId] || 0),
    0
  )

  const handleConfirmReturn = async () => {
    if (!invoiceDetail?.invoiceId || itemsToReturn.length === 0) return
    const payload = {
      invoiceId: invoiceDetail.invoiceId,
      reason: returnReason || 'Khách đổi trả tại quầy',
      items: itemsToReturn.map((item) => ({
        productId: item.productId,
        returnQuantity: selectedReturns[item.productId],
      })),
    }

    const ok = onCreateReturn
      ? await onCreateReturn(payload)
      : await returnReceiptStore.createReturnReceipt(payload)
    if (ok) {
      setInvoiceDetail(null)
      setSelectedReturns({})
      setReturnReason('')
      setSearchInvoiceId('')
    }
  }

  const invoiceItemColumns = [
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'SL Đã Mua',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <Tag color="blue">x{qty}</Tag>,
    },
    {
      title: 'SL Trả Lại',
      key: 'returnQty',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          value={selectedReturns[record.productId] || 0}
          onChange={(val) => handleReturnQtyChange(record.productId, val || 0)}
        />
      ),
    },
    {
      title: 'Tiền Hoàn Lại',
      key: 'refundAmount',
      render: (_, record) => {
        const qty = selectedReturns[record.productId] || 0
        return (
          <Text strong style={{ color: '#cf1322' }}>
            {formatCurrency(record.unitPrice * qty)}
          </Text>
        )
      },
    },
  ]

  const returnReceiptColumns = [
    {
      title: 'Mã Phiếu Trả',
      dataIndex: 'returnReceiptId',
      key: 'returnReceiptId',
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Mã Hóa Đơn Gốc',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Số Tiền Hoàn Khách',
      dataIndex: 'totalRefundAmount',
      key: 'totalRefundAmount',
      render: (amount) => (
        <Text strong style={{ color: '#cf1322' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Lý Do Đổi Trả',
      dataIndex: 'reason',
      key: 'reason',
      render: (r) => r || 'Đổi trả tại quầy',
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <RollbackOutlined style={{ color: '#ff4d4f' }} />
            <span>Tiếp Nhận & Xử Lý Đổi Trả Hàng Tại Quầy</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ maxWidth: 600, marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Nhập Mã Hóa Đơn Cần Trả Hàng:
          </Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Dán hoặc nhập mã hóa đơn (ví dụ: inv-uuid-...)"
              value={searchInvoiceId}
              onChange={(e) => setSearchInvoiceId(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
            />
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={searching}
            >
              Tra Cứu Hóa Đơn
            </Button>
          </Space.Compact>
        </div>

        {invoiceDetail && (
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 10, marginBottom: 20 }}>
            <Descriptions title="Thông Tin Hóa Đơn Mua Hàng" size="small" bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Mã hóa đơn">
                <Text code>{invoiceDetail.invoiceId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày mua">
                {formatDateTime(invoiceDetail.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {invoiceDetail.customer?.fullName || 'Khách vãng lai'}{' '}
                {invoiceDetail.customer?.phoneNumber && `(${invoiceDetail.customer.phoneNumber})`}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền đã thanh toán">
                <Text strong style={{ color: '#52c41a' }}>
                  {formatCurrency(invoiceDetail.finalTotal)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>
              Chọn Số Lượng Sản Phẩm Khách Muốn Trả Lại
            </Divider>

            <Table
              columns={invoiceItemColumns}
              dataSource={invoiceDetail.items || []}
              rowKey="productId"
              pagination={false}
              size="small"
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Lý do khách trả hàng:</Text>
              <Input
                placeholder="Ví dụ: Sản phẩm bị móp méo khi vận chuyển, đổi size..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ marginTop: 6 }}
                size="large"
              />
            </div>

            <Alert
              type="info"
              showIcon
              message={
                <span>
                  Lưu ý: Khi lập phiếu trả hàng, hệ thống sẽ tự động <strong>hoàn tiền mặt</strong> và{' '}
                  <strong>thu hồi điểm tích lũy</strong> đã cộng vào tài khoản khách hàng tương ứng.
                </span>
              }
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">Tổng tiền hoàn trả:</Text>
                <Title level={3} style={{ margin: 0, color: '#cf1322' }}>
                  {formatCurrency(totalRefund)}
                </Title>
              </div>

              <Popconfirm
                title="Xác nhận tạo phiếu trả hàng?"
                description={`Bạn có chắc muốn hoàn trả ${formatCurrency(totalRefund)} cho khách hàng?`}
                onConfirm={handleConfirmReturn}
                okText="Xác nhận trả hàng"
                cancelText="Hủy"
                disabled={itemsToReturn.length === 0}
              >
                <Button
                  type="primary"
                  danger
                  size="large"
                  icon={<FileProtectOutlined />}
                  loading={loadingReturn}
                  disabled={itemsToReturn.length === 0}
                  style={{ height: 48, fontWeight: 600, borderRadius: 8 }}
                >
                  Lập Phiếu Trả Hàng ({formatCurrency(totalRefund)})
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Card>

      {/* Lịch sử phiếu trả hàng */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Lịch Sử Các Phiếu Trả Hàng Gần Đây</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={returnReceiptColumns}
          dataSource={returnReceipts}
          rowKey="returnReceiptId"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  )
}
