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
  FileTextOutlined,
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
      width: 105,
      render: (id) => (
        <Tag color="blue" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          {id || '-'}
        </Tag>
      ),
    },
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'productName',
      key: 'productName',
      width: 170,
      render: (name) => (
        <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          {name}
        </span>
      ),
    },
    {
      title: 'Ngành Hàng',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 130,
      render: (cat) => (
        <Tag color="cyan" style={{ whiteSpace: 'nowrap' }}>
          {cat || 'Chung'}
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
          total: pagination?.total != null ? pagination.total : (reports?.length || 0),
          showTotal: (total) => `Tổng cộng ${total} biên bản kiểm kê`,
          showSizeChanger: true,
          pageSizeOptions: ['8', '16', '24', '50'],
        }}
        onChange={handleTableChange}
      />

      {/* Modal Chi Tiết */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Chi Tiết Báo Cáo Kiểm Kê #{selectedReport?.reportId || ''}</span>
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
                  {selectedReport.totalDiscrepancyItems ?? (selectedReport.items?.length || 0)} mặt hàng
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
              columns={detailColumns}
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
