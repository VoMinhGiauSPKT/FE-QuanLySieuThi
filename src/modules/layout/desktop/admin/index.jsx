import { Tabs, Typography } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  StarOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import DefaultLayout from '../../common/DefaultLayout'
import OverviewTab from './components/OverviewTab'
import EmployeeManagementTab from './components/EmployeeManagementTab'
import ProductManagementTab from './components/ProductManagementTab'
import InventoryReportTab from './components/InventoryReportTab'
import FeedbackReviewTab from './components/FeedbackReviewTab'
import TransactionHistoryTab from './components/TransactionHistoryTab'

const { Title, Text } = Typography

export default function AdminDesktop({
  user,
  activeTab,
  onTabChange,
  // Dữ liệu & action cho Overview
  paymentSummary,
  lowStockCount,
  feedbackSummary,
  pendingReportsCount,
  // Dữ liệu & action cho Nhân viên
  employees,
  loadingEmployees,
  employeePagination,
  onEmployeeTableChange,
  onSearchEmployees,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onRefreshEmployees,
  // Dữ liệu & action cho Sản phẩm
  products,
  loadingProducts,
  productPagination,
  onProductTableChange,
  onSearchProducts,
  onUpdateProduct,
  onRefreshProducts,
  // Dữ liệu & action cho Báo cáo kiểm kê kho
  inventoryReports,
  loadingReports,
  reportsPagination,
  onReportsTableChange,
  onRefreshReports,
  // Dữ liệu & action cho Đánh giá khách hàng
  feedbackData,
  loadingFeedbacks,
  selectedRating,
  onRatingChange,
  onRefreshFeedbacks,
  // Dữ liệu & action cho Hóa đơn & giao dịch
  invoices,
  loadingInvoices,
  selectedInvoiceStatus,
  onInvoiceStatusChange,
  onRefreshInvoices,
}) {
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined /> Tổng Quan
        </span>
      ),
      children: (
        <OverviewTab
          paymentSummary={paymentSummary}
          lowStockCount={lowStockCount}
          feedbackSummary={feedbackSummary}
          pendingReportsCount={pendingReportsCount}
          onNavigateTab={onTabChange}
        />
      ),
    },
    {
      key: 'employees',
      label: (
        <span>
          <TeamOutlined /> Quản Lý Nhân Sự
        </span>
      ),
      children: (
        <EmployeeManagementTab
          employees={employees}
          loading={loadingEmployees}
          pagination={employeePagination}
          onTableChange={onEmployeeTableChange}
          onSearch={onSearchEmployees}
          onCreateEmployee={onCreateEmployee}
          onUpdateEmployee={onUpdateEmployee}
          onDeleteEmployee={onDeleteEmployee}
          onRefresh={onRefreshEmployees}
        />
      ),
    },
    {
      key: 'products',
      label: (
        <span>
          <AppstoreOutlined /> Sản Phẩm & Tồn Kho
        </span>
      ),
      children: (
        <ProductManagementTab
          products={products}
          loading={loadingProducts}
          pagination={productPagination}
          onTableChange={onProductTableChange}
          onSearch={onSearchProducts}
          onUpdateProduct={onUpdateProduct}
          onRefresh={onRefreshProducts}
        />
      ),
    },
    {
      key: 'inventory-reports',
      label: (
        <span>
          <FileDoneOutlined /> Xem Xét Kiểm Kê Kho
        </span>
      ),
      children: (
        <InventoryReportTab
          reports={inventoryReports}
          loading={loadingReports}
          pagination={reportsPagination}
          onTableChange={onReportsTableChange}
          onRefresh={onRefreshReports}
        />
      ),
    },
    {
      key: 'feedback',
      label: (
        <span>
          <StarOutlined /> Đánh Giá Khách Hàng
        </span>
      ),
      children: (
        <FeedbackReviewTab
          feedbackData={feedbackData}
          loading={loadingFeedbacks}
          selectedRating={selectedRating}
          onRatingChange={onRatingChange}
          onRefresh={onRefreshFeedbacks}
        />
      ),
    },
    {
      key: 'transactions',
      label: (
        <span>
          <HistoryOutlined /> Lịch Sử Hóa Đơn & Doanh Thu
        </span>
      ),
      children: (
        <TransactionHistoryTab
          invoices={invoices}
          loading={loadingInvoices}
          selectedStatus={selectedInvoiceStatus}
          onStatusChange={onInvoiceStatusChange}
          onRefresh={onRefreshInvoices}
        />
      ),
    },
  ]

  return (
    <DefaultLayout user={user}>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          👑 Bảng Điều Khiển Quản Trị Hệ Thống (CMS)
        </Title>
        <Text type="secondary">
          Xin chào <strong>{user?.fullName}</strong>! Giám sát toàn diện nhân sự, kho vận, doanh thu và cảm nhận khách hàng.
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
