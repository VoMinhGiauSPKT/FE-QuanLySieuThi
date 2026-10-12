import { useState } from 'react'
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

const { Text } = Typography

export default function InventoryReportTab({
  reports,
  loading,
  pagination,
  onTableChange,
  onRefresh,
}) {
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleOpenDetail = (record) => {
    setSelectedReport(record)
    setIsDetailModalOpen(true)
  }

  const columns = [
    {
      title: 'Mã Báo Cáo',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Người Lập (Thủ Kho)',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdByName',
      render: (name, rec) => name || rec.createdBy?.employeeId || 'Thủ kho',
    },
    {
      title: 'Ghi Chú Đợt Kiểm Kê',
      dataIndex: 'note',
      key: 'note',
      render: (n) => <Text strong>{n || 'Kiểm kê định kỳ'}</Text>,
    },
    {
      title: 'Số Mặt Hàng Lệch',
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
      title: 'Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name, rec) => (
        <div>
          <Text strong>{name || 'Sản phẩm'}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{rec.productId}</div>
        </div>
      ),
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      render: (qty) => <Tag color="blue">{qty} đơn vị</Tag>,
    },
    {
      title: 'Thực Tế Đếm Được',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      render: (qty) => <Tag color="purple">{qty} đơn vị</Tag>,
    },
    {
      title: 'Chênh Lệch',
      dataIndex: 'difference',
      key: 'difference',
      render: (diff) => (
        <Tag color={diff < 0 ? 'red' : diff > 0 ? 'green' : 'default'} style={{ fontWeight: 600 }}>
          {diff > 0 ? `+${diff}` : diff} đơn vị
        </Tag>
      ),
    },
    {
      title: 'Nguyên Nhân Chênh Lệch (Ghi chú kho)',
      dataIndex: 'discrepancyReason',
      key: 'discrepancyReason',
      render: (reason) => <Text type="danger">{reason || 'Không rõ'}</Text>,
    },
  ]

  return (
    <div>
      <Card
        title="Biên Bản Kiểm Kê Kho & Xử Lý Chênh Lệch Tồn Kho"
        extra={
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
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
          onChange={onTableChange}
        />
      </Card>

      {/* Modal chi tiết biên bản kiểm kê */}
      <Modal
        title={
          <Space>
            <FileSearchOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Biên Bản Kiểm Kê Lệch Tồn Kho</span>
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
                <Text code>{selectedReport.reportId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {formatDateTime(selectedReport.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Người lập báo cáo">
                {selectedReport.createdBy?.fullName || 'Thủ kho'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú đợt kiểm kê">
                <strong>{selectedReport.note}</strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ margin: '16px 0 12px 0' }}>
              Danh Sách Mặt Hàng Xuất Hiện Chênh Lệch
            </Divider>

            <Table
              columns={discrepancyColumns}
              dataSource={selectedReport.discrepancies || []}
              rowKey="productId"
              pagination={false}
              size="middle"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
