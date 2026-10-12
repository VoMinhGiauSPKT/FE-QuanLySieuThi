import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import AdminDesktop from '../../layout/desktop/admin'
import { useAuthStore } from '../../../stores/authStore'
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../../services/employeeService'
import {
  getProducts,
  updateProduct,
  getLowStockAlerts,
} from '../../../services/productService'
import { getPaymentSummary } from '../../../services/paymentService'
import { getStockDiscrepancies } from '../../../services/reportService'
import { getFeedbacks } from '../../../services/feedbackService'
import { getInvoices } from '../../../services/invoiceService'
import { extractArray, extractObject } from '../../../utils/apiHelper'

export default function AdminContainer() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('overview')

  // Overview states
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  // Employee states
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [employeePagination, setEmployeePagination] = useState({ current: 1, pageSize: 8, total: 0 })
  const [employeeFilters, setEmployeeFilters] = useState({})

  // Product states
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productPagination, setProductPagination] = useState({ current: 1, pageSize: 8, total: 0 })
  const [productFilters, setProductFilters] = useState({})

  // Inventory reports states
  const [inventoryReports, setInventoryReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [reportsPagination, setReportsPagination] = useState({ current: 1, pageSize: 8, total: 0 })

  // Feedback states
  const [feedbackData, setFeedbackData] = useState({ summary: {}, feedbacks: [] })
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)
  const [selectedRating, setSelectedRating] = useState(undefined)

  // Invoice history states
  const [invoices, setInvoices] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState(undefined)

  // 1. Tải dữ liệu Overview
  const fetchOverviewData = useCallback(async () => {
    try {
      const [summaryRes, lowStockRes] = await Promise.allSettled([
        getPaymentSummary(),
        getLowStockAlerts({ threshold: 10 }),
      ])

      if (summaryRes.status === 'fulfilled') {
        setPaymentSummary(extractObject(summaryRes.value, null))
      }
      if (lowStockRes.status === 'fulfilled') {
        const list = extractArray(lowStockRes.value)
        setLowStockCount(list.length)
      }
    } catch {
      // Bỏ qua lỗi nhẹ
    }
  }, [])

  // 2. Tải danh sách nhân viên
  const fetchEmployees = useCallback(async (page = 1, pageSize = 8, filters = {}) => {
    setLoadingEmployees(true)
    try {
      const res = await getEmployees({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      setEmployees(list)
      setEmployeePagination({
        current: page,
        pageSize,
        total: res?.data?.meta?.total || res?.meta?.total || list.length,
      })
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách nhân viên')
    } finally {
      setLoadingEmployees(false)
    }
  }, [])

  // 3. Tải danh sách sản phẩm
  const fetchProducts = useCallback(async (page = 1, pageSize = 8, filters = {}) => {
    setLoadingProducts(true)
    try {
      let res
      if (filters.isLowStock) {
        res = await getLowStockAlerts({ threshold: 10, page, limit: pageSize })
      } else {
        res = await getProducts({
          page,
          limit: pageSize,
          keyword: filters.keyword,
          productStatus: filters.productStatus,
        })
      }
      const list = extractArray(res)
      setProducts(list)
      setProductPagination({
        current: page,
        pageSize,
        total: res?.data?.meta?.total || res?.meta?.total || list.length,
      })
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách sản phẩm')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // 4. Tải danh sách báo cáo kiểm kê kho
  const fetchInventoryReports = useCallback(async (page = 1, pageSize = 8) => {
    setLoadingReports(true)
    try {
      const res = await getStockDiscrepancies({ page, limit: pageSize })
      const list = extractArray(res)
      setInventoryReports(list)
      setReportsPagination({
        current: page,
        pageSize,
        total: res?.data?.meta?.total || res?.meta?.total || list.length,
      })
    } catch (err) {
      message.error(err?.message || 'Không thể tải báo cáo kiểm kê kho')
    } finally {
      setLoadingReports(false)
    }
  }, [])

  // 5. Tải danh sách đánh giá khách hàng
  const fetchFeedbackData = useCallback(async (rating = undefined) => {
    setLoadingFeedbacks(true)
    try {
      const res = await getFeedbacks({ rating })
      const data = extractObject(res, { summary: {}, feedbacks: [] })
      setFeedbackData(data)
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách đánh giá')
    } finally {
      setLoadingFeedbacks(false)
    }
  }, [])

  // 6. Tải danh sách hóa đơn
  const fetchInvoices = useCallback(async (status = undefined) => {
    setLoadingInvoices(true)
    try {
      const res = await getInvoices({ status, limit: 20 })
      setInvoices(extractArray(res))
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách hóa đơn')
    } finally {
      setLoadingInvoices(false)
    }
  }, [])

  // Khởi động nạp dữ liệu theo tab
  useEffect(() => {
    fetchOverviewData()
    fetchEmployees(1, 8, {})
    fetchProducts(1, 8, {})
    fetchInventoryReports(1, 8)
    fetchFeedbackData()
    fetchInvoices()
  }, [
    fetchOverviewData,
    fetchEmployees,
    fetchProducts,
    fetchInventoryReports,
    fetchFeedbackData,
    fetchInvoices,
  ])

  // Actions Nhân viên
  const handleCreateEmployee = async (values) => {
    try {
      const res = await createEmployee(values)
      message.success(res?.message || 'Tạo nhân viên thành công!')
      fetchEmployees(employeePagination.current, employeePagination.pageSize, employeeFilters)
      return true
    } catch (err) {
      message.error(err?.message || 'Tạo nhân viên thất bại!')
      return false
    }
  }

  const handleUpdateEmployee = async (id, values) => {
    try {
      const res = await updateEmployee(id, values)
      message.success(res?.message || 'Cập nhật nhân viên thành công!')
      fetchEmployees(employeePagination.current, employeePagination.pageSize, employeeFilters)
      return true
    } catch (err) {
      message.error(err?.message || 'Cập nhật nhân viên thất bại!')
      return false
    }
  }

  const handleDeleteEmployee = async (id) => {
    try {
      const res = await deleteEmployee(id)
      message.success(res?.message || 'Đã khóa tài khoản nhân viên!')
      fetchEmployees(employeePagination.current, employeePagination.pageSize, employeeFilters)
    } catch (err) {
      message.error(err?.message || 'Không thể khóa tài khoản!')
    }
  }

  const handleSearchEmployees = (filters) => {
    setEmployeeFilters(filters)
    fetchEmployees(1, employeePagination.pageSize, filters)
  }

  const handleEmployeeTableChange = (pagination) => {
    fetchEmployees(pagination.current, pagination.pageSize, employeeFilters)
  }

  // Actions Sản phẩm
  const handleUpdateProduct = async (id, values) => {
    try {
      const res = await updateProduct(id, values)
      message.success(res?.message || 'Cập nhật sản phẩm thành công!')
      fetchProducts(productPagination.current, productPagination.pageSize, productFilters)
      return true
    } catch (err) {
      message.error(err?.message || 'Cập nhật sản phẩm thất bại!')
      return false
    }
  }

  const handleSearchProducts = (filters) => {
    setProductFilters(filters)
    fetchProducts(1, productPagination.pageSize, filters)
  }

  const handleProductTableChange = (pagination) => {
    fetchProducts(pagination.current, pagination.pageSize, productFilters)
  }

  return (
    <AdminDesktop
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // Overview
      paymentSummary={paymentSummary}
      lowStockCount={lowStockCount}
      feedbackSummary={feedbackData?.summary}
      pendingReportsCount={inventoryReports.length}
      // Employees
      employees={employees}
      loadingEmployees={loadingEmployees}
      employeePagination={employeePagination}
      onEmployeeTableChange={handleEmployeeTableChange}
      onSearchEmployees={handleSearchEmployees}
      onCreateEmployee={handleCreateEmployee}
      onUpdateEmployee={handleUpdateEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onRefreshEmployees={() => fetchEmployees(employeePagination.current, employeePagination.pageSize, employeeFilters)}
      // Products
      products={products}
      loadingProducts={loadingProducts}
      productPagination={productPagination}
      onProductTableChange={handleProductTableChange}
      onSearchProducts={handleSearchProducts}
      onUpdateProduct={handleUpdateProduct}
      onRefreshProducts={() => fetchProducts(productPagination.current, productPagination.pageSize, productFilters)}
      // Inventory reports
      inventoryReports={inventoryReports}
      loadingReports={loadingReports}
      reportsPagination={reportsPagination}
      onReportsTableChange={(p) => fetchInventoryReports(p.current, p.pageSize)}
      onRefreshReports={() => fetchInventoryReports(reportsPagination.current, reportsPagination.pageSize)}
      // Feedbacks
      feedbackData={feedbackData}
      loadingFeedbacks={loadingFeedbacks}
      selectedRating={selectedRating}
      onRatingChange={(r) => {
        setSelectedRating(r)
        fetchFeedbackData(r)
      }}
      onRefreshFeedbacks={() => fetchFeedbackData(selectedRating)}
      // Invoices
      invoices={invoices}
      loadingInvoices={loadingInvoices}
      selectedInvoiceStatus={selectedInvoiceStatus}
      onInvoiceStatusChange={(st) => {
        setSelectedInvoiceStatus(st)
        fetchInvoices(st)
      }}
      onRefreshInvoices={() => fetchInvoices(selectedInvoiceStatus)}
    />
  )
}
