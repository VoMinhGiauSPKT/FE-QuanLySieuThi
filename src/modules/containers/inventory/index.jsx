import { useState } from 'react'
import InventoryDesktop from '../../layout/desktop/inventory'
import { useAuthStore } from '../../../stores/authStore'

/**
 * InventoryContainer - Điều phối phân hệ Quản Lý Kho
 * Từng view chức năng được phân tách độc lập (Single Responsibility):
 * - StockOverviewView -> useProductStore
 * - ImportReceiptView -> usePurchaseReceiptStore, useCategoryStore
 * - LowStockAlertView -> useProductStore
 * - DiscrepancyReportView -> useReportStore, useProductStore
 */
export default function InventoryContainer() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <InventoryDesktop
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}
