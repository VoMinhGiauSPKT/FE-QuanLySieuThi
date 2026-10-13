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
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../../utils/formatters'
import { useReportStore } from '../../../../../stores/reportStore'

const { Text } = Typography

export default function InventoryReportTab({
  reports: propReports,
  loading: propLoading,
  pagination: propPagination,
  onTableChange,
  onRefresh,
}) {
  const store = useReportStore()

  const reports = propReports ?? store.reports
  const loading = propLoading ?? store.loading
  const pagination = propPagination ?? store.pagination

  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!propReports) {
      store.fetchReports(1, 8)
    }
  }, [propReports])

  const handleOpenDetail = async (record) => {
    setSelectedReport(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await store.fetchReportDetail(record.reportId)
      if (data) {
        setSelectedReport(data)
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết biên bản kiểm kê:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleTableChange = (pag) => {
    if (onTableChange) {
      onTableChange(pag)
    } else {
      store.fetchReports(pag.current, pag.pageSize)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      store.fetchReports(pagination?.current || 1, pagination?.pageSize || 8)
    }
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
      title: 'Ghi Chú Đợt Kiểm Kê',
      dataIndex: 'auditTitle',
      key: 'auditTitle',
      render: (t, rec) => <Text strong>{t || rec.note || 'Kiểm kê định kỳ'}</Text>,
    },
    {
      title: 'Số Mặt Hàng Lệch',
      dataIndex: 'totalDiscrepancyItems',
      key: 'totalDiscrepancyItems',
      render: (cnt, rec) => (
        <Tag color="orange" style={{ fontWeight: 600 }}>
          {cnt ?? rec.discrepancies?.length ?? 0} sản phẩm
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
      width: 130,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<FileSearchOutlined />}
          onClick={() => handleOpenDetail(record)}
        >
          Xem Chi Tiết
        </Button>
      ),
    },
  ]

  const discrepancyColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 90,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name, rec) => (
        <div>
          <Text strong>{name || 'Sản phẩm'}</Text>
          {rec.categoryName && (
            <div>
              <Tag color="cyan" style={{ fontSize: 11, marginTop: 2 }}>{rec.categoryName}</Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      align: 'center',
      render: (qty) => <Tag color="blue">{qty} đơn vị</Tag>,
    },
    {
      title: 'Thực Tế Đếm Được',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      align: 'center',
      render: (qty) => <Tag color="purple">{qty} đơn vị</Tag>,
    },
    {
      title: 'Chênh Lệch',
      dataIndex: 'difference',
      key: 'difference',
      align: 'center',
      render: (diff) => (
        <Tag color={diff < 0 ? 'red' : diff > 0 ? 'green' : 'default'} style={{ fontWeight: 600 }}>
          {diff > 0 ? `+${diff}` : diff} đơn vị
        </Tag>
      ),
    },
    {
      title: 'Nguyên Nhân Chênh Lệch (Ghi chú kho)',
      key: 'reason',
      render: (_, rec) => (
        <Text type={rec.difference !== 0 ? 'danger' : 'secondary'}>
          {rec.reason || rec.discrepancyReason || 'Không có ghi chú'}
        </Text>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Biên Bản Kiểm Kê Kho & Xử Lý Chênh Lệch Tồn Kho"
        extra={
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm Mới
          </Button>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="reportId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal chi tiết biên bản kiểm kê */}
      <Modal
        title={
          <Space>
            <FileSearchOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Biên Bản Kiểm Kê Lệch Tồn Kho: {selectedReport?.reportId}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={850}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            <CheckCircleOutlined /> Đã Xem Xét & Đóng
          </Button>,
        ]}
      >
        {selectedReport && (
          <div>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Mã biên bản">
                <Tag color="blue">{selectedReport.reportId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {formatDateTime(selectedReport.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Người lập báo cáo">
                {selectedReport.createdBy?.fullName ||
                  selectedReport.createdBy?.username ||
                  selectedReport.createdBy?.employeeId ||
                  'Thủ kho'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú đợt kiểm kê">
                <strong>{selectedReport.auditTitle || selectedReport.note || 'Kiểm kê định kỳ kho'}</strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>
              Danh Sách Mặt Hàng Xuất Hiện Chênh Lệch
            </Divider>

            <Table
              loading={detailLoading}
              columns={discrepancyColumns}
              dataSource={selectedReport.items || selectedReport.discrepancies || []}
              rowKey={(r) => r.productId || Math.random()}
              pagination={false}
              size="middle"
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
