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
  Modal,
  Spin,
  message,
} from 'antd'
import {
  SearchOutlined,
  RollbackOutlined,
  HistoryOutlined,
  FileProtectOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime } from '../../../../utils/formatters'
import { useReturnReceiptStore } from '../../../../stores/returnReceiptStore'
import { useInvoiceStore } from '../../../../stores/invoiceStore'
import './ReturnDeskView.scss'

const { Title, Text } = Typography

const COMMON_REASONS = [
  'Hàng bị lỗi / hỏng hóc',
  'Sản phẩm cận date / hết hạn',
  'Bao bì rách / móp méo',
  'Sai quy cách / giao nhầm',
  'Khách đổi ý không còn nhu cầu',
]

export default function ReturnDeskView() {
  const {
    returnReceipts,
    loading: loadingReturn,
    creating,
    detailLoading,
    fetchReturnReceipts,
    fetchReturnReceiptById,
    createReturnReceipt,
  } = useReturnReceiptStore()
  const fetchInvoiceDetail = useInvoiceStore((state) => state.fetchInvoiceDetail)

  const [searchInvoiceId, setSearchInvoiceId] = useState('')
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [selectedReturns, setSelectedReturns] = useState({}) // { [productId]: quantity }
  const [returnReason, setReturnReason] = useState('')
  const [searching, setSearching] = useState(false)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingReceipt, setViewingReceipt] = useState(null)

  useEffect(() => {
    fetchReturnReceipts({ limit: 10 })
  }, [fetchReturnReceipts])

  const handleSearch = async () => {
    if (!searchInvoiceId.trim()) return
    setSearching(true)
    const result = await fetchInvoiceDetail(searchInvoiceId.trim())
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
    (item) => (selectedReturns[item.productId] || 0) > 0
  ) || []

  const totalReturnItemsCount = itemsToReturn.reduce(
    (sum, item) => sum + (selectedReturns[item.productId] || 0),
    0
  )

  const totalRefund = itemsToReturn.reduce(
    (sum, item) => sum + item.unitPrice * (selectedReturns[item.productId] || 0),
    0
  )

  const handleConfirmReturn = async () => {
    if (!invoiceDetail?.invoiceId) return
    if (itemsToReturn.length === 0) {
      message.warning('Vui lòng chọn số lượng ít nhất 1 sản phẩm muốn trả!')
      return
    }
    if (!returnReason.trim()) {
      message.warning('Vui lòng nhập lý do đổi trả hàng trước khi xác nhận!')
      return
    }
    // Schema BE: Module 9, invoiceId, reason, items: [{ productId, returnedQuantity }]
    // Không truyền returnReceiptId vì mã tự sinh
    const payload = {
      invoiceId: invoiceDetail.invoiceId,
      reason: returnReason.trim(),
      items: itemsToReturn.map((item) => ({
        productId: item.productId,
        returnedQuantity: selectedReturns[item.productId],
        returnQuantity: selectedReturns[item.productId],
      })),
    }

    const ok = await createReturnReceipt(payload)
    if (ok) {
      setInvoiceDetail(null)
      setSelectedReturns({})
      setReturnReason('')
      fetchReturnReceipts({ limit: 10 })
    }
  }

  // Bấm xem chi tiết phiếu trả hàng
  const handleOpenDetail = async (record) => {
    setViewingReceipt(record)
    setIsDetailModalOpen(true)
    const detail = await fetchReturnReceiptById(record.returnReceiptId)
    if (detail) {
      setViewingReceipt(detail)
    }
  }

  const invoiceItemsColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Đã Mua',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q) => <Tag color="blue">{q}</Tag>,
    },
    {
      title: 'SL Muốn Trả',
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
      title: 'Thành Tiền Hoàn',
      key: 'subtotal',
      render: (_, record) => {
        const qty = selectedReturns[record.productId] || 0
        return <Text strong style={{ color: qty > 0 ? '#ff4d4f' : '#64748b' }}>{formatCurrency(record.unitPrice * qty)}</Text>
      },
    },
  ]

  const historyColumns = [
    {
      title: 'Mã Phiếu Trả',
      dataIndex: 'returnReceiptId',
      key: 'returnReceiptId',
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Mã Hóa Đơn Gốc',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      render: (id) => <Tag color="cyan">{id}</Tag>,
    },
    {
      title: 'Tổng Tiền Hoàn',
      key: 'refundAmount',
      render: (_, r) => (
        <Text strong type="danger">
          -{formatCurrency(r.refundAmount ?? r.totalRefundAmount ?? 0)}
        </Text>
      ),
    },
    {
      title: 'Lý Do Đổi Trả',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleOpenDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <RollbackOutlined style={{ color: '#ff4d4f' }} />
          <span>Quầy Tiếp Nhận Trả Hàng & Hoàn Tiền</span>
        </Space>
      }
      bordered={false}
      className="return-desk-view"
    >
      {/* 1. Tìm kiếm hóa đơn cũ */}
      <div className="return-desk-view__search-bar">
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Nhập mã hóa đơn cần trả hàng:
        </Text>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Ví dụ: HD001 hoặc mã UUID hóa đơn"
            prefix={<SearchOutlined />}
            value={searchInvoiceId}
            onChange={(e) => setSearchInvoiceId(e.target.value)}
            onPressEnter={handleSearch}
            size="large"
          />
          <Button type="primary" size="large" loading={searching} onClick={handleSearch}>
            Tra Cứu
          </Button>
        </Space.Compact>
      </div>

      {/* 2. Chi tiết hóa đơn tìm thấy */}
      {invoiceDetail && (
        <Card
          size="small"
          title={
            <Space>
              <FileProtectOutlined style={{ color: '#1890ff' }} />
              <span>Hóa Đơn #{invoiceDetail.invoiceId}</span>
            </Space>
          }
          className="return-desk-view__detail-card"
        >
          <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Thời gian mua">
              {formatDateTime(invoiceDetail.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {invoiceDetail.customerName || 'Khách vãng lai'}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền đơn">
              <Text strong>{formatCurrency(invoiceDetail.finalTotal)}</Text>
            </Descriptions.Item>
          </Descriptions>

          <Alert
            type="info"
            message="Chọn số lượng sản phẩm khách muốn trả bên dưới:"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={invoiceDetail.items || []}
            columns={invoiceItemsColumns}
            rowKey="productId"
            pagination={false}
            size="small"
          />

          {/* Khối nhập lý do và xác nhận trả hàng */}
          <div style={{ marginTop: 20, background: '#ffffff', padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <Text strong style={{ fontSize: 15, color: '#1e293b' }}>
                  Lý do đổi trả hàng: <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Space size="small" wrap>
                  <Text type="secondary" style={{ fontSize: 12 }}>Chọn nhanh:</Text>
                  {COMMON_REASONS.map((r) => (
                    <Tag.CheckableTag
                      key={r}
                      checked={returnReason === r}
                      onChange={(checked) => setReturnReason(checked ? r : '')}
                      style={{ borderRadius: 12, padding: '2px 10px', fontSize: 12 }}
                    >
                      {r}
                    </Tag.CheckableTag>
                  ))}
                </Space>
              </div>

              <Input.TextArea
                rows={2}
                placeholder="Nhập lý do đổi trả hàng chi tiết tại đây (Ví dụ: Sản phẩm bị rách bao bì, cận hạn sử dụng, khách đổi ý...)"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                maxLength={300}
                showCount
                style={{ borderRadius: 6 }}
              />
            </div>

            <Divider style={{ margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Số lượng mặt hàng chọn trả: <Text strong style={{ color: itemsToReturn.length > 0 ? '#1890ff' : '#64748b' }}>{itemsToReturn.length} loại ({totalReturnItemsCount} sản phẩm)</Text>
                  </Text>
                  {itemsToReturn.length === 0 && (
                    <Text type="warning" style={{ fontSize: 12 }}>
                      (Vui lòng tăng số lượng muốn trả ở bảng trên)
                    </Text>
                  )}
                </Space>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Tổng tiền hoàn trả:
                  </Text>
                  <Title level={3} style={{ margin: 0, color: totalRefund > 0 ? '#ff4d4f' : '#64748b' }}>
                    -{formatCurrency(totalRefund)}
                  </Title>
                </div>

                <Popconfirm
                  title="Xác nhận tạo phiếu trả hàng?"
                  description={
                    <div style={{ maxWidth: 280 }}>
                      <div>Hoàn trả <strong>{formatCurrency(totalRefund)}</strong> cho {itemsToReturn.length} loại sản phẩm.</div>
                      <div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>Lý do: {returnReason.trim() || 'Chưa nhập'}</div>
                    </div>
                  }
                  onConfirm={handleConfirmReturn}
                  okText="Xác Nhận"
                  cancelText="Hủy"
                  disabled={itemsToReturn.length === 0}
                >
                  <Button
                    type="primary"
                    danger
                    size="large"
                    loading={creating}
                    disabled={itemsToReturn.length === 0}
                    icon={<RollbackOutlined />}
                    style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
                  >
                    Xác Nhận Trả Hàng & Hoàn Tiền
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Lịch sử các phiếu trả hàng gần đây */}
      <Divider style={{ margin: '32px 0 20px 0' }} />
      <Title level={5} style={{ marginBottom: 16 }}>
        <Space>
          <HistoryOutlined />
          <span>Lịch Sử Phiếu Trả Hàng Gần Đây</span>
        </Space>
      </Title>

      <Table
        dataSource={Array.isArray(returnReceipts) ? returnReceipts : []}
        columns={historyColumns}
        rowKey="returnReceiptId"
        loading={loadingReturn}
        size="small"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal Chi Tiết Phiếu Trả Hàng */}
      <Modal
        title={
          <Space>
            <RollbackOutlined style={{ color: '#ff4d4f' }} />
            <span>Chi Tiết Phiếu Trả Hàng #{viewingReceipt?.returnReceiptId || ''}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setViewingReceipt(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <Spin spinning={detailLoading}>
          {viewingReceipt && (
            <Descriptions bordered column={1} size="middle" style={{ marginTop: 12 }}>
              <Descriptions.Item label="Mã Phiếu Trả">
                <Tag color="blue" style={{ fontWeight: 600 }}>{viewingReceipt.returnReceiptId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã Hóa Đơn Gốc">
                <Tag color="cyan">{viewingReceipt.invoiceId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số Tiền Hoàn Cho Khách">
                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                  -{formatCurrency(viewingReceipt.refundAmount ?? viewingReceipt.totalRefundAmount ?? 0)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lý Do Trả Hàng">
                {viewingReceipt.reason || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Thu Ngân Tiếp Nhận">
                {viewingReceipt.createdBy?.fullName || viewingReceipt.createdBy?.username || 'Thu ngân'}
              </Descriptions.Item>
              <Descriptions.Item label="Khách Hàng">
                {viewingReceipt.customer?.fullName ? `${viewingReceipt.customer.fullName} (${viewingReceipt.customer.phoneNumber || ''})` : 'Khách hàng'}
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Lập">
                {formatDateTime(viewingReceipt.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </Card>
  )
}

