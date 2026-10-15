import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Space,
  Typography,
  Alert,
  DatePicker,
  Radio,
  Tag,
  Progress,
  Table,
  Empty,
  Spin,
  Tooltip,
  message,
} from 'antd'
import {
  DollarOutlined,
  ShoppingOutlined,
  StarOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  FileTextOutlined,
  WarningOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  BarChartOutlined,
  WalletOutlined,
  QrcodeOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../../../utils/formatters'
import { useReportStore } from '../../../../stores/reportStore'
import { useProductStore } from '../../../../stores/productStore'
import { useFeedbackStore } from '../../../../stores/feedbackStore'
import './OverviewTab.scss'

const { Title, Text } = Typography

export default function OverviewTab({ onNavigateTab }) {
  const {
    revenueData,
    loading: reportLoading,
    fetchRevenueReport,
    exportExcel,
    reports,
    fetchReports,
  } = useReportStore()
  const { lowStockCount, fetchLowStockAlerts } = useProductStore()
  const { feedbackData, fetchFeedbacks } = useFeedbackStore()

  // Bộ lọc thời gian: 'day' | 'month' | 'year'
  const [filterType, setFilterType] = useState('month')
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [refreshing, setRefreshing] = useState(false)

  const feedbackSummary = feedbackData?.summary
  const pendingReportsCount = reports?.length || 0

  // Chuyển đổi tham số truy vấn báo cáo theo thời gian
  const buildQueryParams = useCallback(() => {
    if (filterType === 'day') {
      return {
        type: 'day',
        date: selectedDate.format('YYYY-MM-DD'),
      }
    }
    if (filterType === 'year') {
      return {
        type: 'year',
        year: selectedDate.year(),
      }
    }
    // Mặc định 'month'
    return {
      type: 'month',
      month: selectedDate.month() + 1,
      year: selectedDate.year(),
    }
  }, [filterType, selectedDate])

  // Tải báo cáo doanh thu khi bộ lọc thay đổi
  useEffect(() => {
    const params = buildQueryParams()
    fetchRevenueReport(params)
  }, [buildQueryParams, fetchRevenueReport])

  // Tải các dữ liệu hoạt động ban đầu
  useEffect(() => {
    fetchLowStockAlerts(10)
    fetchFeedbacks()
    fetchReports(1, 10)
  }, [fetchLowStockAlerts, fetchFeedbacks, fetchReports])

  // Hàm làm mới toàn bộ dữ liệu (báo cáo doanh thu + 2 phần trong ảnh + kiểm kê)
  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      const params = buildQueryParams()
      await Promise.all([
        fetchRevenueReport(params),
        fetchLowStockAlerts(10),
        fetchFeedbacks(),
        fetchReports(1, 10),
      ])
      message.success('Đã cập nhật dữ liệu báo cáo doanh thu và hoạt động mới nhất!')
    } catch (err) {
      message.error(err?.message || 'Lỗi khi làm mới dữ liệu!')
    } finally {
      setRefreshing(false)
    }
  }

  // Xuất file Excel báo cáo doanh thu
  const handleExportExcel = async () => {
    const params = buildQueryParams()
    await exportExcel({
      target: 'revenue',
      filterType: params.type,
      date: params.date,
      month: params.month,
      year: params.year,
      filename: `Bao_Cao_Doanh_Thu_${params.type}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`,
    })
  }

  // Trích xuất dữ liệu tổng hợp
  const summary = revenueData?.summary || {}
  const timeline = Array.isArray(revenueData?.timeline) ? revenueData.timeline : []

  const totalRevenue = Number(summary?.totalRevenue || 0)
  const netRevenue = Number(summary?.netRevenue || 0)
  const originalTotal = Number(summary?.originalTotal || 0)
  const totalDiscount = Number(summary?.totalDiscount || 0)
  const totalRefund = Number(summary?.totalRefund || 0)
  const totalInvoices = Number(summary?.totalInvoices || 0)

  const cashAmount = Number(summary?.paymentMethodBreakdown?.cash || 0)
  const onlineAmount = Number(summary?.paymentMethodBreakdown?.online || 0)
  const totalPayment = cashAmount + onlineAmount
  const cashPct = totalPayment > 0 ? Math.round((cashAmount / totalPayment) * 100) : 0
  const onlinePct = totalPayment > 0 ? 100 - cashPct : 0

  // Tìm doanh thu lớn nhất trong timeline để dựng biểu đồ cột tương quan
  const maxTimelineRevenue = useMemo(() => {
    if (timeline.length === 0) return 1
    const maxVal = Math.max(...timeline.map((t) => Number(t.revenue || 0)))
    return maxVal > 0 ? maxVal : 1
  }, [timeline])

  // Định dạng nhãn hiển thị cho mốc thời gian trên biểu đồ
  const formatTimePointLabel = (tp) => {
    if (!tp) return ''
    if (filterType === 'day') {
      // "2026-10-15 08:00" -> "08:00"
      return tp.includes(' ') ? tp.split(' ')[1] : tp
    }
    if (filterType === 'month') {
      // "2026-10-15" -> "15/10"
      const parts = tp.split('-')
      if (parts.length === 3) return `${parts[2]}/${parts[1]}`
      return tp
    }
    if (filterType === 'year') {
      // "2026-10" -> "T10"
      const parts = tp.split('-')
      if (parts.length >= 2) return `T${parseInt(parts[1], 10)}`
      return tp
    }
    return tp
  }

  // Cột cho bảng diễn biến doanh thu
  const timelineColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Mốc Thời Gian',
      dataIndex: 'timePoint',
      key: 'timePoint',
      width: 150,
      render: (tp) => <Text strong style={{ color: '#1e293b' }}>{formatTimePointLabel(tp)}</Text>,
    },
    {
      title: 'Doanh Thu Thu Được',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 170,
      align: 'right',
      render: (val) => (
        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '14px' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Số Hóa Đơn',
      dataIndex: 'invoicesCount',
      key: 'invoicesCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color="purple" style={{ fontWeight: 600 }}>
          {count} hóa đơn
        </Tag>
      ),
    },
    {
      title: 'Tiền Mặt',
      dataIndex: 'cashAmount',
      key: 'cashAmount',
      width: 150,
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Chuyển Khoản / QR',
      dataIndex: 'onlineAmount',
      key: 'onlineAmount',
      width: 160,
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Tỷ Trọng Doanh Thu',
      key: 'share',
      width: 170,
      render: (_, r) => {
        const rev = Number(r.revenue || 0)
        const pct = totalRevenue > 0 ? Math.min(100, Math.round((rev / totalRevenue) * 100)) : 0
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={pct}
              size="small"
              strokeColor="#2563eb"
              showInfo={false}
              style={{ flex: 1, margin: 0 }}
            />
            <span style={{ fontSize: '12px', color: '#64748b', minWidth: 36 }}>{pct}%</span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="overview-tab">

      {/* HAI THẺ THỐNG KÊ HOẠT ĐỘNG GIỮ LẠI THEO ẢNH YÊU CẦU */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Card 1: Cảnh Báo Hết Hàng */}
        <Col xs={24} sm={12}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--red">
            <div className="stat-card-title">Cảnh Báo Hết Hàng</div>
            <div className="stat-card-content">
              <span className="stat-card-icon" role="img" aria-label="alarm">
                🚨
              </span>
              <span className="stat-card-number stat-card-number--red">
                {lowStockCount} mặt hàng
              </span>
            </div>
            <div className="stat-card-footer">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sản phẩm có tồn kho thực tế ≤ 10 đơn vị
              </Text>
              {lowStockCount > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => onNavigateTab && onNavigateTab('products')}
                  style={{ padding: 0 }}
                >
                  Xem ngay &rarr;
                </Button>
              )}
            </div>
          </Card>
        </Col>

        {/* Card 2: Đánh Giá Trung Bình */}
        <Col xs={24} sm={12}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--gold">
            <div className="stat-card-title">Đánh Giá Trung Bình</div>
            <div className="stat-card-content">
              <span className="stat-card-icon" role="img" aria-label="star">
                ⭐
              </span>
              <span className="stat-card-number stat-card-number--gold">
                {(feedbackSummary?.averageRating || 5.0).toFixed(1)} / 5.0
              </span>
            </div>
            <div className="stat-card-footer">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dựa trên {feedbackSummary?.totalFeedbacks || 0} lượt phản hồi từ khách hàng
              </Text>
              <Button
                type="link"
                size="small"
                onClick={() => onNavigateTab && onNavigateTab('feedback')}
                style={{ padding: 0 }}
              >
                Xem chi tiết &rarr;
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* THANH CÔNG CỤ BỘ LỌC DOANH THU & NÚT LÀM MỚI / XUẤT EXCEL */}
      <Card bordered={false} className="overview-tab__filter-card">
        <div className="filter-card-wrapper">
          <div className="filter-card-left">
            <div className="section-heading">
              <BarChartOutlined className="heading-icon" />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Báo Cáo Doanh Thu Bán Hàng
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Dữ liệu trực tiếp từ hóa đơn bán lẻ và dòng tiền thu ngân
                </Text>
              </div>
            </div>
          </div>

          <div className="filter-card-right">
            <Space size="middle" wrap>
              {/* Chọn chu kỳ: Ngày, Tháng, Năm */}
              <Radio.Group
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="day">Theo Ngày</Radio.Button>
                <Radio.Button value="month">Theo Tháng</Radio.Button>
                <Radio.Button value="year">Theo Năm</Radio.Button>
              </Radio.Group>

              {/* Bộ chọn thời gian tương ứng */}
              {filterType === 'day' && (
                <DatePicker
                  value={selectedDate}
                  onChange={(d) => d && setSelectedDate(d)}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  placeholder="Chọn ngày xem"
                  style={{ width: 140 }}
                />
              )}

              {filterType === 'month' && (
                <DatePicker
                  picker="month"
                  value={selectedDate}
                  onChange={(d) => d && setSelectedDate(d)}
                  format="MM/YYYY"
                  allowClear={false}
                  placeholder="Chọn tháng xem"
                  style={{ width: 140 }}
                />
              )}

              {filterType === 'year' && (
                <DatePicker
                  picker="year"
                  value={selectedDate}
                  onChange={(d) => d && setSelectedDate(d)}
                  format="YYYY"
                  allowClear={false}
                  placeholder="Chọn năm xem"
                  style={{ width: 120 }}
                />
              )}

              {/* Nút Làm mới làm mới cả 2 phần trong ảnh & báo cáo doanh thu */}
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                loading={refreshing}
                onClick={handleRefreshAll}
                size="middle"
              >
                Làm Mới
              </Button>

              {/* Nút Xuất Excel */}
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                className="export-excel-btn"
                size="middle"
              >
                Xuất Excel
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* KHỐI CHỈ SỐ DOANH THU & TÀI CHÍNH (TỪ API BE /api/report/revenue) */}
      <Spin spinning={reportLoading && !refreshing}>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {/* 1. Tổng doanh thu đã bán */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="overview-tab__metric-card metric-card--green">
              <Statistic
                title={<Text className="metric-title">Tổng Doanh Thu Hóa Đơn</Text>}
                value={totalRevenue}
                precision={0}
                valueStyle={{ color: '#16a34a', fontWeight: 700, fontSize: 24 }}
                prefix={<DollarOutlined />}
                suffix="đ"
              />
              <div className="metric-badge">
                <Tag color="success" style={{ fontWeight: 600 }}>
                  {totalInvoices} hóa đơn thanh toán
                </Tag>
              </div>
              <div className="metric-subtext">
                <Text type="secondary">
                  Tiền gốc ban đầu: <strong>{formatCurrency(originalTotal)}</strong>
                </Text>
              </div>
            </Card>
          </Col>

          {/* 2. Doanh thu thực thuần */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="overview-tab__metric-card metric-card--blue">
              <Statistic
                title={<Text className="metric-title">Doanh Thu Thực Thuần (Net)</Text>}
                value={netRevenue}
                precision={0}
                valueStyle={{ color: '#2563eb', fontWeight: 700, fontSize: 24 }}
                prefix={<CheckCircleOutlined />}
                suffix="đ"
              />
              <div className="metric-badge">
                <Tag color="processing" style={{ fontWeight: 600 }}>
                  Thực thu sau hoàn trả
                </Tag>
              </div>
              <div className="metric-subtext">
                <Text type="secondary">
                  Hoàn trả khách: <span style={{ color: '#dc2626' }}>-{formatCurrency(totalRefund)}</span>
                </Text>
              </div>
            </Card>
          </Col>

          {/* 3. Tổng chiết khấu / Giảm giá hội viên */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="overview-tab__metric-card metric-card--orange">
              <Statistic
                title={<Text className="metric-title">Chiết Khấu / Đổi Điểm</Text>}
                value={totalDiscount}
                precision={0}
                valueStyle={{ color: '#ea580c', fontWeight: 700, fontSize: 24 }}
                prefix={<GiftOutlined />}
                suffix="đ"
              />
              <div className="metric-badge">
                <Tag color="warning" style={{ fontWeight: 600 }}>
                  Ưu đãi khách hàng
                </Tag>
              </div>
              <div className="metric-subtext">
                <Text type="secondary">Số tiền giảm trừ qua tích điểm hội viên</Text>
              </div>
            </Card>
          </Col>

          {/* 4. Tổng tiền hoàn trả (Trả hàng) */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="overview-tab__metric-card metric-card--red">
              <Statistic
                title={<Text className="metric-title">Tiền Hoàn Trả (Phiếu Trả Hàng)</Text>}
                value={totalRefund}
                precision={0}
                valueStyle={{ color: '#dc2626', fontWeight: 700, fontSize: 24 }}
                prefix={<RollbackOutlined />}
                suffix="đ"
              />
              <div className="metric-badge">
                <Tag color="error" style={{ fontWeight: 600 }}>
                  Hàng khách trả lại
                </Tag>
              </div>
              <div className="metric-subtext">
                <Text type="secondary">Giá trị hoàn trả tiền cho khách</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* PHÂN PHỐI HÌNH THỨC THANH TOÁN (TIỀN MẶT VS ONLINE/QR) */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={12}>
            <Card bordered={false} className="overview-tab__payment-breakdown-card">
              <div className="payment-breakdown-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WalletOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                  <span style={{ fontWeight: 600, fontSize: 15 }}>Thu Tiền Mặt (CASH)</span>
                </div>
                <Tag color="green" style={{ fontWeight: 700, fontSize: 13 }}>
                  {cashPct}%
                </Tag>
              </div>
              <div style={{ margin: '12px 0 8px 0' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#15803d' }}>
                  {formatCurrency(cashAmount)}
                </span>
              </div>
              <Progress percent={cashPct} strokeColor="#16a34a" showInfo={false} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tổng tiền mặt khách hàng thanh toán tại quầy thu ngân POS
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card bordered={false} className="overview-tab__payment-breakdown-card">
              <div className="payment-breakdown-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QrcodeOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    Chuyển Khoản & Quét Mã QR (ONLINE)
                  </span>
                </div>
                <Tag color="blue" style={{ fontWeight: 700, fontSize: 13 }}>
                  {onlinePct}%
                </Tag>
              </div>
              <div style={{ margin: '12px 0 8px 0' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8' }}>
                  {formatCurrency(onlineAmount)}
                </span>
              </div>
              <Progress percent={onlinePct} strokeColor="#2563eb" showInfo={false} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Giao dịch quét mã VietQR và chuyển khoản ngân hàng tự động
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* BIỂU ĐỒ DIỄN BIẾN DOANH THU THEO MỐC THỜI GIAN */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChartOutlined style={{ color: '#2563eb' }} />
              <span>
                Diễn Biến Doanh Thu Theo{' '}
                {filterType === 'day' ? 'Giờ Trong Ngày' : filterType === 'month' ? 'Ngày Trong Tháng' : 'Tháng Trong Năm'}
              </span>
            </div>
          }
          bordered={false}
          className="overview-tab__chart-card"
          style={{ marginBottom: 20 }}
        >
          {timeline.length === 0 ? (
            <Empty
              description="Chưa có dữ liệu doanh thu trong khoảng thời gian đã chọn"
              style={{ padding: '40px 0' }}
            />
          ) : (
            <div>
              <div className="timeline-chart-container">
                <div className="timeline-chart-bars">
                  {timeline.map((item, idx) => {
                    const rev = Number(item.revenue || 0)
                    const heightPct = Math.max(8, Math.round((rev / maxTimelineRevenue) * 100))
                    const label = formatTimePointLabel(item.timePoint)

                    return (
                      <div key={item.timePoint || idx} className="chart-bar-column">
                        <Tooltip
                          title={
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                {item.timePoint}
                              </div>
                              <div>Doanh thu: <strong>{formatCurrency(rev)}</strong></div>
                              <div>Số hóa đơn: {item.invoicesCount}</div>
                              <div>Tiền mặt: {formatCurrency(item.cashAmount)}</div>
                              <div>Chuyển khoản: {formatCurrency(item.onlineAmount)}</div>
                            </div>
                          }
                          placement="top"
                        >
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{ height: `${heightPct}%` }}
                            >
                              {heightPct > 25 && (
                                <span className="bar-top-value">
                                  {rev >= 1000000
                                    ? `${(rev / 1000000).toFixed(1)}Tr`
                                    : rev >= 1000
                                      ? `${Math.round(rev / 1000)}k`
                                      : rev}
                                </span>
                              )}
                            </div>
                          </div>
                        </Tooltip>
                        <div className="bar-label">{label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* BẢNG CHI TIẾT DOANH THU THEO TỪNG MỐC THỜI GIAN */}
        <Card
          title="Bảng Chi Tiết Giao Dịch Doanh Thu"
          bordered={false}
          className="overview-tab__table-card"
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={timelineColumns}
            dataSource={timeline}
            rowKey={(r, idx) => r.timePoint || idx}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng cộng ${total} mốc ghi nhận doanh thu`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
            size="middle"
            scroll={{ x: 800 }}
          />
        </Card>
      </Spin>

      {/* LỐI TẮT TRUY CẬP NHANH CÁC PHÂN HỆ */}
      <Card title="Lối Tắt Phân Hệ Làm Việc Nhanh" bordered={false} className="overview-tab__quick-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Link to="/cashier" style={{ textDecoration: 'none' }}>
              <Button
                block
                size="large"
                icon={<ShoppingCartOutlined style={{ color: '#2563eb' }} />}
                className="quick-action-btn"
              >
                Mở Màn Hình Bán Hàng POS
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Link to="/inventory" style={{ textDecoration: 'none' }}>
              <Button
                block
                size="large"
                icon={<InboxOutlined style={{ color: '#ea580c' }} />}
                className="quick-action-btn"
              >
                Mở Phân Hệ Quản Lý Kho
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Button
              block
              size="large"
              icon={<StarOutlined style={{ color: '#ca8a04' }} />}
              onClick={() => onNavigateTab && onNavigateTab('feedback')}
              className="quick-action-btn"
            >
              Xem Đánh Giá & Phản Hồi
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
