import { useEffect } from 'react'
import { Row, Col, Card, Statistic, Button, Space, Typography, Alert } from 'antd'
import {
  DollarOutlined,
  ShoppingOutlined,
  AlertOutlined,
  StarOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../../utils/formatters'
import { usePaymentStore } from '../../../../stores/paymentStore'
import { useProductStore } from '../../../../stores/productStore'
import { useFeedbackStore } from '../../../../stores/feedbackStore'
import { useReportStore } from '../../../../stores/reportStore'
import './OverviewTab.scss'

const { Text } = Typography

export default function OverviewTab({ onNavigateTab }) {
  const { summary: paymentSummary, fetchPaymentSummary } = usePaymentStore()
  const { lowStockCount, fetchLowStockAlerts } = useProductStore()
  const { feedbackData, fetchFeedbacks } = useFeedbackStore()
  const { reports, fetchReports } = useReportStore()

  const feedbackSummary = feedbackData?.summary
  const pendingReportsCount = reports?.length || 0

  useEffect(() => {
    fetchPaymentSummary()
    fetchLowStockAlerts(10)
    fetchFeedbacks()
    fetchReports(1, 10)
  }, [fetchPaymentSummary, fetchLowStockAlerts, fetchFeedbacks, fetchReports])

  return (
    <div className="overview-tab">
      {/* Cảnh báo nếu có tồn kho thấp hoặc báo cáo kiểm kê */}
      {(lowStockCount > 0 || pendingReportsCount > 0) && (
        <Alert
          type="warning"
          showIcon
          className="overview-tab__alert"
          message={
            <Space wrap>
              {lowStockCount > 0 && (
                <Space size="small">
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>
                    Có <strong>{lowStockCount}</strong> mặt hàng sắp hết hàng trong kho.
                  </span>
                </Space>
              )}
              {pendingReportsCount > 0 && (
                <Space size="small">
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span>
                    Có <strong>{pendingReportsCount}</strong> biên bản kiểm kê kho cần bạn xem xét!
                  </span>
                </Space>
              )}
            </Space>
          }
          action={
            <Space>
              {lowStockCount > 0 && (
                <Button size="small" type="primary" onClick={() => onNavigateTab && onNavigateTab('products')}>
                  Xem Sản Phẩm
                </Button>
              )}
              {pendingReportsCount > 0 && (
                <Button size="small" onClick={() => onNavigateTab && onNavigateTab('inventory-reports')}>
                  Xem Báo Cáo
                </Button>
              )}
            </Space>
          }
        />
      )}

      {/* Thẻ thống kê tài chính & hoạt động */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--green">
            <Statistic
              title={<Text type="secondary">Tổng Doanh Thu Đã Thu</Text>}
              value={paymentSummary?.totalPaid ?? paymentSummary?.finalAmount ?? paymentSummary?.totalRevenue ?? 0}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--blue">
            <Statistic
              title={<Text type="secondary">Tổng Tiền Gốc Hóa Đơn</Text>}
              value={paymentSummary?.originalTotal ?? paymentSummary?.totalAmount ?? 0}
              precision={0}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--red">
            <Statistic
              title={<Text type="secondary">Cảnh Báo Hết Hàng</Text>}
              value={lowStockCount}
              valueStyle={{ color: '#cf1322', fontWeight: 700 }}
              prefix={<AlertOutlined />}
              suffix="mặt hàng"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="overview-tab__stat-card overview-tab__stat-card--gold">
            <Statistic
              title={<Text type="secondary">Đánh Giá Trung Bình</Text>}
              value={feedbackSummary?.averageRating || 5.0}
              precision={1}
              valueStyle={{ color: '#d48806', fontWeight: 700 }}
              prefix={<StarOutlined />}
              suffix="/ 5.0"
            />
          </Card>
        </Col>
      </Row>

      {/* Phân loại tài chính */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <span>Tổng Tiền Chiết Khấu / Giảm Giá</span>
              </Space>
            }
            bordered={false}
            className="overview-tab__stat-card"
          >
            <Statistic
              value={paymentSummary?.discountAmount ?? 0}
              precision={0}
              valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 700 }}
              suffix="đ"
            />
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              Tổng số tiền đã giảm trừ cho khách hàng qua đổi điểm thưởng hội viên.
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <CreditCardOutlined style={{ color: '#1890ff' }} />
                <span>Doanh Thu Thực Sau Chiết Khấu</span>
              </Space>
            }
            bordered={false}
            className="overview-tab__stat-card"
          >
            <Statistic
              value={paymentSummary?.finalAmount ?? 0}
              precision={0}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 700 }}
              suffix="đ"
            />
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              Số tiền thực thu của toàn bộ hóa đơn bán lẻ trong hệ thống.
            </Text>
          </Card>
        </Col>
      </Row>


      {/* Lối tắt truy cập các phân hệ nghiệp vụ */}
      <Card
        title="Lối Tắt Phân Hệ Làm Việc Nhanh"
        bordered={false}
        className="overview-tab__quick-card"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Link to="/cashier" style={{ textDecoration: 'none' }}>
              <Button
                block
                size="large"
                icon={<ShoppingCartOutlined />}
                style={{
                  height: 60,
                  fontSize: 15,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
                icon={<InboxOutlined />}
                style={{
                  height: 60,
                  fontSize: 15,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Mở Phân Hệ Quản Lý Kho
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Button
              block
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => onNavigateTab && onNavigateTab('feedback')}
              style={{
                height: 60,
                fontSize: 15,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Xem Phản Hồi Khách Hàng
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
