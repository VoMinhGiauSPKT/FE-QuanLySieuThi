// Lấy Base URL từ biến môi trường .env hoặc mặc định tới backend Render
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://market-gzb3.onrender.com/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  EMPLOYEE: {
    BASE: '/employee',
    DETAIL: (id) => `/employee/${id}`,
  },
  CUSTOMER: {
    BASE: '/customer',
    INVOICES: (id) => `/customer/${id}/invoices`,
  },
  PRODUCT: {
    BASE: '/product',
    DETAIL: (id) => `/product/${id}`,
    LOW_STOCK_ALERTS: '/product/low-stock/alerts',
  },
  CATEGORY: {
    BASE: '/category',
    DETAIL: (id) => `/category/${id}`,
  },
  PURCHASE_RECEIPT: {
    BASE: '/purchase-receipt',
    DETAIL: (id) => `/purchase-receipt/${id}`,
  },
  INVOICE: {
    BASE: '/invoice',
    DETAIL: (id) => `/invoice/${id}`,
  },
  PAYMENT: {
    PROCESS: '/payment/process',
    TRANSACTIONS: '/payment/transactions',
    SUMMARY: '/payment/summary',
    HISTORY: (invoiceId) => `/payment/history/${invoiceId}`,
  },
  RETURN_RECEIPT: {
    BASE: '/return-receipt',
    DETAIL: (id) => `/return-receipt/${id}`,
  },
  REPORT: {
    STOCK_DISCREPANCY: '/report/stock-discrepancy',
    STOCK_DISCREPANCY_DETAIL: (id) => `/report/stock-discrepancy/${id}`,
  },
  FEEDBACK: {
    BASE: '/feedback',
    DETAIL: (id) => `/feedback/${id}`,
  },
}
