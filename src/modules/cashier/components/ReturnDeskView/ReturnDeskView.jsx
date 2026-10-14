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

export default function ReturnDeskView() {
  const {
    returnReceipts,
    loading: loadingReturn,
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
    (item) => selectedReturns[item.productId] > 0
  ) || []

  const totalRefund = itemsToReturn.reduce(
    (sum, item) => sum + item.unitPrice * (selectedReturns[item.productId] || 0),
    0
  )

  const handleConfirmReturn = async () => {
    if (!invoiceDetail?.invoiceId || itemsToReturn.length === 0) return
    // Schema BE: Module 9, invoiceId, reason, items: [{ productId, returnedQuantity }]
    // Không truyền returnReceiptId vì mã tự sinh
    const payload = {
      invoiceId: invoiceDetail.invoiceId,
      reason: returnReason || 'Khách đổi trả tại quầy',
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

          {itemsToReturn.length > 0 && (
            <div className="return-desk-view__refund-box">
              <div>
                <Text strong style={{ fontSize: 15, display: 'block' }}>
                  Lý do đổi trả:
                </Text>
                <Input
                  placeholder="Ví dụ: Hàng lỗi, bao bì rách, khách đổi ý..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{ width: 320, marginTop: 4 }}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                  Tổng tiền hoàn lại cho khách:
                </Text>
                <Title level={3} style={{ margin: '4px 0', color: '#ff4d4f' }}>
                  -{formatCurrency(totalRefund)}
                </Title>
                <Popconfirm
                  title="Xác nhận tạo phiếu trả hàng?"
                  description={`Hệ thống sẽ cập nhật lại tồn kho và hoàn trả ${formatCurrency(totalRefund)} cho khách.`}
                  onConfirm={handleConfirmReturn}
                  okText="Xác Nhận"
                  cancelText="Hủy"
                >
                  <Button type="primary" danger size="large" icon={<RollbackOutlined />} style={{ borderRadius: 8 }}>
                    Xác Nhận Trả Hàng & Hoàn Tiền
                  </Button>
                </Popconfirm>
              </div>
            </div>
          )}
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

