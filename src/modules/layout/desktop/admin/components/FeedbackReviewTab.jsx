import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Rate,
  Progress,
  Table,
  Typography,
  Space,
  Select,
  Button,
} from 'antd'
import {
  StarFilled,
  ReloadOutlined,
  CommentOutlined,
  SmileOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../../utils/formatters'
import { useFeedbackStore } from '../../../../../stores/feedbackStore'

const { Title, Text, Paragraph } = Typography

export default function FeedbackReviewTab({
  feedbackData: propFeedbackData,
  loading: propLoading,
  selectedRating: propSelectedRating,
  onRatingChange,
  onRefresh,
}) {
  const store = useFeedbackStore()

  const feedbackData = propFeedbackData ?? store.feedbackData
  const loading = propLoading ?? store.loading
  const selectedRating = propSelectedRating !== undefined ? propSelectedRating : store.selectedRating

  useEffect(() => {
    if (!propFeedbackData) {
      store.fetchFeedbacks()
    }
  }, [propFeedbackData])

  const handleRatingChange = (val) => {
    if (onRatingChange) {
      onRatingChange(val)
    } else {
      store.setSelectedRating(val)
      store.fetchFeedbacks(val)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      store.fetchFeedbacks(selectedRating)
    }
  }
  const summary = feedbackData?.summary || {
    totalFeedbacks: 0,
    averageRating: 5.0,
    ratingBreakdown: {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    },
  }

  const feedbacks = feedbackData?.feedbacks || []
  const total = summary.totalFeedbacks || 1

  const breakdown = [
    { stars: 5, count: summary.ratingBreakdown?.fiveStar || 0 },
    { stars: 4, count: summary.ratingBreakdown?.fourStar || 0 },
    { stars: 3, count: summary.ratingBreakdown?.threeStar || 0 },
    { stars: 2, count: summary.ratingBreakdown?.twoStar || 0 },
    { stars: 1, count: summary.ratingBreakdown?.oneStar || 0 },
  ]

  const columns = [
    {
      title: 'Khách Hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (name, rec) => (
        <div>
          <Text strong>{name || 'Khách hàng'}</Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {rec.phoneNumber ? `SĐT: ${rec.phoneNumber}` : 'Khách ẩn danh'}
          </div>
        </div>
      ),
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => (
        <Rate disabled value={rating} style={{ fontSize: 14, color: '#faad14' }} />
      ),
    },
    {
      title: 'Ý Kiến Đóng Góp / Nhận Xét',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => (
        <Paragraph style={{ margin: 0, fontStyle: 'italic', color: '#262626' }}>
          "{comment}"
        </Paragraph>
      ),
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (d) => formatDateTime(d),
    },
  ]

  return (
    <div>
      {/* Phân tích tổng hợp & Phân bố số sao */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              height: '100%',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <SmileOutlined style={{ fontSize: 40, color: '#faad14', marginBottom: 8 }} />
            <Title level={1} style={{ margin: 0, color: '#faad14', fontWeight: 700 }}>
              {summary.averageRating ? Number(summary.averageRating).toFixed(1) : '5.0'}
            </Title>
            <div style={{ margin: '8px 0' }}>
              <Rate
                allowHalf
                disabled
                value={Number(summary.averageRating) || 5}
                style={{ color: '#faad14' }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Dựa trên <strong>{summary.totalFeedbacks}</strong> lượt đánh giá của khách hàng
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            title="Mức Độ Phân Bố Theo Số Sao"
            bordered={false}
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            {breakdown.map((item) => {
              const percent = Math.round((item.count / (total || 1)) * 100)
              return (
                <Row key={item.stars} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={4}>
                    <Space size={4}>
                      <span>{item.stars}</span>
                      <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                    </Space>
                  </Col>
                  <Col span={16}>
                    <Progress
                      percent={percent}
                      strokeColor={item.stars >= 4 ? '#52c41a' : item.stars === 3 ? '#faad14' : '#ff4d4f'}
                      showInfo={false}
                    />
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.count} lượt
                    </Text>
                  </Col>
                </Row>
              )
            })}
          </Card>
        </Col>
      </Row>

      {/* Danh sách ý kiến chi tiết */}
      <Card
        title={
          <Space>
            <CommentOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Đóng Góp & Phản Hồi Từ Khách Hàng</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Lọc theo số sao"
              value={selectedRating}
              onChange={handleRatingChange}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value={5}>5 sao (Rất tốt)</Select.Option>
              <Select.Option value={4}>4 sao (Tốt)</Select.Option>
              <Select.Option value={3}>3 sao (Bình thường)</Select.Option>
              <Select.Option value={2}>2 sao (Kém)</Select.Option>
              <Select.Option value={1}>1 sao (Rất tệ)</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm Mới
            </Button>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="feedbackId"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  )
}
