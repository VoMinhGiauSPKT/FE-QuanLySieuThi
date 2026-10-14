import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Divider,
  Select,
  Tag,
  Flex,
} from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime, formatDate } from '../../../../utils/formatters'
import { usePurchaseReceiptStore } from '../../../../stores/purchaseReceiptStore'
import { useCategoryStore } from '../../../../stores/categoryStore'
import './ImportReceiptView.scss'

const { Text, Title } = Typography

export default function ImportReceiptView() {
  const { receipts, loading, creating, fetchReceipts, fetchReceiptDetail, createReceipt } = usePurchaseReceiptStore()
  const { categories, allCategories, fetchAllCategories } = useCategoryStore()

  const safeCategories = allCategories.length > 0 ? allCategories : categories
  const safeReceipts = Array.isArray(receipts) ? receipts : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchReceipts({ limit: 20 })
    fetchAllCategories()
  }, [fetchReceipts, fetchAllCategories])

  const handleViewDetail = async (record) => {
    setSelectedReceipt(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await fetchReceiptDetail(record.voucherId)
      if (data) {
        setSelectedReceipt(data)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const defaultCatId = safeCategories && safeCategories.length > 0 ? safeCategories[0].categoryId : 'LSP001'

  // Danh sách dòng mặt hàng nhập trong modal
  const [items, setItems] = useState([
    {
      key: 1,
      productName: '',
      categoryId: defaultCatId,
      purchasedQuantity: 10,
      purchasePrice: 10000,
      unitPrice: 15000,
      expirationDate: null,
    },
  ])

  const handleAddItem = () => {
    const newKey = items.length > 0 ? Math.max(...items.map((i) => i.key)) + 1 : 1
    setItems([
      ...items,
      {
        key: newKey,
        productName: '',
        categoryId: defaultCatId,
        purchasedQuantity: 10,
        purchasePrice: 10000,
        unitPrice: 15000,
        expirationDate: null,
      },
    ])
  }

  const handleRemoveItem = (key) => {
    if (items.length <= 1) return
    setItems(items.filter((i) => i.key !== key))
  }

  const handleItemChange = (key, field, value) => {
    setItems(
      items.map((i) => {
        if (i.key === key) {
          return { ...i, [field]: value }
        }
        return i
      })
    )
  }

  const calculatedTotal = items.reduce(
    (sum, i) => sum + (Number(i.purchasedQuantity) || 0) * (Number(i.purchasePrice) || 0),
    0
  )

  const handleSubmit = async (values) => {
    const payload = {
      supplierName: values.supplierName,
      details: items.map((i) => ({
        productName: i.productName || 'Sản phẩm mới',
        categoryId: i.categoryId || defaultCatId,
        purchasedQuantity: Number(i.purchasedQuantity) || 1,
        purchasePrice: Number(i.purchasePrice) || 0,
        unitPrice: Number(i.unitPrice) || 0,
        expirationDate: i.expirationDate ? i.expirationDate.format('YYYY-MM-DD') : null,
      })),
    }

    const ok = await createReceipt(payload)
    if (ok) {
      setIsModalOpen(false)
      form.resetFields()
      setItems([
        {
          key: 1,
          productName: '',
          categoryId: defaultCatId,
          purchasedQuantity: 10,
          purchasePrice: 10000,
          unitPrice: 15000,
          expirationDate: null,
        },
      ])
      fetchReceipts({ limit: 20 })
    }
  }

  const columns = [
    {
      title: 'Mã Phiếu Nhập',
      dataIndex: 'voucherId',
      key: 'voucherId',
      render: (id) => <Text code>{id ? String(id).substring(0, 8) + '...' : ''}</Text>,
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (sup) => <Text strong>{sup || 'NCC Nội Bộ'}</Text>,
    },
    {
      title: 'Tổng Giá Trị Nhập',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <Text strong style={{ color: '#2563eb' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Thời Gian Lập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  const itemColumns = [
    {
      title: 'Tên Mặt Hàng',
      key: 'productName',
      render: (_, record) => (
        <Input
          placeholder="Nhập tên mặt hàng..."
          value={record.productName}
          onChange={(e) => handleItemChange(record.key, 'productName', e.target.value)}
        />
      ),
    },
    {
      title: 'Loại Sản Phẩm',
      key: 'categoryId',
      width: 170,
      render: (_, record) => (
        <Select
          value={record.categoryId}
          onChange={(val) => handleItemChange(record.key, 'categoryId', val)}
          style={{ width: '100%' }}
        >
          {safeCategories.map((cat) => (
            <Select.Option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'SL Nhập',
      key: 'purchasedQuantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.purchasedQuantity}
          onChange={(val) => handleItemChange(record.key, 'purchasedQuantity', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giá Nhập (VNĐ)',
      key: 'purchasePrice',
      width: 130,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={500}
          value={record.purchasePrice}
          onChange={(val) => handleItemChange(record.key, 'purchasePrice', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giá Bán Lẻ (VNĐ)',
      key: 'unitPrice',
      width: 130,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={500}
          value={record.unitPrice}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'HSD',
      key: 'expirationDate',
      width: 140,
      render: (_, record) => (
        <DatePicker
          placeholder="Chọn HSD"
          value={record.expirationDate}
          onChange={(date) => handleItemChange(record.key, 'expirationDate', date)}
          format="DD/MM/YYYY"
        />
      ),
    },
    {
      title: '',
      key: 'delete',
      width: 48,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          disabled={items.length <= 1}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ]

  return (
    <Card
      title="Quản Lý Phiếu Nhập Hàng Hóa Vào Kho"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8 }}
          >
            Tạo Phiếu Nhập Kho Mới
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetchReceipts({ limit: 20 })}>
            Làm Mới
          </Button>
        </Space>
      }
      bordered={false}
      className="import-receipt-view"
    >
      <Table
        dataSource={safeReceipts}
        columns={columns}
        rowKey="voucherId"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* Modal Tạo Phiếu Nhập */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Lập Phiếu Nhập Kho Mới</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={960}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ supplierName: '' }}>
          <Form.Item
            name="supplierName"
            label="Tên Nhà Cung Cấp / Đối Tác Giao Hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input placeholder="Ví dụ: Công ty CP Sữa Vinamilk..." size="large" />
          </Form.Item>

          <Divider style={{ margin: '16px 0 12px 0' }} />

          <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
            <Text strong>Danh sách mặt hàng nhập:</Text>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem} size="small">
              Thêm dòng mặt hàng
            </Button>
          </Flex>

          <Table
            dataSource={items}
            columns={itemColumns}
            pagination={false}
            size="small"
            className="import-receipt-view__batch-table"
          />

          <div className="import-receipt-view__modal-total">
            <Text strong>Tổng tiền nhập tạm tính:</Text>
            <Title level={4} style={{ margin: 0, color: '#16a34a' }}>
              {formatCurrency(calculatedTotal)}
            </Title>
          </div>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Xác Nhận & Nhập Kho
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chi Tiết Phiếu Nhập */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Phiếu Nhập #{selectedReceipt?.voucherId}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedReceipt && (
          <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <div>
                <Text type="secondary">Nhà cung cấp: </Text>
                <Text strong>{selectedReceipt.supplierName || 'NCC Nội Bộ'}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian nhập: </Text>
                <Text>{formatDateTime(selectedReceipt.createdAt)}</Text>
              </div>
              <div>
                <Text type="secondary">Tổng giá trị: </Text>
                <Text strong style={{ color: '#2563eb', fontSize: 16 }}>
                  {formatCurrency(selectedReceipt.totalAmount)}
                </Text>
              </div>
            </Space>

            <Divider style={{ margin: '12px 0' }}>Mặt Hàng Đã Nhập</Divider>

            <Table
              dataSource={selectedReceipt.details || []}
              columns={[
                {
                  title: 'Tên Mặt Hàng',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: 'Số Lượng',
                  dataIndex: 'purchasedQuantity',
                  key: 'purchasedQuantity',
                  render: (q) => <Tag color="blue">{q}</Tag>,
                },
                {
                  title: 'Giá Nhập',
                  dataIndex: 'purchasePrice',
                  key: 'purchasePrice',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'Giá Bán',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'Hạn Sử Dụng',
                  dataIndex: 'expirationDate',
                  key: 'expirationDate',
                  render: (d) => formatDate(d),
                },
              ]}
              rowKey={(r, idx) => r.productId || idx}
              pagination={false}
              size="small"
              loading={detailLoading}
            />
          </div>
        )}
      </Modal>
    </Card>
  )
}
