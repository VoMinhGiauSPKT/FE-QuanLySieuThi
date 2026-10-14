import { useState } from 'react'
import { Tabs, Typography } from 'antd'
import {
  InboxOutlined,
  FileDoneOutlined,
  WarningOutlined,
  DiffOutlined,
} from '@ant-design/icons'
import { DefaultLayout } from '../../layouts'
import { useAuthStore } from '../../stores/authStore'
import StockOverviewView from './components/StockOverviewView/StockOverviewView'
import ImportReceiptView from './components/ImportReceiptView/ImportReceiptView'
import LowStockAlertView from './components/LowStockAlertView/LowStockAlertView'
import DiscrepancyReportView from './components/DiscrepancyReportView/DiscrepancyReportView'
import './InventoryPage.scss'

const { Title, Text } = Typography

export default function InventoryPage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <InboxOutlined /> Tổng Quan Tồn Kho
        </span>
      ),
      children: <StockOverviewView />,
    },
    {
      key: 'import',
      label: (
        <span>
          <FileDoneOutlined /> Nhập Kho Hàng Hóa
        </span>
      ),
      children: <ImportReceiptView />,
    },
    {
      key: 'alerts',
      label: (
        <span>
          <WarningOutlined /> Cảnh Báo Sắp Hết Hàng
        </span>
      ),
      children: <LowStockAlertView onGoToImport={() => setActiveTab('import')} />,
    },
    {
      key: 'discrepancy',
      label: (
        <span>
          <DiffOutlined /> Kiểm Kê Lệch Kho
        </span>
      ),
      children: <DiscrepancyReportView />,
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div className="inventory-page__header">
        <Title level={2} className="page-title">
          <InboxOutlined className="title-icon" />
          Phân Hệ Quản Lý Kho & Chuỗi Cung Ứng Siêu Thị
        </Title>
        <Text type="secondary">
          Thủ kho phụ trách: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        type="card"
        className="inventory-page__tabs"
      />
    </DefaultLayout>
  )
}
