import { Tabs, Typography } from 'antd'
import {
  InboxOutlined,
  ImportOutlined,
  WarningOutlined,
  FileDoneOutlined,
} from '@ant-design/icons'
import DefaultLayout from '../../common/DefaultLayout'
import StockOverviewView from './components/StockOverviewView'
import ImportReceiptView from './components/ImportReceiptView'
import LowStockAlertView from './components/LowStockAlertView'
import DiscrepancyReportView from './components/DiscrepancyReportView'

const { Title, Text } = Typography

export default function InventoryDesktop({
  user,
  activeTab,
  onTabChange,
  // Stock overview
  products,
  loadingProducts,
  lowStockCount,
  searchKeyword,
  onSearchChange,
  onSearchProducts,
  onRefreshProducts,
  // Import receipts
  receipts,
  loadingReceipts,
  onCreateReceipt,
  creatingReceipt,
  onRefreshReceipts,
  // Low stock alerts
  lowStockItems,
  loadingLowStock,
  threshold,
  onThresholdChange,
  onRefreshLowStock,
  // Discrepancy reports
  reports,
  loadingReports,
  onCreateReport,
  creatingReport,
  onRefreshReports,
}) {
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <InboxOutlined /> Tổng Quan Kho Hàng
        </span>
      ),
      children: (
        <StockOverviewView
          products={products}
          loading={loadingProducts}
          lowStockCount={lowStockCount}
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          onSearch={onSearchProducts}
          onRefresh={onRefreshProducts}
        />
      ),
    },
    {
      key: 'import',
      label: (
        <span>
          <ImportOutlined /> Nhập Hàng (Phiếu Nhập)
        </span>
      ),
      children: (
        <ImportReceiptView
          receipts={receipts}
          loading={loadingReceipts}
          onCreateReceipt={onCreateReceipt}
          creating={creatingReceipt}
          onRefresh={onRefreshReceipts}
        />
      ),
    },
    {
      key: 'low-stock',
      label: (
        <span>
          <WarningOutlined /> Cảnh Báo Hết Hàng ({lowStockCount})
        </span>
      ),
      children: (
        <LowStockAlertView
          lowStockItems={lowStockItems}
          loading={loadingLowStock}
          threshold={threshold}
          onThresholdChange={onThresholdChange}
          onGoToImport={() => onTabChange('import')}
          onRefresh={onRefreshLowStock}
        />
      ),
    },
    {
      key: 'discrepancy',
      label: (
        <span>
          <FileDoneOutlined /> Kiểm Kê Kho (Lệch Tồn)
        </span>
      ),
      children: (
        <DiscrepancyReportView
          products={products}
          reports={reports}
          loadingReports={loadingReports}
          onCreateReport={onCreateReport}
          creating={creatingReport}
          onRefresh={onRefreshReports}
        />
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          📦 Phân Hệ Quản Lý Kho & Chuỗi Cung Ứng Siêu Thị
        </Title>
        <Text type="secondary">
          Thủ kho phụ trách: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        size="large"
        type="card"
        style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      />
    </DefaultLayout>
  )
}
