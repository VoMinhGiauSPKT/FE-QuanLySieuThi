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

/**
 * Tính toán tổng số phần tử phân trang (total) cho Ant Design Table:
 * 1. Nếu Backend có trả về totalItems hợp lệ (> 0), ưu tiên sử dụng luôn.
 * 2. Nếu fallbackTotal được truyền vào và > 0, sử dụng fallbackTotal.
 * 3. Nếu Backend không trả total hoặc total = 0:
 *    - Nếu số phần tử trả về >= pageSize: Chắc chắn còn dữ liệu ở các trang sau -> set total = page * pageSize + 1
 *      để Ant Design Table kích hoạt nút Next/các số trang tiếp theo.
 *    - Nếu số phần tử < pageSize: Đây là trang cuối cùng -> chốt tổng số phần tử chính xác = (page - 1) * pageSize + listLength.
 * @param {Object} meta Metadata trích xuất từ extractMeta
 * @param {number} listLength Số lượng bản ghi của trang hiện tại
 * @param {number} page Trang hiện tại (1-indexed)
 * @param {number} pageSize Kích thước trang
 * @param {number} [fallbackTotal] Tổng số dự phòng nếu có
 * @returns {number}
 */
export const computePaginationTotal = (meta, listLength = 0, page = 1, pageSize = 8, fallbackTotal = null) => {
  if (fallbackTotal !== null && fallbackTotal !== undefined && Number(fallbackTotal) > 0) {
    return Number(fallbackTotal)
  }
  const metaTotal = Number(meta?.totalItems || 0)
  if (metaTotal > 0) {
    return metaTotal
  }
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.max(1, Number(pageSize) || 8)
  const safeLen = Math.max(0, Number(listLength) || 0)

  if (safeLen >= safePageSize) {
    return safePage * safePageSize + 1
  }
  return Math.max(0, (safePage - 1) * safePageSize + safeLen)
}

