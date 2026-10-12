import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import InventoryDesktop from '../../layout/desktop/inventory'
import { useAuthStore } from '../../../stores/authStore'
import { getProducts, getLowStockAlerts } from '../../../services/productService'
import {
  createPurchaseReceipt,
  getPurchaseReceipts,
} from '../../../services/purchaseReceiptService'
import {
  createStockDiscrepancy,
  getStockDiscrepancies,
} from '../../../services/reportService'
import { extractArray } from '../../../utils/apiHelper'

export default function InventoryContainer() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  // Products
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Receipts
  const [receipts, setReceipts] = useState([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [creatingReceipt, setCreatingReceipt] = useState(false)

  // Low stock
  const [lowStockItems, setLowStockItems] = useState([])
  const [loadingLowStock, setLoadingLowStock] = useState(false)
  const [threshold, setThreshold] = useState(10)

  // Discrepancy reports
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [creatingReport, setCreatingReport] = useState(false)

  // 1. Tải danh mục sản phẩm kho
  const fetchProducts = useCallback(async (keyword = '') => {
    setLoadingProducts(true)
    try {
      const res = await getProducts({ keyword, limit: 50 })
      setProducts(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách sản phẩm kho')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // 2. Tải phiếu nhập hàng
  const fetchReceipts = useCallback(async () => {
    setLoadingReceipts(true)
    try {
      const res = await getPurchaseReceipts({ limit: 20 })
      setReceipts(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách phiếu nhập')
    } finally {
      setLoadingReceipts(false)
    }
  }, [])

  // 3. Tải cảnh báo hàng sắp hết
  const fetchLowStockAlerts = useCallback(async (thresh = 10) => {
    setLoadingLowStock(true)
    try {
      const res = await getLowStockAlerts({ threshold: thresh, limit: 50 })
      setLowStockItems(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách hàng sắp hết')
    } finally {
      setLoadingLowStock(false)
    }
  }, [])

  // 4. Tải biên bản kiểm kê kho
  const fetchDiscrepancyReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const res = await getStockDiscrepancies({ limit: 20 })
      setReports(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách biên bản kiểm kê')
    } finally {
      setLoadingReports(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchReceipts()
    fetchLowStockAlerts(threshold)
    fetchDiscrepancyReports()
  }, [fetchProducts, fetchReceipts, fetchLowStockAlerts, fetchDiscrepancyReports, threshold])

  // Lập phiếu nhập kho
  const handleCreateReceipt = async (payload) => {
    setCreatingReceipt(true)
    try {
      const res = await createPurchaseReceipt(payload)
      message.success(res?.message || 'Lập phiếu nhập hàng thành công! Tồn kho đã được cập nhật.')
      fetchReceipts()
      fetchProducts()
      fetchLowStockAlerts(threshold)
      return true
    } catch (err) {
      message.error(err?.message || 'Không thể lập phiếu nhập hàng!')
      return false
    } finally {
      setCreatingReceipt(false)
    }
  }

  // Lập biên bản kiểm kê lệch tồn
  const handleCreateReport = async (payload) => {
    setCreatingReport(true)
    try {
      const res = await createStockDiscrepancy(payload)
      message.success(
        res?.message || 'Đã gửi biên bản kiểm kê lên Chủ Cửa Hàng xem xét xử lý!'
      )
      fetchDiscrepancyReports()
      return true
    } catch (err) {
      message.error(err?.message || 'Không thể gửi biên bản kiểm kê!')
      return false
    } finally {
      setCreatingReport(false)
    }
  }

  return (
    <InventoryDesktop
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // Stock overview
      products={products}
      loadingProducts={loadingProducts}
      lowStockCount={lowStockItems.length}
      searchKeyword={searchKeyword}
      onSearchChange={setSearchKeyword}
      onSearchProducts={() => fetchProducts(searchKeyword)}
      onRefreshProducts={() => fetchProducts(searchKeyword)}
      // Import receipts
      receipts={receipts}
      loadingReceipts={loadingReceipts}
      onCreateReceipt={handleCreateReceipt}
      creatingReceipt={creatingReceipt}
      onRefreshReceipts={fetchReceipts}
      // Low stock alerts
      lowStockItems={lowStockItems}
      loadingLowStock={loadingLowStock}
      threshold={threshold}
      onThresholdChange={(val) => {
        setThreshold(val)
        fetchLowStockAlerts(val)
      }}
      onRefreshLowStock={() => fetchLowStockAlerts(threshold)}
      // Discrepancy reports
      reports={reports}
      loadingReports={loadingReports}
      onCreateReport={handleCreateReport}
      creatingReport={creatingReport}
      onRefreshReports={fetchDiscrepancyReports}
    />
  )
}
