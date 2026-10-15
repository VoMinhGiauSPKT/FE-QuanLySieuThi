import { useState, useEffect } from 'react'
import { Table, Button, Card, Tag, Space, Typography, Select, Alert } from 'antd'
import { WarningOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useProductStore } from '../../../../stores/productStore'
import './LowStockAlertView.scss'

const { Text } = Typography

export default function LowStockAlertView({ onGoToImport }) {
  const { lowStockItems, loadingLowStock, threshold, fetchLowStockAlerts, setThreshold } = useProductStore()
  const [internalThreshold, setInternalThreshold] = useState(threshold || 10)

  useEffect(() => {
    fetchLowStockAlerts(internalThreshold)
  }, [fetchLowStockAlerts, internalThreshold])

  const handleThresholdChange = (val) => {
    setInternalThreshold(val)
    setThreshold(val)
    fetchLowStockAlerts(val)
  }

  const handleRefresh = () => {
    fetchLowStockAlerts(internalThreshold)
  }

  const safeLowStockItems = Array.isArray(lowStockItems) ? lowStockItems : []

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 110,
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat, rec) => (
        <Tag color="blue">{cat || rec.category?.categoryName || 'Sản phẩm'}</Tag>
      ),
    },
    {
      title: 'Tồn Kho Hiện Tại',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty) => (
        <Tag color="red" style={{ fontWeight: 700, fontSize: 13 }}>
          <WarningOutlined /> Chỉ còn {qty} đơn vị
        </Tag>
      ),
    },
    {
      title: 'Đơn Giá Bán',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (d) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onGoToImport}
          style={{ borderRadius: 6 }}
        >
          Nhập Hàng
        </Button>
      ),
    },
  ]

  return (
    <div className="low-stock-alert-view">
      <Alert
        type="warning"
        showIcon
        message={
          <span>
            Hệ thống đang phát hiện <strong>{safeLowStockItems.length}</strong> mặt hàng có mức tồn kho dưới ngưỡng an toàn ({internalThreshold} đơn vị).
          </span>
        }
        description="Thủ kho vui lòng kiểm tra thực tế và tạo phiếu nhập hàng mới gửi chủ cửa hàng."
        className="low-stock-alert-view__alert"
      />

      <Card
        title="Danh Sách Sản Phẩm Cảnh Báo Hết Hàng"
        extra={
          <Space>
            <span>Ngưỡng cảnh báo:</span>
            <Select value={internalThreshold} onChange={handleThresholdChange} style={{ width: 120 }}>
              <Select.Option value={5}>&le; 5 đơn vị</Select.Option>
              <Select.Option value={10}>&le; 10 đơn vị</Select.Option>
              <Select.Option value={15}>&le; 15 đơn vị</Select.Option>
              <Select.Option value={20}>&le; 20 đơn vị</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm Mới
            </Button>
          </Space>
        }
        bordered={false}
        className="low-stock-alert-view__card"
      >
        <Table
          columns={columns}
          dataSource={safeLowStockItems}
          rowKey="productId"
          loading={loadingLowStock}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} mặt hàng sắp hết`,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '24', '50'],
          }}
        />
      </Card>
    </div>
  )
}
