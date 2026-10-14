import { useState } from 'react'
import { Tabs, Typography } from 'antd'
import {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShopOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  StarOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { DefaultLayout } from '../../layouts'
import { useAuthStore } from '../../stores/authStore'
import OverviewTab from './components/OverviewTab/OverviewTab'
import EmployeeManagementTab from './components/EmployeeManagementTab/EmployeeManagementTab'
import ProductManagementTab from './components/ProductManagementTab/ProductManagementTab'
import CategoryManagementTab from './components/CategoryManagementTab/CategoryManagementTab'
import InventoryReportTab from './components/InventoryReportTab/InventoryReportTab'
import FeedbackReviewTab from './components/FeedbackReviewTab/FeedbackReviewTab'
import TransactionHistoryTab from './components/TransactionHistoryTab/TransactionHistoryTab'
import './AdminPage.scss'

const { Title, Text } = Typography

export default function AdminPage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined /> Báo Cáo Doanh Thu
        </span>
      ),
      children: <OverviewTab onNavigateTab={setActiveTab} />,
    },
    {
      key: 'employees',
      label: (
        <span>
          <TeamOutlined /> Quản Lý Nhân Viên
        </span>
      ),
      children: <EmployeeManagementTab />,
    },
    {
      key: 'products',
      label: (
        <span>
          <ShopOutlined /> Quản Lý Sản Phẩm
        </span>
      ),
      children: <ProductManagementTab />,
    },
    {
      key: 'categories',
      label: (
        <span>
          <AppstoreOutlined /> Ngành Hàng & Loại SP
        </span>
      ),
      children: <CategoryManagementTab />,
    },
    {
      key: 'inventory-reports',
      label: (
        <span>
          <FileDoneOutlined /> Báo Cáo Kiểm Kê Kho
        </span>
      ),
      children: <InventoryReportTab />,
    },
    {
      key: 'feedback',
      label: (
        <span>
          <StarOutlined /> Đánh Giá Khách Hàng
        </span>
      ),
      children: <FeedbackReviewTab />,
    },
    {
      key: 'transactions',
      label: (
        <span>
          <HistoryOutlined /> Lịch Sử Giao Dịch
        </span>
      ),
      children: <TransactionHistoryTab />,
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div className="admin-page__header">
        <Title level={2} className="page-title">
          <DashboardOutlined className="title-icon" />
          Bảng Điều Khiển Quản Trị Hệ Thống Siêu Thị
        </Title>
        <Text type="secondary">
          Chủ cửa hàng: <strong>{user?.fullName}</strong> ({user?.username})
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        type="card"
        className="admin-page__tabs"
      />
    </DefaultLayout>
  )
}
