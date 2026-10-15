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
  Modal,
  Descriptions,
  Spin,
  Tag,
} from 'antd'
import {
  StarFilled,
  ReloadOutlined,
  CommentOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '../../../../utils/formatters'
import { useFeedbackStore } from '../../../../stores/feedbackStore'
import './FeedbackReviewTab.scss'

const { Title, Text, Paragraph } = Typography

export default function FeedbackReviewTab() {
  const {
    feedbackData,
    loading,
    detailLoading,
    pagination,
    selectedRating,
    fetchFeedbacks,
    fetchFeedbackById,
    setSelectedRating,
  } = useFeedbackStore()
  const [internalRating, setInternalRating] = useState(selectedRating || 0)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingFeedback, setViewingFeedback] = useState(null)

  useEffect(() => {
    fetchFeedbacks({
      page: 1,
      limit: pagination?.pageSize || 8,
      rating: internalRating || undefined,
    })
  }, [fetchFeedbacks, internalRating])

  const handleRatingChange = (val) => {
    setInternalRating(val)
    setSelectedRating(val)
    fetchFeedbacks({
      page: 1,
      limit: pagination?.pageSize || 8,
      rating: val || undefined,
    })
  }

  const handleRefresh = () => {
    fetchFeedbacks({
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 8,
      rating: internalRating || undefined,
    })
  }

  const handleTableChange = (pag) => {
    fetchFeedbacks({
      page: pag.current,
      limit: pag.pageSize,
      rating: internalRating || undefined,
    })
  }

  // Bấm xem chi tiết đánh giá: Gọi API GET /api/feedback/:id
  const handleOpenDetail = async (record) => {
    setViewingFeedback(record)
    setIsDetailModalOpen(true)
    const detail = await fetchFeedbackById(record.feedbackId)
    if (detail) {
      setViewingFeedback(detail)
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
      width: 160,
      render: (stars) => <Rate disabled value={stars} style={{ fontSize: 14, color: '#faad14' }} />,
    },
    {
      title: 'Nội Dung Góp Ý & Cảm Nhận',
      dataIndex: 'comment',
      key: 'comment',
      render: (c) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} style={{ margin: 0 }}>
          {c || <Text type="secondary">(Không có nhận xét chi tiết)</Text>}
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
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleOpenDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="feedback-review-tab">
      {/* Thẻ Thống Kê Điểm Số & Tỷ Lệ Đánh Giá */}
      <Card bordered={false} className="feedback-review-tab__stat-card">
        <Row gutter={[32, 24]} align="middle">
          {/* Cột 1: Điểm số trung bình */}
          <Col xs={24} md={8}>
            <div className="feedback-review-tab__score-box">
              <Title level={1} className="score-title">
                {summary.averageRating ? summary.averageRating.toFixed(1) : '5.0'}
              </Title>
              <div style={{ margin: '8px 0' }}>
                <Rate
                  disabled
                  allowHalf
                  value={summary.averageRating || 5}
                  character={<StarFilled />}
                  style={{ fontSize: 24, color: '#faad14' }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Dựa trên <strong>{summary.totalFeedbacks}</strong> lượt đánh giá của khách
              </Text>
            </div>
          </Col>

          {/* Cột 2: Thanh tỷ lệ sao */}
          <Col xs={24} md={16}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {breakdown.map((b) => {
                const percent = Math.round((b.count / total) * 100)
                return (
                  <Row key={b.stars} align="middle" gutter={12}>
                    <Col span={4}>
                      <Space size={4}>
                        <span>{b.stars}</span>
                        <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                      </Space>
                    </Col>
                    <Col span={16}>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor="#faad14"
                        trailColor="#f5f5f5"
                        size={['100%', 10]}
                      />
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                      <Text type="secondary">{b.count} lượt</Text>
                    </Col>
                  </Row>
                )
              })}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Danh Sách Chi Tiết Ý Kiến Phản Hồi */}
      <Card
        title={
          <Space>
            <CommentOutlined />
            <span>Chi Tiết Phản Hồi Của Khách Hàng</span>
          </Space>
        }
        extra={
          <Space>
            <span>Lọc theo số sao:</span>
            <Select
              value={internalRating}
              onChange={handleRatingChange}
              style={{ width: 140 }}
            >
              <Select.Option value={0}>Tất cả số sao</Select.Option>
              <Select.Option value={5}>5 Sao (Xuất sắc)</Select.Option>
              <Select.Option value={4}>4 Sao (Hài lòng)</Select.Option>
              <Select.Option value={3}>3 Sao (Bình thường)</Select.Option>
              <Select.Option value={2}>2 Sao (Chưa tốt)</Select.Option>
              <Select.Option value={1}>1 Sao (Kém)</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm Mới
            </Button>
          </Space>
        }
        bordered={false}
        className="feedback-review-tab__table-card"
      >
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="feedbackId"
          loading={loading}
          pagination={{
            current: pagination?.current || 1,
            pageSize: pagination?.pageSize || 8,
            total: pagination?.total != null ? pagination.total : feedbacks.length,
            showTotal: (t) => `Tổng cộng ${t} đánh giá`,
            showSizeChanger: true,
            pageSizeOptions: ['6', '8', '12', '24'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal Xem Chi Tiết Đánh Giá */}
      <Modal
        title="Chi Tiết Ý Kiến Đánh Giá Của Khách Hàng"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setViewingFeedback(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={540}
      >
        <Spin spinning={detailLoading}>
          {viewingFeedback && (
            <Descriptions bordered column={1} size="middle" style={{ marginTop: 12 }}>
              <Descriptions.Item label="Mã Đánh Giá">
                <Tag color="blue">{viewingFeedback.feedbackId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách Hàng">
                <Text strong>{viewingFeedback.customerName || 'Khách hàng ẩn danh'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                {viewingFeedback.phoneNumber || <Text type="secondary">Không cung cấp</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Mức Độ Hài Lòng">
                <Space>
                  <Rate disabled value={viewingFeedback.rating} style={{ fontSize: 16, color: '#faad14' }} />
                  <Text strong>({viewingFeedback.rating} / 5 sao)</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Gửi">
                {formatDateTime(viewingFeedback.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Nội Dung Góp Ý">
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {viewingFeedback.comment || <Text type="secondary">(Không có nhận xét chi tiết)</Text>}
                </Paragraph>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </div>
  )
}

