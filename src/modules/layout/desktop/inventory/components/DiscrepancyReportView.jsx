import { useState } from 'react'
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

const { Text } = Typography

export default function DiscrepancyReportView({
  products,
  reports,
  loadingReports,
  onCreateReport,
  creating,
  onRefresh,
}) {
  const safeProducts = Array.isArray(products) ? products : []
  const safeReports = Array.isArray(reports) ? reports : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

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

    const payload = {
      note: values.note || 'Kiểm kê định kỳ kho',
      items: discrepancyItems.map((item) => ({
        productId: item.productId,
        actualQuantity: Number(item.actualQuantity),
        discrepancyReason: item.discrepancyReason || 'Hao hụt kiểm kê',
      })),
    }

    const ok = await onCreateReport(payload)
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
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Ghi Chú Đợt Kiểm Kê',
      dataIndex: 'note',
      key: 'note',
      render: (n) => <Text strong>{n || 'Kiểm kê kho'}</Text>,
    },
    {
      title: 'Mặt Hàng Lệch',
      dataIndex: 'discrepancies',
      key: 'discrepancyCount',
      render: (items) => (
        <Tag color="orange" style={{ fontWeight: 600 }}>
          {items?.length || 0} sản phẩm
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
          onClick={() => {
            setSelectedReport(record)
            setIsDetailModalOpen(true)
          }}
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
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
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
        title="Chi Tiết Biên Bản Kiểm Kê Kho"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={750}
      >
        {selectedReport && (
          <div>
            <p>
              Ghi chú: <strong>{selectedReport.note}</strong>
            </p>
            <p>Thời gian lập: {formatDateTime(selectedReport.createdAt)}</p>
            <Divider style={{ margin: '12px 0' }} />
            <Table
              columns={[
                { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
                { title: 'Tồn Hệ Thống', dataIndex: 'systemQuantity', key: 'systemQuantity' },
                { title: 'Thực Tế', dataIndex: 'actualQuantity', key: 'actualQuantity' },
                {
                  title: 'Chênh Lệch',
                  dataIndex: 'difference',
                  key: 'difference',
                  render: (d) => (
                    <Tag color={d < 0 ? 'red' : 'green'}>{d > 0 ? `+${d}` : d}</Tag>
                  ),
                },
                { title: 'Nguyên Nhân', dataIndex: 'discrepancyReason', key: 'discrepancyReason' },
              ]}
              dataSource={selectedReport.discrepancies || []}
              rowKey="productId"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
