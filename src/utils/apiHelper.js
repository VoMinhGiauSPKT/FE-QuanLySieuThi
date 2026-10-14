/**
 * Trích xuất mảng dữ liệu an toàn từ response Axios hoặc response API
 * Hỗ trợ cả 2 định dạng:
 * 1. Axios Response: res.data.data là array
 * 2. Unwrapped Response: res.data là array
 * @param {any} res
 * @returns {Array}
 */
export const extractArray = (res) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.data)) return res.data
  return []
}

/**
 * Trích xuất đối tượng dữ liệu an toàn từ response Axios hoặc response API
 * @param {any} res
 * @param {Object} fallback
 * @returns {Object}
 */
export const extractObject = (res, fallback = null) => {
  if (!res) return fallback
  if (res.data?.data && typeof res.data.data === 'object') {
    return res.data.data
  }
  if (res.data && typeof res.data === 'object') {
    return res.data
  }
  if (typeof res === 'object') {
    return res
  }
  return fallback
}

/**
 * Trích xuất metadata phân trang an toàn từ response
 * @param {any} res
 * @returns {{ currentPage: number, totalPages: number, totalItems: number, pageSize: number }}
 */
export const extractMeta = (res) => {
  const meta = res?.data?.meta || res?.meta || {}
  return {
    currentPage: Number(meta.page ?? meta.currentPage ?? 1),
    totalPages: Number(meta.totalPages ?? 1),
    totalItems: Number(meta.totalElements ?? meta.totalItems ?? meta.total ?? 0),
    pageSize: Number(meta.limit ?? meta.pageSize ?? 10),
  }
}
