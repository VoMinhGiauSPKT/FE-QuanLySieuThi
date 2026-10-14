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
  message,
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
  const [submitted, setSubmitted] = useState(false)
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
    setSubmitted(true)

    // Kiểm tra không cho để trống tên sản phẩm ở bất kỳ dòng nào
    const emptyNameIndex = items.findIndex((i) => !i.productName || !i.productName.trim())
    if (emptyNameIndex !== -1) {
      message.error(`Dòng ${emptyNameIndex + 1}: Vui lòng nhập tên sản phẩm, không được để trống!`)
      return
    }

    // Kiểm tra hạn sử dụng bắt buộc
    const emptyExpIndex = items.findIndex((i) => !i.expirationDate)
    if (emptyExpIndex !== -1) {
      message.warning(`Dòng ${emptyExpIndex + 1}: Vui lòng chọn hạn sử dụng (HSD)!`)
      return
    }

    const payload = {
      supplierName: values.supplierName,
      items: items.map((i) => {
        const itemObj = {
          productName: i.productName.trim(),
          categoryId: i.categoryId || defaultCatId,
          purchasedQuantity: Number(i.purchasedQuantity) || 1,
          purchasePrice: Number(i.purchasePrice) || 0,
          unitPrice: Number(i.unitPrice) || 0,
          expirationDate: i.expirationDate
            ? (typeof i.expirationDate === 'string' ? i.expirationDate : i.expirationDate.format('YYYY-MM-DD'))
            : null,
        }
        if (i.productId) {
          itemObj.productId = i.productId
        }
        return itemObj
      }),
    }

    const ok = await createReceipt(payload)
    if (ok) {
      setIsModalOpen(false)
      form.resetFields()
      setSubmitted(false)
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
      render: (id) => <Text code>{id ? String(id).substring(0, 10) : ''}</Text>,
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (sup) => <Text strong>{sup || 'NCC Nội Bộ'}</Text>,
    },
    {
      title: 'Người Lập Phiếu',
      key: 'createdBy',
      render: (_, r) => <Text>{r.createdBy?.fullName || r.createdBy?.username || 'Thủ kho'}</Text>,
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
      title: (
        <span>
          <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>Tên Mặt Hàng
        </span>
      ),
      key: 'productName',
      render: (_, record) => {
        const isError = submitted && !record.productName?.trim()
        return (
          <div>
            <Input
              placeholder="Nhập tên mặt hàng (bắt buộc)..."
              value={record.productName}
              status={isError ? 'error' : ''}
              onChange={(e) => handleItemChange(record.key, 'productName', e.target.value)}
            />
            {isError && (
              <div style={{ color: '#ff4d4f', fontSize: 11, marginTop: 2, lineHeight: 1.2 }}>
                Không được để trống tên sản phẩm
              </div>
            )}
          </div>
        )
      },
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
      title: (
        <span>
          <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>HSD
        </span>
      ),
      key: 'expirationDate',
      width: 140,
      render: (_, record) => (
        <DatePicker
          placeholder="Chọn HSD"
          value={record.expirationDate}
          status={submitted && !record.expirationDate ? 'warning' : ''}
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
            onClick={() => {
              setSubmitted(false)
              setIsModalOpen(true)
            }}
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
        onCancel={() => {
          setSubmitted(false)
          setIsModalOpen(false)
        }}
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
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setIsModalOpen(false)
                }}
              >
                Hủy
              </Button>
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
        width={850}
      >
        {selectedReceipt && (
          <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <div>
                <Text type="secondary">Mã phiếu: </Text>
                <Text strong>{selectedReceipt.voucherId}</Text>
              </div>
              <div>
                <Text type="secondary">Nhà cung cấp: </Text>
                <Text strong>{selectedReceipt.supplierName || 'NCC Nội Bộ'}</Text>
              </div>
              <div>
                <Text type="secondary">Người lập phiếu: </Text>
                <Text>{selectedReceipt.createdBy?.fullName || selectedReceipt.createdBy?.username || 'Thủ kho'}</Text>
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
              dataSource={selectedReceipt.items || selectedReceipt.details || []}
              columns={[
                {
                  title: 'Mã SP',
                  dataIndex: 'productId',
                  key: 'productId',
                  render: (id) => <Text code>{id || '-'}</Text>,
                },
                {
                  title: 'Tên Mặt Hàng',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: 'Loại SP',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  render: (c) => <Tag color="blue">{c || 'Chung'}</Tag>,
                },
                {
                  title: 'SL Nhập',
                  dataIndex: 'purchasedQuantity',
                  key: 'purchasedQuantity',
                  render: (q) => <Tag color="purple">{q}</Tag>,
                },
                {
                  title: 'Giá Nhập',
                  dataIndex: 'purchasePrice',
                  key: 'purchasePrice',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'Thành Tiền',
                  dataIndex: 'lineTotal',
                  key: 'lineTotal',
                  render: (lt, rec) => formatCurrency(lt ?? (rec.purchasedQuantity * rec.purchasePrice)),
                },
                {
                  title: 'Hạn Sử Dụng',
                  dataIndex: 'expirationDate',
                  key: 'expirationDate',
                  render: (d) => formatDate(d),
                },
              ]}
              rowKey={(r, idx) => r.purchaseDetailId || r.productId || idx}
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
