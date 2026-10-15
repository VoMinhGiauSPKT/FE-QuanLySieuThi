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
  Descriptions,
} from 'antd'
import {
  FileAddOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../utils/formatters'
import { useReportStore } from '../../../../stores/reportStore'
import { useProductStore } from '../../../../stores/productStore'
import './DiscrepancyReportView.scss'

const { Text } = Typography

export default function DiscrepancyReportView() {
  const { reports, loading, creating, pagination, fetchReports, fetchReportDetail, createReport } = useReportStore()
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
    fetchReports(1, 8)
    fetchProducts({ limit: 50 })
  }, [fetchReports, fetchProducts])

  const handleTableChange = (pag) => {
    fetchReports(pag.current, pag.pageSize)
  }

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
    form.resetFields()
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
          reason: item.reason?.trim() || '',
        }
      })
      .filter((item) => item.difference !== 0 || item.reason)

    const payload = {
      auditTitle: values.auditTitle?.trim() || 'Biên bản kiểm kê kho',
      note: values.note?.trim() || '',
      items: items.map((i) => ({
        productId: i.productId,
        actualQuantity: i.actualQuantity,
        reason: i.reason?.trim() || '',
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
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchReports(pagination?.current || 1, pagination?.pageSize || 8)}
          >
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
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total != null ? pagination.total : safeReports.length,
          showTotal: (total) => `Tổng cộng ${total} biên bản kiểm kê`,
          showSizeChanger: true,
          pageSizeOptions: ['8', '16', '24', '50'],
        }}
        onChange={handleTableChange}
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
            auditTitle: '',
            note: '',
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
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Chi Tiết Biên Bản Kiểm Kê #{selectedReport?.reportId || ''}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={1050}
        style={{ top: 20 }}
      >
        {selectedReport && (
          <div>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Mã Biên Bản">
                <Tag color="blue" style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                  {selectedReport.reportId}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu Đề Biên Bản" span={2}>
                <Text strong style={{ fontSize: 14 }}>
                  {selectedReport.auditTitle || selectedReport.reportName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người Lập">
                <Text>{selectedReport.createdBy?.fullName || selectedReport.createdBy?.username || 'Thủ kho'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Lập">
                <Text>{formatDateTime(selectedReport.createdAt)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số Mặt Hàng Lệch">
                <Tag color={selectedReport.totalDiscrepancyItems > 0 ? 'red' : 'green'} style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {selectedReport.totalDiscrepancyItems ?? 0} mặt hàng
                </Tag>
              </Descriptions.Item>
              {selectedReport.note && (
                <Descriptions.Item label="Ghi Chú Đợt Kiểm Kê" span={3}>
                  <Text style={{ fontStyle: 'italic', color: '#434343' }}>{selectedReport.note}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ margin: '14px 0 12px 0' }}>Danh Sách Mặt Hàng Đối Soát</Divider>

            <Table
              dataSource={selectedReport.items || selectedReport.details || []}
              columns={[
                {
                  title: 'Mã SP',
                  dataIndex: 'productId',
                  key: 'productId',
                  width: 105,
                  render: (id) => (
                    <Tag color="blue" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {id || '-'}
                    </Tag>
                  ),
                },
                {
                  title: 'Tên Sản Phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  width: 170,
                  render: (t) => (
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {t}
                    </span>
                  ),
                },
                {
                  title: 'Ngành Hàng',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  width: 130,
                  render: (c) => (
                    <Tag color="cyan" style={{ whiteSpace: 'nowrap' }}>
                      {c || 'Chung'}
                    </Tag>
                  ),
                },
                {
                  title: 'Tồn HT',
                  dataIndex: 'systemQuantity',
                  key: 'systemQuantity',
                  width: 85,
                  align: 'center',
                  render: (q) => (
                    <Tag color="blue" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {q}
                    </Tag>
                  ),
                },
                {
                  title: 'Thực Tế',
                  dataIndex: 'actualQuantity',
                  key: 'actualQuantity',
                  width: 85,
                  align: 'center',
                  render: (q) => (
                    <Tag color="purple" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {q}
                    </Tag>
                  ),
                },
                {
                  title: 'Chênh Lệch',
                  dataIndex: 'difference',
                  key: 'difference',
                  width: 95,
                  align: 'center',
                  render: (d, record) => {
                    const diff = d !== undefined ? d : (record.actualQuantity - record.systemQuantity)
                    return (
                      <Tag
                        color={diff === 0 ? 'default' : diff > 0 ? 'green' : 'red'}
                        style={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </Tag>
                    )
                  },
                },
                {
                  title: 'Trạng Thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: 105,
                  align: 'center',
                  render: (st, record) => {
                    const diff = record.difference !== undefined ? record.difference : (record.actualQuantity - record.systemQuantity)
                    const statusVal = st || (diff < 0 ? 'SHORTAGE' : diff > 0 ? 'SURPLUS' : 'MATCHED')
                    if (statusVal === 'SHORTAGE') return <Tag color="red" style={{ whiteSpace: 'nowrap' }}>Thiếu hụt</Tag>
                    if (statusVal === 'SURPLUS') return <Tag color="green" style={{ whiteSpace: 'nowrap' }}>Dư thừa</Tag>
                    return <Tag color="default" style={{ whiteSpace: 'nowrap' }}>Khớp</Tag>
                  },
                },
                {
                  title: 'Lý Do Chênh Lệch',
                  dataIndex: 'reason',
                  key: 'reason',
                  render: (reason) => (
                    <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', minWidth: 200, lineHeight: 1.5 }}>
                      {reason || <span style={{ color: '#bfbfbf' }}>(Không có ghi chú)</span>}
                    </div>
                  ),
                },
              ]}
              rowKey={(r, idx) => r.detailId || r.productId || idx}
              pagination={false}
              size="middle"
              scroll={{ x: 'max-content' }}
              loading={detailLoading}
            />
          </div>
        )}
      </Modal>
    </Card>
  )
}

