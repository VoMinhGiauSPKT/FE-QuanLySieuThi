import { useState, useEffect } from 'react'
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
} from 'antd'
import {
  FileAddOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../../utils/formatters'
import { useReportStore } from '../../../../../stores/reportStore'
import { useProductStore } from '../../../../../stores/productStore'

const { Text } = Typography

export default function DiscrepancyReportView({
  products: propProducts,
  reports: propReports,
  loadingReports: propLoadingReports,
  onCreateReport,
  creating: propCreating,
  onRefresh,
}) {
  const reportStore = useReportStore()
  const productStore = useProductStore()

  const reports = propReports ?? reportStore.reports
  const loadingReports = propLoadingReports ?? reportStore.loading
  const products = propProducts ?? productStore.products
  const creating = propCreating ?? reportStore.creating

  const safeProducts = Array.isArray(products) ? products : []
  const safeReports = Array.isArray(reports) ? reports : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!propReports) {
      reportStore.fetchReports(1, 20)
    }
    if (!propProducts) {
      productStore.fetchProducts(1, 50, {})
    }
  }, [propReports, propProducts])

  const handleViewReportDetail = async (record) => {
    setSelectedReport(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await reportStore.fetchReportDetail(record.reportId)
      if (data) {
        setSelectedReport(data)
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết biên bản kiểm kê:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      reportStore.fetchReports(1, 20)
    }
  }

  // State lưu số lượng thực tế & lý do cho từng sản phẩm: { [productId]: { actualQuantity, reason } }
  const [auditData, setAuditData] = useState({})

  const handleOpenCreateModal = () => {
    // Khởi tạo auditData bằng số lượng tồn kho hệ thống ban đầu
    const initial = {}
    safeProducts.forEach((p) => {
      initial[p.productId] = {
        actualQuantity: p.stockQuantity,
        reason: '',
      }
    })
    setAuditData(initial)
    setIsModalOpen(true)
  }

  const handleActualQtyChange = (productId, val) => {
    setAuditData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        actualQuantity: val,
      },
    }))
  }

  const handleReasonChange = (productId, reason) => {
    setAuditData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reason,
      },
    }))
  }

  // Lọc các mặt hàng có chênh lệch thực tế vs hệ thống
  const discrepancyItems = safeProducts
    .filter((p) => {
      const data = auditData[p.productId]
      return data && data.actualQuantity !== p.stockQuantity
    })
    .map((p) => ({
      productId: p.productId,
      productName: p.productName,
      systemQuantity: p.stockQuantity,
      actualQuantity: auditData[p.productId].actualQuantity,
      difference: auditData[p.productId].actualQuantity - p.stockQuantity,
      discrepancyReason: auditData[p.productId].reason,
    }))

  const handleFinish = async (values) => {
    if (discrepancyItems.length === 0) {
      Modal.info({
        title: 'Không có chênh lệch',
        content: 'Tất cả số lượng thực tế đều trùng khớp với hệ thống. Không cần tạo biên bản lệch tồn kho!',
      })
      return
    }

    const title = values.note?.trim() || 'Kiểm kê định kỳ kho'
    const payload = {
      auditTitle: title,
      note: title,
      items: discrepancyItems.map((item) => ({
        productId: item.productId,
        actualQuantity: Number(item.actualQuantity),
        reason: item.discrepancyReason || item.reason || 'Hao hụt kiểm kê',
        discrepancyReason: item.discrepancyReason || item.reason || 'Hao hụt kiểm kê',
      })),
    }

    const ok = onCreateReport ? await onCreateReport(payload) : await reportStore.createStockDiscrepancy(payload)
    if (ok) {
      form.resetFields()
      setIsModalOpen(false)
    }
  }

  const reportColumns = [
    {
      title: 'Mã Biên Bản',
      dataIndex: 'reportId',
      key: 'reportId',
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Tiêu Đề / Ghi Chú',
      dataIndex: 'auditTitle',
      key: 'auditTitle',
      render: (t, r) => <Text strong>{t || r.note || 'Kiểm kê định kỳ kho'}</Text>,
    },
    {
      title: 'Mặt Hàng Lệch',
      dataIndex: 'totalDiscrepancyItems',
      key: 'totalDiscrepancyItems',
      render: (count, r) => (
        <Tag color="orange" style={{ fontWeight: 600 }}>
          {count ?? r.discrepancies?.length ?? 0} sản phẩm
        </Tag>
      ),
    },
    {
      title: 'Thời Gian Lập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleViewReportDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  const auditColumns = [
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 120,
      render: (qty) => <Tag color="blue">{qty} đơn vị</Tag>,
    },
    {
      title: 'Thực Tế Đếm Được',
      key: 'actual',
      width: 140,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={auditData[record.productId]?.actualQuantity ?? record.stockQuantity}
          onChange={(val) => handleActualQtyChange(record.productId, val ?? 0)}
        />
      ),
    },
    {
      title: 'Chênh Lệch',
      key: 'diff',
      width: 110,
      render: (_, record) => {
        const actual = auditData[record.productId]?.actualQuantity ?? record.stockQuantity
        const diff = actual - record.stockQuantity
        return (
          <Tag color={diff < 0 ? 'red' : diff > 0 ? 'green' : 'default'} style={{ fontWeight: 600 }}>
            {diff > 0 ? `+${diff}` : diff}
          </Tag>
        )
      },
    },
    {
      title: 'Lý Do Chênh Lệch (Nếu lệch)',
      key: 'reason',
      render: (_, record) => (
        <Input
          placeholder="Bể vỡ, hết hạn, mất mát..."
          value={auditData[record.productId]?.reason || ''}
          onChange={(e) => handleReasonChange(record.productId, e.target.value)}
        />
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Lịch Sử Biên Bản Kiểm Kê Lệch Tồn Kho"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={handleOpenCreateModal}
              style={{ borderRadius: 8 }}
            >
              Lập Biên Bản Kiểm Kê Mới
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm Mới
            </Button>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={reportColumns}
          dataSource={safeReports}
          rowKey="reportId"
          loading={loadingReports}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal Lập Biên Bản Kiểm Kê */}
      <Modal
        title={
          <Space>
            <FileAddOutlined style={{ color: '#faad14' }} />
            <span>Lập Biên Bản Kiểm Kê Kho & Phát Hiện Chênh Lệch</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          message="Hướng dẫn kiểm kê kho:"
          description="Nhập số lượng thực tế đếm được trong kho vào cột 'Thực Tế Đếm Được'. Nếu có chênh lệch, vui lòng ghi rõ lý do để gửi yêu cầu xử lý lên Chủ Cửa Hàng."
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="note"
            label="Ghi chú đợt kiểm kê"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú đợt kiểm kê!' }]}
          >
            <Input placeholder="Ví dụ: Kiểm kê định kỳ kho hàng tháng 10" size="large" />
          </Form.Item>

          <Divider orientation="left">Danh Sách Mặt Hàng Kiểm Đếm</Divider>

          <Table
            columns={auditColumns}
            dataSource={safeProducts}
            rowKey="productId"
            pagination={{ pageSize: 6 }}
            size="small"
            style={{ marginBottom: 16 }}
          />

          <div
            style={{
              padding: '12px 16px',
              background: discrepancyItems.length > 0 ? '#fffbe6' : '#f6ffed',
              border: `1px solid ${discrepancyItems.length > 0 ? '#ffe58f' : '#b7eb8f'}`,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <Text strong>
              Phát hiện {discrepancyItems.length} mặt hàng có chênh lệch giữa thực tế và hệ thống.
            </Text>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Gửi Biên Bản Lên Chủ Cửa Hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal chi tiết biên bản */}
      <Modal
        title={
          <Space>
            <FileAddOutlined style={{ color: '#faad14' }} />
            <span>Chi Tiết Biên Bản Kiểm Kê: {selectedReport?.reportId}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedReport && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '8px 16px',
                padding: '12px 16px',
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                <Text type="secondary">Mã biên bản: </Text>
                <Tag color="blue">{selectedReport.reportId}</Tag>
              </div>
              <div>
                <Text type="secondary">Tiêu đề / Ghi chú: </Text>
                <Text strong>{selectedReport.auditTitle || selectedReport.note || 'Kiểm kê định kỳ kho'}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian lập: </Text>
                <Text strong>{formatDateTime(selectedReport.createdAt)}</Text>
              </div>
              <div>
                <Text type="secondary">Người lập: </Text>
                <Text strong>
                  {selectedReport.createdBy?.fullName ||
                    selectedReport.createdBy?.username ||
                    selectedReport.createdBy?.employeeId ||
                    'Thủ kho'}
                </Text>
              </div>
            </div>

            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
              Chi Tiết Danh Sách Mặt Hàng Kiểm Kê:
            </Text>
            <Table
              loading={detailLoading}
              columns={[
                {
                  title: 'Mã SP',
                  dataIndex: 'productId',
                  key: 'productId',
                  width: 90,
                  render: (id) => <Tag color="blue">{id}</Tag>,
                },
                {
                  title: 'Tên Sản Phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (name) => <Text strong>{name}</Text>,
                },
                {
                  title: 'Loại SP',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  render: (cat) => (cat ? <Tag color="cyan">{cat}</Tag> : '-'),
                },
                {
                  title: 'Tồn Hệ Thống',
                  dataIndex: 'systemQuantity',
                  key: 'systemQuantity',
                  align: 'center',
                  width: 110,
                  render: (q) => <Tag color="blue">{q} đơn vị</Tag>,
                },
                {
                  title: 'Thực Tế',
                  dataIndex: 'actualQuantity',
                  key: 'actualQuantity',
                  align: 'center',
                  width: 100,
                  render: (q) => <Text strong>{q}</Text>,
                },
                {
                  title: 'Chênh Lệch',
                  dataIndex: 'difference',
                  key: 'difference',
                  align: 'center',
                  width: 110,
                  render: (d) => (
                    <Tag
                      color={d < 0 ? 'red' : d > 0 ? 'green' : 'default'}
                      style={{ fontWeight: 600 }}
                    >
                      {d > 0 ? `+${d}` : d}
                    </Tag>
                  ),
                },
                {
                  title: 'Lý Do Giải Trình',
                  key: 'reason',
                  render: (_, r) => r.reason || r.discrepancyReason || '-',
                },
              ]}
              dataSource={selectedReport.items || selectedReport.discrepancies || []}
              rowKey={(r) => r.productId || Math.random()}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
