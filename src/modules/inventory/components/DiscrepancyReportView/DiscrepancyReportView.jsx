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

  const handleFormSubmit = async () => {
    const details = Object.keys(auditData)
      .map((productId) => {
        const prod = safeProducts.find((p) => p.productId === productId)
        const item = auditData[productId]
        const actual = Number(item.actualQuantity) ?? (prod?.stockQuantity || 0)
        const system = prod?.stockQuantity || 0
        return {
          productId,
          actualQuantity: actual,
          systemQuantity: system,
          discrepancyQuantity: actual - system,
          reason: item.reason || '',
        }
      })
      .filter((item) => item.discrepancyQuantity !== 0 || item.reason)

    if (details.length === 0) {
      Modal.confirm({
        title: 'Không có chênh lệch tồn kho',
        content: 'Số lượng thực tế của tất cả sản phẩm đều trùng khớp với số lượng trên hệ thống. Bạn vẫn muốn lập biên bản?',
        onOk: async () => {
          const ok = await createReport({
            reportName: form.getFieldValue('reportName') || 'Biên bản kiểm kê kho định kỳ',
            details: [],
          })
          if (ok) {
            setIsModalOpen(false)
            form.resetFields()
            fetchReports(1, 20)
          }
        },
      })
      return
    }

    const ok = await createReport({
      reportName: form.getFieldValue('reportName') || 'Biên bản kiểm kê chênh lệch kho',
      details,
    })
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
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Tên Biên Bản',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (t) => <Text strong>{t || 'Biên bản kiểm kê'}</Text>,
    },
    {
      title: 'Thời Gian Lập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <Tag color={st === 'RESOLVED' ? 'green' : 'orange'}>
          {st === 'RESOLVED' ? 'Đã giải quyết' : 'Cần đối soát'}
        </Tag>
      ),
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
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ reportName: 'Biên bản kiểm kê kho định kỳ' }}>
          <Form.Item
            name="reportName"
            label="Tiêu Đề / Lý Do Kiểm Kê"
            rules={[{ required: true, message: 'Vui lòng nhập tên biên bản!' }]}
          >
            <Input placeholder="Ví dụ: Kiểm kê định kỳ cuối tháng, kiểm kê đột xuất..." size="large" />
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
        width={760}
      >
        {selectedReport && (
          <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <div>
                <Text type="secondary">Tên biên bản: </Text>
                <Text strong>{selectedReport.reportName}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian: </Text>
                <Text>{formatDateTime(selectedReport.createdAt)}</Text>
              </div>
            </Space>

            <Divider style={{ margin: '12px 0' }}>Danh Sách Mặt Hàng Đối Soát</Divider>

            <Table
              dataSource={selectedReport.details || []}
              columns={[
                {
                  title: 'Tên Sản Phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: 'Tồn Hệ Thống',
                  dataIndex: 'systemQuantity',
                  key: 'systemQuantity',
                },
                {
                  title: 'Thực Tế Đếm Được',
                  dataIndex: 'actualQuantity',
                  key: 'actualQuantity',
                },
                {
                  title: 'Chênh Lệch',
                  dataIndex: 'discrepancyQuantity',
                  key: 'discrepancyQuantity',
                  render: (d) => (
                    <Tag color={d === 0 ? 'default' : d > 0 ? 'green' : 'red'}>
                      {d > 0 ? `+${d}` : d}
                    </Tag>
                  ),
                },
                {
                  title: 'Lý Do',
                  dataIndex: 'reason',
                  key: 'reason',
                },
              ]}
              rowKey={(r, idx) => r.productId || idx}
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
