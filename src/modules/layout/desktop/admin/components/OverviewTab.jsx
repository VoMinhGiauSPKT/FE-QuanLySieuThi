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
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../../../utils/formatters'
import { usePaymentStore } from '../../../../../stores/paymentStore'
import { useProductStore } from '../../../../../stores/productStore'
import { useFeedbackStore } from '../../../../../stores/feedbackStore'
import { useReportStore } from '../../../../../stores/reportStore'

const { Text } = Typography

export default function OverviewTab({
  paymentSummary: propPaymentSummary,
  lowStockCount: propLowStockCount,
  feedbackSummary: propFeedbackSummary,
  pendingReportsCount: propPendingReportsCount,
  onNavigateTab,
}) {
  const paymentStore = usePaymentStore()
  const productStore = useProductStore()
  const feedbackStore = useFeedbackStore()
  const reportStore = useReportStore()

  const paymentSummary = propPaymentSummary ?? paymentStore.summary
  const lowStockCount = propLowStockCount ?? productStore.lowStockCount
  const feedbackSummary = propFeedbackSummary ?? feedbackStore.feedbackData?.summary
  const pendingReportsCount = propPendingReportsCount ?? reportStore.reports?.length

  useEffect(() => {
    if (!propPaymentSummary) {
      paymentStore.fetchPaymentSummary()
    }
    if (propLowStockCount === undefined) {
      productStore.fetchLowStockAlerts(10)
    }
    if (!propFeedbackSummary) {
      feedbackStore.fetchFeedbacks()
    }
    if (propPendingReportsCount === undefined) {
      reportStore.fetchReports(1, 10)
    }
  }, [propPaymentSummary, propLowStockCount, propFeedbackSummary, propPendingReportsCount])
  return (
    <div>
      {/* Cảnh báo nếu có tồn kho thấp hoặc báo cáo kiểm kê cần xem */}
      {(lowStockCount > 0 || pendingReportsCount > 0) && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
          message={
            <Space wrap>
              {lowStockCount > 0 && (
                <span>
                  ⚠️ Có <strong>{lowStockCount}</strong> mặt hàng sắp hết hàng trong kho.
                </span>
              )}
              {pendingReportsCount > 0 && (
                <span>
                  📋 Có <strong>{pendingReportsCount}</strong> biên bản kiểm kê kho cần bạn xem xét!
                </span>
              )}
            </Space>
          }
          action={
            <Space>
              {lowStockCount > 0 && (
                <Button size="small" type="primary" onClick={() => onNavigateTab('products')}>
                  Xem Sản Phẩm
                </Button>
              )}
              {pendingReportsCount > 0 && (
                <Button size="small" onClick={() => onNavigateTab('inventory-reports')}>
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
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #52c41a',
            }}
          >
            <Statistic
              title={<Text type="secondary">Tổng Doanh Thu Hệ Thống</Text>}
              value={paymentSummary?.totalRevenue || 0}
              formatter={(val) => formatCurrency(val)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Tiền mặt: {formatCurrency(paymentSummary?.totalCash || 0)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #1890ff',
            }}
          >
            <Statistic
              title={<Text type="secondary">Giao Dịch Thanh Toán</Text>}
              value={paymentSummary?.totalTransactions || 0}
              suffix="Lượt"
              prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              VNPay: {formatCurrency(paymentSummary?.totalVnpay || 0)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #faad14',
            }}
          >
            <Statistic
              title={<Text type="secondary">Cảnh Báo Hết Hàng (Kho)</Text>}
              value={lowStockCount || 0}
              suffix="Sản phẩm"
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Ngưỡng tồn kho: $\le 10$ đơn vị
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #722ed1',
            }}
          >
            <Statistic
              title={<Text type="secondary">Đánh Giá Khách Hàng</Text>}
              value={feedbackSummary?.averageRating || 5.0}
              precision={1}
              suffix={`/ 5 ⭐ (${feedbackSummary?.totalFeedbacks || 0} lượt)`}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Mức độ hài lòng của khách mua sắm
            </div>
          </Card>
        </Col>
      </Row>

      {/* Truy cập nhanh các nghiệp vụ */}
      <Card
        title={
          <Space>
            <CreditCardOutlined style={{ color: '#1890ff' }} />
            <span>Phân Hệ Nghiệp Vụ Hoạt Động Trực Tuyến</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Link to="/cashier" style={{ textDecoration: 'none' }}>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                block
                style={{
                  height: 52,
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Mở Quầy Thu Ngân (POS Bán Hàng)
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Link to="/inventory" style={{ textDecoration: 'none' }}>
              <Button
                type="primary"
                icon={<InboxOutlined />}
                size="large"
                block
                style={{
                  height: 52,
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Mở Phân Hệ Quản Lý Kho
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<FileTextOutlined />}
              size="large"
              block
              onClick={() => onNavigateTab('inventory-reports')}
              style={{
                height: 52,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Xem Biên Bản Kiểm Kê Lệch Tồn
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
