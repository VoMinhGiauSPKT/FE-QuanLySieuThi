import { useState } from 'react'
import AdminDesktop from '../../layout/desktop/admin'
import { useAuthStore } from '../../../stores/authStore'

/**
 * AdminContainer - Điều phối màn hình Quản trị viên (Chủ cửa hàng)
 * Các tab chức năng được phân tách độc lập (Single Responsibility):
 * - OverviewTab -> usePaymentStore, useProductStore, useFeedbackStore, useReportStore
 * - EmployeeManagementTab -> useEmployeeStore
 * - ProductManagementTab -> useProductStore, useCategoryStore
 * - CategoryManagementTab -> useCategoryStore
 * - InventoryReportTab -> useReportStore
 * - FeedbackReviewTab -> useFeedbackStore
 * - TransactionHistoryTab -> useInvoiceStore
 */
export default function AdminContainer() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <AdminDesktop
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}
