import { useEffect, useMemo } from 'react'
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Divider,
  Alert,
  Descriptions,
  Select,
  Tooltip,
  message,
  Row,
  Col,
} from 'antd'
import {
  DeleteOutlined,
  PlusCircleOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime, formatDate } from '../../../../utils/formatters'
import { useDisposalStore } from '../../../../stores/disposalStore'
import { useProductStore } from '../../../../stores/productStore'
import { useAuthStore } from '../../../../stores/authStore'
import './StockDisposalView.scss'

const { Text } = Typography
const { Option } = Select

const COMMON_DISPOSAL_REASONS = [
  { label: 'Hàng hết hạn sử dụng', color: 'red' },
  { label: 'Bao bì rách, móp méo do vận chuyển', color: 'orange' },
  { label: 'Hàng dập nát, ôi thiu, hỏng tự nhiên', color: 'volcano' },
  { label: 'Hàng lỗi kỹ thuật từ nhà sản xuất', color: 'gold' },
  { label: 'Hư hỏng do lưu trữ bảo quản kho', color: 'magenta' },
]

export default function StockDisposalView() {
  const user = useAuthStore((state) => state.user)
  const { products, fetchProducts } = useProductStore()

  // Toàn bộ state & actions của phân hệ Phiếu Hủy Hàng (/api/disposal-receipt) qua Zustand
  const {
    receipts,
    loading,
    submitting,
    detailLoading,
    selectedReceipt,
    searchTerm,
    isCreateModalOpen,
    isDetailModalOpen,
    commonReason,
    disposalItems,
    selectedProductId,
    setSearchTerm,
    setSelectedProductId,
    setIsCreateModalOpen,
    setIsDetailModalOpen,
    addDisposalItem,
    updateItemQuantity,
    updateItemReason,
    removeDisposalItem,
    applyQuickReason,
    fetchDisposalReceipts,
    fetchDisposalDetail,
    createDisposalVoucher,
    exportDisposalExcel,
  } = useDisposalStore()

  const [createForm] = Form.useForm()

  const safeProducts = Array.isArray(products) ? products : []
  const safeReceipts = Array.isArray(receipts) ? receipts : []

  useEffect(() => {
    fetchDisposalReceipts(1, 10)
    fetchProducts({ limit: 100 })
  }, [fetchDisposalReceipts, fetchProducts])

  // Lọc danh sách phiếu theo từ khóa tìm kiếm
  const filteredReceipts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return safeReceipts

    return safeReceipts.filter((item) => {
      const voucherId = (item.voucherId || '').toLowerCase()
      const creatorName = (item.employee?.fullName || '').toLowerCase()
      const creatorUser = (item.employee?.username || '').toLowerCase()

      return (
        voucherId.includes(term) ||
        creatorName.includes(term) ||
        creatorUser.includes(term)
      )
    })
  }, [safeReceipts, searchTerm])

  // Mở modal tạo phiếu hủy mới
  const handleOpenCreateModal = () => {
    createForm.resetFields()
    createForm.setFieldsValue({
      reason: COMMON_DISPOSAL_REASONS[0].label,
      note: '',
    })
    applyQuickReason(COMMON_DISPOSAL_REASONS[0].label)
    setIsCreateModalOpen(true)
  }

  // Thêm sản phẩm vào danh sách hủy
  const handleAddProduct = () => {
    if (!selectedProductId) {
      message.warning('Vui lòng chọn một sản phẩm từ danh mục tồn kho!')
      return
    }

    const prod = safeProducts.find((p) => p.productId === selectedProductId)
    if (!prod) {
      message.error('Không tìm thấy thông tin sản phẩm!')
      return
    }

    addDisposalItem(prod)
  }

  // Chọn lý do nhanh
  const handleSelectQuickReason = (reasonText) => {
    applyQuickReason(reasonText)
    createForm.setFieldsValue({ reason: reasonText })
  }

  // Submit form tạo phiếu hủy kho lên /api/disposal-receipt
  const handleCreateDisposalSubmit = async () => {
    try {
      const values = await createForm.validateFields()
      await createDisposalVoucher(values)
    } catch (err) {
      if (err?.errorFields) {
        message.warning('Vui lòng kiểm tra lại các trường thông tin bắt buộc!')
      }
    }
  }

  // Xuất file Excel phiếu lẻ
  const handleExportSingleReceipt = async (voucherId) => {
    await exportDisposalExcel({
      receiptId: voucherId,
      filename: `Phieu_Xuat_Huy_${voucherId}.xlsx`,
    })
  }

  // Xuất file Excel toàn bộ
  const handleExportAllReceipts = async () => {
    await exportDisposalExcel({
      filename: `Bao_Cao_Xuat_Huy_Tong_Hop_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`,
    })
  }

  // Tính toán tóm tắt giá trị trong modal
  const createSummary = useMemo(() => {
    const totalQty = disposalItems.reduce((acc, it) => acc + (it.destroyQuantity || 0), 0)
    const totalValue = disposalItems.reduce(
      (acc, it) => acc + (it.destroyQuantity || 0) * (it.unitPrice || 0),
      0
    )
    return {
      totalItems: disposalItems.length,
      totalQty,
      totalValue,
    }
  }, [disposalItems])

  // Cột bảng danh sách phiếu xuất hủy kho
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Mã Phiếu Hủy',
      dataIndex: 'voucherId',
      key: 'voucherId',
      width: 140,
      render: (id) => (
        <Tag color="red" style={{ fontWeight: 700, fontSize: '13px' }}>
          {id}
        </Tag>
      ),
    },
    {
      title: 'Thời Gian Lập Phiếu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => (
        <span style={{ color: '#475569', fontSize: '13px' }}>{formatDateTime(date)}</span>
      ),
    },
    {
      title: 'Thủ Kho Lập Phiếu',
      dataIndex: 'employee',
      key: 'employee',
      width: 200,
      render: (emp) => (
        <span>
          <strong>{emp?.fullName || 'N/A'}</strong>
          {emp?.employeeId && (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}> ({emp.employeeId})</span>
          )}
        </span>
      ),
    },
    {
      title: 'Số Mặt Hàng Hủy',
      dataIndex: 'itemsCount',
      key: 'itemsCount',
      width: 150,
      align: 'center',
      render: (count) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {count ?? 0} mặt hàng
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 140,
      align: 'center',
      render: () => (
        <Tag color="error" icon={<CheckCircleOutlined />}>
          Đã Xuất Hủy Kho
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết các mặt hàng xuất hủy kèm lý do">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => fetchDisposalDetail(record.voucherId)}
            >
              Chi Tiết
            </Button>
          </Tooltip>
          <Tooltip title="Xuất file Excel cho phiếu hủy này">
            <Button
              size="small"
              icon={<FileExcelOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleExportSingleReceipt(record.voucherId)}
            >
              Excel
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  // Cột bảng mặt hàng chọn hủy trong modal
  const selectedItemsColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Mặt Hàng Hủy',
      key: 'product',
      render: (_, r) => (
        <div>
          <Text strong>{r.productName}</Text>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Mã SP: {r.productId} | Ngành: {r.categoryName}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn Kho Hiện Tại',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 130,
      align: 'center',
      render: (qty) => (
        <Tag color="blue" style={{ fontWeight: 600, fontSize: '13px' }}>
          {qty}
        </Tag>
      ),
    },
    {
      title: 'Số Lượng Xuất Hủy',
      key: 'destroyQuantity',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <InputNumber
          min={1}
          max={r.stockQuantity}
          value={r.destroyQuantity}
          onChange={(val) => updateItemQuantity(r.productId, val)}
          style={{ width: '100%', borderColor: '#ff7875' }}
          status={r.destroyQuantity >= r.stockQuantity ? 'warning' : ''}
        />
      ),
    },
    {
      title: 'Tồn Sau Hủy',
      key: 'remainingStock',
      width: 120,
      align: 'center',
      render: (_, r) => {
        const remaining = Math.max(0, r.stockQuantity - r.destroyQuantity)
        return (
          <Tag color={remaining === 0 ? 'red' : 'cyan'} style={{ fontWeight: 600 }}>
            {remaining}
          </Tag>
        )
      },
    },
    {
      title: 'Giá Trị Thiệt Hại',
      key: 'destroyValue',
      width: 130,
      align: 'right',
      render: (_, r) => (
        <span style={{ color: '#cf1322', fontWeight: 600 }}>
          {formatCurrency(r.destroyQuantity * r.unitPrice)}
        </span>
      ),
    },
    {
      title: 'Lý Do Hủy Chi Tiết',
      key: 'reason',
      width: 220,
      render: (_, r) => (
        <Input
          placeholder="Lý do chi tiết mặt hàng này..."
          value={r.reason}
          onChange={(e) => updateItemReason(r.productId, e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'remove',
      width: 50,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="Xóa mặt hàng này khỏi phiếu hủy">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeDisposalItem(r.productId)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <Card className="stock-disposal-view">
      {/* Thanh công cụ */}
      <div className="stock-disposal-view__toolbar">
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm theo mã phiếu, người lập..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Space size="middle" wrap>
          <Button
            type="primary"
            danger
            icon={<PlusCircleOutlined />}
            size="large"
            onClick={handleOpenCreateModal}
          >
            Lập Phiếu Xuất Hủy Hàng
          </Button>

          <Button
            icon={<FileExcelOutlined style={{ color: '#52c41a' }} />}
            size="large"
            onClick={handleExportAllReceipts}
          >
            Xuất Excel Toàn Bộ
          </Button>

          <Button
            icon={<ReloadOutlined />}
            size="large"
            onClick={() => {
              fetchDisposalReceipts(1, 10)
              fetchProducts({ limit: 100 })
            }}
          >
            Làm Mới
          </Button>
        </Space>
      </div>

      {/* Bảng danh sách phiếu hủy kho */}
      <Table
        className="stock-disposal-view__table"
        columns={columns}
        dataSource={filteredReceipts}
        rowKey="voucherId"
        loading={loading}
        scroll={{ x: 1050 }}
        pagination={{
          pageSize: 8,
          showTotal: (total) => `Tổng cộng ${total} phiếu xuất hủy`,
          showSizeChanger: true,
        }}
      />

      {/* Modal Lập Phiếu Hủy Hàng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              Lập Phiếu Xuất Hủy Hàng Hóa
            </span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => !submitting && setIsCreateModalOpen(false)}
        width={1060}
        footer={[
          <Button
            key="cancel"
            disabled={submitting}
            onClick={() => setIsCreateModalOpen(false)}
          >
            Hủy Bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            icon={<CheckCircleOutlined />}
            loading={submitting}
            disabled={disposalItems.length === 0}
            onClick={handleCreateDisposalSubmit}
          >
            Xác Nhận Xuất Hủy ({disposalItems.length} Mặt Hàng)
          </Button>,
        ]}
        className="stock-disposal-view__create-modal"
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Người lập phiếu">
                <Input
                  value={`${user?.fullName || 'Thủ kho'} (${user?.username || 'warehouse'})`}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày lập phiếu">
                <Input value={formatDate(new Date())} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lý do xuất hủy chung (Chọn nhanh hoặc nhập bên dưới)">
            <div className="reason-tags-container">
              {COMMON_DISPOSAL_REASONS.map((r) => (
                <Tag
                  key={r.label}
                  color={r.color}
                  className="reason-tag"
                  style={{
                    border: commonReason === r.label ? '2px solid #000' : 'none',
                    fontWeight: commonReason === r.label ? 700 : 500,
                  }}
                  onClick={() => handleSelectQuickReason(r.label)}
                >
                  {r.label}
                </Tag>
              ))}
            </div>
            <Form.Item
              name="reason"
              noStyle
              rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập lý do xuất hủy!' }]}
            >
              <Input
                placeholder="Nhập lý do xuất hủy chung..."
                value={commonReason}
                onChange={(e) => applyQuickReason(e.target.value)}
              />
            </Form.Item>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />

          {/* Chọn sản phẩm */}
          <div className="modal-section-title">
            <InboxOutlined style={{ color: '#1890ff' }} />
            Chọn Sản Phẩm Cần Xuất Hủy
          </div>

          <div className="product-picker-row">
            <Select
              showSearch
              placeholder="Tìm kiếm sản phẩm theo tên, mã SP..."
              value={selectedProductId}
              onChange={setSelectedProductId}
              style={{ flex: 1 }}
              filterOption={(input, option) => {
                const label = String(option?.label || option?.children || '').toLowerCase()
                return label.includes(input.toLowerCase())
              }}
              allowClear
            >
              {safeProducts.map((p) => {
                const stock = p.stockQuantity != null ? p.stockQuantity : 0
                const isOutOfStock = stock <= 0
                return (
                  <Option
                    key={p.productId}
                    value={p.productId}
                    disabled={isOutOfStock}
                    label={`${p.productName} ${p.productId}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>[{p.productId}]</strong> {p.productName}
                      </span>
                      <span>
                        <Tag color={isOutOfStock ? 'default' : stock < 10 ? 'orange' : 'blue'}>
                          Tồn: {stock}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                          {formatCurrency(p.unitPrice || p.price)}
                        </Text>
                      </span>
                    </div>
                  </Option>
                )
              })}
            </Select>

            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleAddProduct}
              disabled={!selectedProductId}
            >
              Thêm Vào Phiếu
            </Button>
          </div>

          {/* Bảng danh sách sản phẩm đã chọn */}
          <div className="selected-items-table">
            <Table
              columns={selectedItemsColumns}
              dataSource={disposalItems}
              rowKey="productId"
              pagination={false}
              size="small"
              scroll={{ x: 1040 }}
              locale={{
                emptyText: (
                  <div style={{ padding: '24px 0', color: '#94a3b8' }}>
                    Chưa có sản phẩm nào được chọn. Hãy tìm kiếm và chọn sản phẩm ở trên.
                  </div>
                ),
              }}
            />
          </div>

          {/* Thẻ tổng kết & Cảnh báo */}
          {disposalItems.length > 0 && (
            <div className="summary-card">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">SỐ LOẠI SẢN PHẨM HỦY:</div>
                  <div className="summary-val">{createSummary.totalItems} mặt hàng</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">TỔNG SỐ LƯỢNG HỦY:</div>
                  <div className="summary-val">{createSummary.totalQty} cái / gói</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">TỔNG THIỆT HẠI ƯỚC TÍNH:</div>
                  <div className="summary-val">{formatCurrency(createSummary.totalValue)}</div>
                </div>
              </div>
            </div>
          )}

          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="Cảnh báo trừ tồn kho tự động"
            description="Khi xác nhận, hệ thống sẽ lưu biên bản vào bảng DISPOSAL_RECEIPT & DISPOSAL_RECEIPT_DETAIL, đồng thời tự động TRỪ TRỰC TIẾP số lượng hàng hủy khỏi tồn kho sản phẩm trong kho."
          />
        </Form>
      </Modal>

      {/* Modal Chi Tiết Phiếu Hủy */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              Chi Tiết Phiếu Xuất Hủy Kho - {selectedReceipt?.voucherId}
            </span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={1060}
        footer={[
          <Button
            key="excel"
            icon={<FileExcelOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleExportSingleReceipt(selectedReceipt?.voucherId)}
          >
            Xuất File Excel Phiếu Này
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        className="stock-disposal-view__detail-modal"
      >
        {selectedReceipt && (
          <div>
            <Descriptions
              bordered
              size="middle"
              column={{ xs: 1, sm: 2 }}
              labelStyle={{
                width: '160px',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#f8fafc',
              }}
              contentStyle={{
                fontWeight: 500,
                color: '#0f172a',
              }}
            >
              <Descriptions.Item label="Mã Phiếu Hủy">
                <Tag color="red" style={{ fontWeight: 700, fontSize: '13px' }}>
                  {selectedReceipt.voucherId}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Lập">
                {formatDateTime(selectedReceipt.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Người Lập Phiếu">
                <strong>{selectedReceipt.employee?.fullName || 'N/A'}</strong>
                {selectedReceipt.employee?.employeeId && (
                  <span style={{ color: '#64748b', fontSize: '12px' }}> ({selectedReceipt.employee.employeeId})</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số Mặt Hàng Hủy">
                <Tag color="volcano" style={{ fontWeight: 600 }}>
                  {selectedReceipt.itemsCount ?? (selectedReceipt.items || []).length} mặt hàng
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Table
              className="detail-table"
              dataSource={selectedReceipt.items || []}
              rowKey={(r, idx) => r.disposalDetailId || r.productId || idx}
              pagination={false}
              size="middle"
              scroll={{ x: 1050 }}
              loading={detailLoading}
              columns={[
                {
                  title: 'STT',
                  key: 'stt',
                  width: 50,
                  align: 'center',
                  render: (_, __, idx) => idx + 1,
                },
                {
                  title: 'Mã & Tên Sản Phẩm',
                  key: 'prod',
                  width: 220,
                  render: (_, r) => (
                    <div>
                      <Text strong>{r.productName}</Text>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Mã SP: {r.productId}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Ngành Hàng',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  width: 140,
                  render: (c) => c || 'Chung',
                },
                {
                  title: 'Đơn Giá Bán',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  width: 130,
                  align: 'right',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'Số Lượng Hủy',
                  dataIndex: 'disposedQuantity',
                  key: 'disposedQuantity',
                  width: 130,
                  align: 'center',
                  render: (qty) => (
                    <Tag color="error" style={{ fontWeight: 700, fontSize: '13px' }}>
                      -{qty}
                    </Tag>
                  ),
                },
                {
                  title: 'Giá Trị Thiệt Hại',
                  key: 'damage',
                  width: 140,
                  align: 'right',
                  render: (_, r) => (
                    <span style={{ color: '#cf1322', fontWeight: 600 }}>
                      {formatCurrency((r.disposedQuantity || 0) * (r.unitPrice || 0))}
                    </span>
                  ),
                },
                {
                  title: 'Hạn Sử Dụng',
                  dataIndex: 'expirationDate',
                  key: 'expirationDate',
                  width: 120,
                  align: 'center',
                  render: (d) => formatDate(d),
                },
                {
                  title: 'Lý Do Xuất Hủy',
                  dataIndex: 'disposalReason',
                  key: 'disposalReason',
                  width: 220,
                  render: (reason) => (
                    <span style={{ color: '#475569' }}>
                      {reason || <span style={{ color: '#bfbfbf' }}>(Không có ghi chú)</span>}
                    </span>
                  ),
                },
              ]}
            />

            <div className="detail-summary">
              <div>
                <Text type="secondary">Tổng số mặt hàng: </Text>
                <Text strong>{(selectedReceipt.items || []).length} loại</Text>
                <Divider type="vertical" />
                <Text type="secondary">Tổng số lượng hủy: </Text>
                <Text strong style={{ color: '#d97706' }}>
                  {(selectedReceipt.items || []).reduce((acc, it) => acc + (it.disposedQuantity || 0), 0)} cái / gói
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ marginRight: 8 }}>Tổng thiệt hại thực tế:</Text>
                <Text strong style={{ color: '#cf1322', fontSize: '16px' }}>
                  {formatCurrency(
                    (selectedReceipt.items || []).reduce(
                      (acc, it) => acc + (it.disposedQuantity || 0) * (it.unitPrice || 0),
                      0
                    )
                  )}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
