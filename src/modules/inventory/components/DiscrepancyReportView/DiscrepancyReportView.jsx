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
import { formatDateTime } from '../../../../utils/formatters'
import { useReportStore } from '../../../../stores/reportStore'
import { useProductStore } from '../../../../stores/productStore'
import './DiscrepancyReportView.scss'

const { Text } = Typography

export default function DiscrepancyReportView() {
  const { reports, loading, creating, fetchReports, fetchReportDetail, createReport } = useReportStore()
  const { products, fetchProducts } = useProductStore()

  const safeProducts = Array.isArray(products) ? products : []
  const safeReports = Array.isArray(reports) ? reports : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [auditData, setAuditData] = useState({})

  useEffect(() => {
    fetchReports(1, 20)
    fetchProducts({ limit: 50 })
  }, [fetchReports, fetchProducts])

  const handleViewReportDetail = async (record) => {
    setSelectedReport(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await fetchReportDetail(record.reportId)
      if (data) {
        setSelectedReport(data)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
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

  const handleAuditChange = (productId, field, value) => {
    setAuditData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const handleFormSubmit = async (values) => {
    const items = Object.keys(auditData)
      .map((productId) => {
        const prod = safeProducts.find((p) => p.productId === productId)
        const item = auditData[productId]
        const actual = Number(item.actualQuantity) ?? (prod?.stockQuantity || 0)
        const system = prod?.stockQuantity || 0
        const diff = actual - system
        return {
          productId,
          actualQuantity: actual,
          systemQuantity: system,
          difference: diff,
          reason: item.reason || '',
        }
      })
      .filter((item) => item.difference !== 0 || item.reason)

    const payload = {
      auditTitle: values.auditTitle || 'Biên bản kiểm kê kho',
      note: values.note || '',
      items: items.map((i) => ({
        productId: i.productId,
        actualQuantity: i.actualQuantity,
        reason: i.reason || 'Kiểm kê định kỳ',
      })),
    }

    if (items.length === 0) {
      Modal.confirm({
        title: 'Không có chênh lệch tồn kho',
        content: 'Số lượng thực tế của tất cả sản phẩm đều trùng khớp với số lượng trên hệ thống. Bạn vẫn muốn lập biên bản?',
        onOk: async () => {
          const ok = await createReport(payload)
          if (ok) {
            setIsModalOpen(false)
            form.resetFields()
            fetchReports(1, 20)
          }
        },
      })
      return
    }

    const ok = await createReport(payload)
    if (ok) {
      setIsModalOpen(false)
      form.resetFields()
      fetchReports(1, 20)
    }
  }

  const columns = [
    {
      title: 'Mã Biên Bản',
      dataIndex: 'reportId',
      key: 'reportId',
      render: (id) => <Text code>{id ? String(id).substring(0, 10) : ''}</Text>,
    },
    {
      title: 'Tiêu Đề Biên Bản',
      dataIndex: 'auditTitle',
      key: 'auditTitle',
      render: (t, r) => <Text strong>{t || r.reportName || 'Biên bản kiểm kê'}</Text>,
    },
    {
      title: 'Người Lập',
      key: 'createdBy',
      render: (_, r) => <Text>{r.createdBy?.fullName || r.createdBy?.username || 'Thủ kho'}</Text>,
    },
    {
      title: 'Số Mục Lệch',
      dataIndex: 'totalDiscrepancyItems',
      key: 'totalDiscrepancyItems',
      render: (num) => (
        <Tag color={num > 0 ? 'volcano' : 'green'}>
          {num !== undefined ? `${num} mặt hàng` : '0 mặt hàng'}
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
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewReportDetail(record)}
        >
          Xem Chi Tiết
        </Button>
      ),
    },
  ]

  const auditColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 120,
      render: (q) => <Tag color="blue">{q} đơn vị</Tag>,
    },
    {
      title: 'Tồn Thực Tế Kiểm Kê',
      key: 'actualQuantity',
      width: 160,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={auditData[record.productId]?.actualQuantity ?? record.stockQuantity}
          onChange={(val) => handleAuditChange(record.productId, 'actualQuantity', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Lệch (Thực tế - Hệ thống)',
      key: 'discrepancy',
      width: 130,
      render: (_, record) => {
        const actual = auditData[record.productId]?.actualQuantity ?? record.stockQuantity
        const diff = actual - record.stockQuantity
        if (diff === 0) return <Text type="secondary">0</Text>
        return (
          <Tag color={diff > 0 ? 'green' : 'red'}>
            {diff > 0 ? `+${diff}` : diff}
          </Tag>
        )
      },
    },
    {
      title: 'Lý Do Chênh Lệch',
      key: 'reason',
      render: (_, record) => (
        <Input
          placeholder="Ví dụ: Rơi vỡ, ẩm mốc, thất thoát..."
          value={auditData[record.productId]?.reason || ''}
          onChange={(e) => handleAuditChange(record.productId, 'reason', e.target.value)}
        />
      ),
    },
  ]

  return (
    <Card
      title="Biên Bản Kiểm Kê & Báo Cáo Chênh Lệch Kho"
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
          <Button icon={<ReloadOutlined />} onClick={() => fetchReports(1, 20)}>
            Làm Mới
          </Button>
        </Space>
      }
      bordered={false}
      className="discrepancy-report-view"
    >
      <Table
        dataSource={safeReports}
        columns={columns}
        rowKey="reportId"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* Modal Lập Biên Bản */}
      <Modal
        title="Lập Biên Bản Kiểm Kê Chênh Lệch Kho Hàng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={960}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            auditTitle: 'Kiểm kê kho định kỳ',
            note: 'Kiểm tra hư hỏng và hạn sử dụng',
          }}
        >
          <Form.Item
            name="auditTitle"
            label="Tiêu Đề / Tên Biên Bản Kiểm Kê"
            rules={[{ required: true, message: 'Vui lòng nhập tên biên bản!' }]}
          >
            <Input placeholder="Ví dụ: Kiểm kê định kỳ cuối tháng, kiểm kê đột xuất..." size="large" />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi Chú Đợt Kiểm Kê"
          >
            <Input placeholder="Ví dụ: Kiểm tra hạn dùng và tình trạng bao bì..." />
          </Form.Item>

          <Alert
            type="info"
            message="Nhập số lượng đếm thực tế bên dưới. Hệ thống sẽ tự động tính toán số chênh lệch tồn kho so với số liệu ghi nhận."
            showIcon
            style={{ marginBottom: 12 }}
          />

          <Table
            dataSource={safeProducts}
            columns={auditColumns}
            rowKey="productId"
            pagination={{ pageSize: 5 }}
            size="small"
            className="discrepancy-report-view__modal-table"
          />

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Lưu Biên Bản Kiểm Kê
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Biên Bản */}
      <Modal
        title={`Chi Tiết Biên Bản Kiểm Kê #${selectedReport?.reportId || ''}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={850}
      >
        {selectedReport && (
          <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <div>
                <Text type="secondary">Mã biên bản: </Text>
                <Text strong>{selectedReport.reportId}</Text>
              </div>
              <div>
                <Text type="secondary">Tiêu đề: </Text>
                <Text strong>{selectedReport.auditTitle || selectedReport.reportName}</Text>
              </div>
              {selectedReport.note && (
                <div>
                  <Text type="secondary">Ghi chú: </Text>
                  <Text>{selectedReport.note}</Text>
                </div>
              )}
              <div>
                <Text type="secondary">Người lập: </Text>
                <Text>{selectedReport.createdBy?.fullName || selectedReport.createdBy?.username || 'Thủ kho'}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian: </Text>
                <Text>{formatDateTime(selectedReport.createdAt)}</Text>
              </div>
              <div>
                <Text type="secondary">Số mặt hàng chênh lệch: </Text>
                <Tag color={selectedReport.totalDiscrepancyItems > 0 ? 'red' : 'green'}>
                  {selectedReport.totalDiscrepancyItems ?? 0} mặt hàng
                </Tag>
              </div>
            </Space>

            <Divider style={{ margin: '12px 0' }}>Danh Sách Mặt Hàng Đối Soát</Divider>

            <Table
              dataSource={selectedReport.items || selectedReport.details || []}
              columns={[
                {
                  title: 'Mã SP',
                  dataIndex: 'productId',
                  key: 'productId',
                  render: (id) => <Text code>{id || '-'}</Text>,
                },
                {
                  title: 'Tên Sản Phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: 'Ngành Hàng',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  render: (c) => <Tag color="blue">{c || 'Chung'}</Tag>,
                },
                {
                  title: 'Tồn HT',
                  dataIndex: 'systemQuantity',
                  key: 'systemQuantity',
                  render: (q) => <Tag color="cyan">{q}</Tag>,
                },
                {
                  title: 'Thực Tế',
                  dataIndex: 'actualQuantity',
                  key: 'actualQuantity',
                  render: (q) => <Tag color="purple">{q}</Tag>,
                },
                {
                  title: 'Chênh Lệch',
                  dataIndex: 'difference',
                  key: 'difference',
                  render: (d, record) => {
                    const diff = d !== undefined ? d : (record.actualQuantity - record.systemQuantity)
                    return (
                      <Tag color={diff === 0 ? 'default' : diff > 0 ? 'green' : 'red'}>
                        {diff > 0 ? `+${diff}` : diff}
                      </Tag>
                    )
                  },
                },
                {
                  title: 'Trạng Thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (st, record) => {
                    const diff = record.difference !== undefined ? record.difference : (record.actualQuantity - record.systemQuantity)
                    const statusVal = st || (diff < 0 ? 'SHORTAGE' : diff > 0 ? 'SURPLUS' : 'MATCHED')
                    if (statusVal === 'SHORTAGE') return <Tag color="red">Thiếu hụt</Tag>
                    if (statusVal === 'SURPLUS') return <Tag color="green">Dư thừa</Tag>
                    return <Tag color="default">Khớp</Tag>
                  },
                },
                {
                  title: 'Lý Do',
                  dataIndex: 'reason',
                  key: 'reason',
                },
              ]}
              rowKey={(r, idx) => r.detailId || r.productId || idx}
              pagination={false}
              size="small"
              loading={detailLoading}
            />
          </div>
        )}
      </Modal>
    </Card>
  )
}

