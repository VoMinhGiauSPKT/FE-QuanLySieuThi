import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Tag,
  Card,
  Modal,
  Space,
  Typography,
  Descriptions,
  Divider,
} from 'antd'
import {
  FileSearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../utils/formatters'
import { useReportStore } from '../../../../stores/reportStore'
import './InventoryReportTab.scss'

const { Text } = Typography

export default function InventoryReportTab() {
  const { reports, loading, pagination, fetchReports, fetchReportDetail } = useReportStore()

  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchReports(1, 8)
  }, [fetchReports])

  const handleOpenDetail = async (record) => {
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

  const handleTableChange = (pag) => {
    fetchReports(pag.current, pag.pageSize)
  }

  const columns = [
    {
      title: 'Mã Báo Cáo',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
      render: (id) => <Tag color="blue" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: 'Người Lập (Thủ Kho)',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdByName',
      render: (name, rec) => name || rec.createdBy?.username || rec.createdBy?.employeeId || 'Thủ kho',
    },
    {
      title: 'Tiêu Đề Đợt Kiểm Kê',
      dataIndex: 'auditTitle',
      key: 'auditTitle',
      render: (t, rec) => <Text strong>{t || rec.reportName || rec.note || 'Kiểm kê định kỳ'}</Text>,
    },
    {
      title: 'Số Mặt Hàng Lệch',
      dataIndex: 'totalDiscrepancyItems',
      key: 'totalDiscrepancyItems',
      width: 150,
      render: (count) => (
        <Tag color={count > 0 ? 'volcano' : 'green'}>
          {count ?? 0} mặt hàng
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
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<FileSearchOutlined />}
          onClick={() => handleOpenDetail(record)}
        >
          Xem Đối Soát
        </Button>
      ),
    },
  ]

  const detailColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 110,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Ngành Hàng',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat) => <Tag color="cyan">{cat || 'Sản phẩm'}</Tag>,
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      render: (q) => <Text>{q}</Text>,
    },
    {
      title: 'Tồn Thực Tế',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      render: (q) => <Text strong>{q}</Text>,
    },
    {
      title: 'Chênh Lệch',
      key: 'difference',
      render: (_, r) => {
        const diff = r.difference ?? r.discrepancyQuantity ?? (r.actualQuantity - r.systemQuantity)
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
      render: (st) => (
        <Tag color={st === 'SHORTAGE' ? 'red' : st === 'SURPLUS' ? 'green' : 'default'}>
          {st === 'SHORTAGE' ? 'Thiếu hàng' : st === 'SURPLUS' ? 'Thừa hàng' : (st || 'Khớp')}
        </Tag>
      ),
    },
    {
      title: 'Lý Do & Giải Trình',
      dataIndex: 'reason',
      key: 'reason',
      render: (r) => r || <Text type="secondary">-</Text>,
    },
  ]

  return (
    <Card
      title="Báo Cáo Kiểm Kê & Chênh Lệch Tồn Kho Từ Thủ Kho"
      extra={
        <Button icon={<ReloadOutlined />} onClick={() => fetchReports(1, 8)}>
          Làm Mới
        </Button>
      }
      bordered={false}
      className="inventory-report-tab"
    >
      <Table
        columns={columns}
        dataSource={Array.isArray(reports) ? reports : []}
        rowKey="reportId"
        loading={loading}
        pagination={{
          current: pagination?.current || 1,
          pageSize: pagination?.pageSize || 8,
          total: pagination?.total || reports?.length || 0,
          showTotal: (total) => `Tổng cộng ${total} biên bản kiểm kê`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Chi Tiết */}
      <Modal
        title={`Chi Tiết Báo Cáo Kiểm Kê: #${selectedReport?.reportId || ''}`}
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
            <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Thời gian">
                {formatDateTime(selectedReport.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề kiểm kê">
                {selectedReport.auditTitle || selectedReport.reportName}
              </Descriptions.Item>
              <Descriptions.Item label="Người lập">
                {selectedReport.createdBy?.fullName || selectedReport.createdBy?.username || 'Thủ kho'}
              </Descriptions.Item>
              <Descriptions.Item label="Số mặt hàng lệch">
                <Tag color="volcano">{selectedReport.totalDiscrepancyItems ?? (selectedReport.items?.length || 0)} mặt hàng</Tag>
              </Descriptions.Item>
              {selectedReport.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedReport.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider style={{ margin: '12px 0' }}>Chi Tiết Hàng Hóa Lệch</Divider>

            <Table
              dataSource={selectedReport.items || selectedReport.details || []}
              columns={detailColumns}
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
