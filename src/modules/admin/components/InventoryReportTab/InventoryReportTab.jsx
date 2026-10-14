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
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Người Lập (Thủ Kho)',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdByName',
      render: (name, rec) => name || rec.createdBy?.employeeId || 'Thủ kho',
    },
    {
      title: 'Tiêu Đề Đợt Kiểm Kê',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (t, rec) => <Text strong>{t || rec.note || 'Kiểm kê định kỳ'}</Text>,
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
          {st === 'RESOLVED' ? 'Đã giải quyết' : 'Cần kiểm tra'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
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
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
    },
    {
      title: 'Tồn Thực Tế',
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
            <Descriptions size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Thời gian">
                {formatDateTime(selectedReport.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề">
                {selectedReport.reportName || selectedReport.auditTitle}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }}>Chi Tiết Hàng Hóa Lệch</Divider>

            <Table
              dataSource={selectedReport.details || []}
              columns={detailColumns}
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
