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
} from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime, formatDate } from '../../../../../utils/formatters'
import { usePurchaseReceiptStore } from '../../../../../stores/purchaseReceiptStore'
import { useCategoryStore } from '../../../../../stores/categoryStore'

const { Text, Title } = Typography

export default function ImportReceiptView({
  receipts: propReceipts,
  loading: propLoading,
  onCreateReceipt,
  creating: propCreating,
  onRefresh,
  categories: propCategories,
}) {
  const receiptStore = usePurchaseReceiptStore()
  const categoryStore = useCategoryStore()

  const receipts = propReceipts ?? receiptStore.receipts
  const loading = propLoading ?? receiptStore.loading
  const creating = propCreating ?? receiptStore.creating
  const categories = propCategories && propCategories.length > 0
    ? propCategories
    : (categoryStore.allCategories.length > 0 ? categoryStore.allCategories : categoryStore.categories)

  const safeReceipts = Array.isArray(receipts) ? receipts : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!propReceipts) {
      receiptStore.fetchReceipts({ limit: 20 })
    }
    if (!propCategories || propCategories.length === 0) {
      categoryStore.fetchAllCategories()
    }
  }, [propReceipts, propCategories])

  const handleViewDetail = async (record) => {
    setSelectedReceipt(record)
    setIsDetailModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await receiptStore.fetchReceiptDetail(record.voucherId)
      if (data) {
        setSelectedReceipt(data)
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu nhập:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      receiptStore.fetchReceipts({ limit: 20 })
    }
  }

  const defaultCatId = categories && categories.length > 0 ? categories[0].categoryId : 'LSP001'

  // Danh sách các dòng mặt hàng nhập trong Form
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
    setItems((prev) => [
      ...prev,
      {
        key: Date.now(),
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
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const handleItemFieldChange = (key, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    )
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.purchasedQuantity || 0) * (item.purchasePrice || 0),
    0
  )

  const handleFinish = async (values) => {
    // Validate tên sản phẩm
    for (const it of items) {
      if (!it.productName.trim()) {
        Modal.error({ title: 'Thiếu thông tin', content: 'Vui lòng nhập tên cho tất cả các mặt hàng nhập!' })
        return
      }
    }

    const payload = {
      supplierName: values.supplierName,
      note: values.note || 'Nhập hàng vào kho',
      items: items.map((it) => ({
        productName: it.productName.trim(),
        categoryId: it.categoryId || defaultCatId,
        purchasedQuantity: Number(it.purchasedQuantity),
        purchasePrice: Number(it.purchasePrice),
        unitPrice: Number(it.unitPrice),
        expirationDate: it.expirationDate ? it.expirationDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      })),
    }

    const ok = onCreateReceipt ? await onCreateReceipt(payload) : await receiptStore.createReceipt(payload)
    if (ok) {
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
      setIsModalOpen(false)
    }
  }

  const columns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'voucherId',
      key: 'voucherId',
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (sup) => <Text strong>{sup}</Text>,
    },
    {
      title: 'Người Lập Phiếu',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdByName',
      render: (name, rec) => name || rec.createdBy?.employeeId || 'Thủ kho',
    },
    {
      title: 'Tổng Giá Trị Nhập',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: 'Ngày Lập Phiếu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDateTime(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#1890ff' }} />}
          onClick={() => handleViewDetail(record)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Lịch Sử Phiếu Nhập Hàng Vào Kho"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ borderRadius: 8 }}
            >
              Lập Phiếu Nhập Mới
            </Button>
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
          dataSource={safeReceipts}
          rowKey="voucherId"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal lập phiếu nhập hàng */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Lập Phiếu Nhập Hàng Vào Kho</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={850}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="supplierName"
            label="Nhà Cung Cấp / Đối Tác"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input placeholder="Ví dụ: Công ty TNHH Thực Phẩm Vinamilk" size="large" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú đợt nhập hàng">
            <Input placeholder="Ví dụ: Nhập bổ sung đồ uống và bánh kẹo cuối tuần" />
          </Form.Item>

          <Divider orientation="left">Danh Sách Mặt Hàng Nhập Kho</Divider>

          {items.map((item, idx) => (
            <Card
              key={item.key}
              size="small"
              style={{ marginBottom: 12, borderRadius: 8, background: '#fafafa' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong># Món hàng {idx + 1}</Text>
                {items.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(item.key)}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div>
                  <Text style={{ fontSize: 12 }}>Tên Sản Phẩm:</Text>
                  <Input
                    placeholder="Tên sản phẩm"
                    value={item.productName}
                    onChange={(e) => handleItemFieldChange(item.key, 'productName', e.target.value)}
                  />
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>Loại Sản Phẩm:</Text>
                  <Select
                    placeholder="Chọn loại SP"
                    style={{ width: '100%' }}
                    value={item.categoryId || defaultCatId}
                    onChange={(val) => handleItemFieldChange(item.key, 'categoryId', val)}
                  >
                    {categories && categories.length > 0 ? (
                      categories.map((c) => (
                        <Select.Option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName} ({c.categoryId})
                        </Select.Option>
                      ))
                    ) : (
                      <Select.Option value="LSP001">Mặc định (LSP001)</Select.Option>
                    )}
                  </Select>
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>Số Lượng Nhập:</Text>
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    value={item.purchasedQuantity}
                    onChange={(val) => handleItemFieldChange(item.key, 'purchasedQuantity', val || 1)}
                  />
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>Giá Nhập (VNĐ):</Text>
                  <InputNumber
                    min={1000}
                    step={1000}
                    style={{ width: '100%' }}
                    value={item.purchasePrice}
                    onChange={(val) => handleItemFieldChange(item.key, 'purchasePrice', val || 0)}
                  />
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>Giá Bán Lẻ (VNĐ):</Text>
                  <InputNumber
                    min={1000}
                    step={1000}
                    style={{ width: '100%' }}
                    value={item.unitPrice}
                    onChange={(val) => handleItemFieldChange(item.key, 'unitPrice', val || 0)}
                  />
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>Hạn Sử Dụng (HSD):</Text>
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Chọn HSD"
                    value={item.expirationDate}
                    onChange={(d) => handleItemFieldChange(item.key, 'expirationDate', d)}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thành tiền:{' '}
                  <strong style={{ color: '#1890ff' }}>
                    {formatCurrency(item.purchasedQuantity * item.purchasePrice)}
                  </strong>
                </Text>
              </div>
            </Card>
          ))}

          <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddItem} style={{ marginBottom: 16 }}>
            Thêm Mặt Hàng Vào Phiếu
          </Button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Tổng Tiền Phiếu Nhập:
            </Title>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              {formatCurrency(totalAmount)}
            </Title>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Xác Nhận Nhập Kho
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal chi tiết phiếu nhập */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Chi Tiết Phiếu Nhập Hàng: {selectedReceipt?.voucherId}</span>
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '8px 16px',
                padding: '12px 16px',
                background: '#f8fafd',
                border: '1px solid #e6f0fa',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                <Text type="secondary">Mã phiếu nhập: </Text>
                <Tag color="blue">{selectedReceipt.voucherId}</Tag>
              </div>
              <div>
                <Text type="secondary">Nhà cung cấp: </Text>
                <Text strong>{selectedReceipt.supplierName}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian: </Text>
                <Text strong>{formatDateTime(selectedReceipt.createdAt)}</Text>
              </div>
              <div>
                <Text type="secondary">Người lập: </Text>
                <Text strong>
                  {selectedReceipt.createdBy?.fullName ||
                    selectedReceipt.createdBy?.username ||
                    selectedReceipt.createdBy?.employeeId ||
                    'Thủ kho'}
                </Text>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #d9d9d9', paddingTop: 8, marginTop: 4 }}>
                <Text type="secondary">Tổng giá trị phiếu: </Text>
                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                  {formatCurrency(selectedReceipt.totalAmount)}
                </Text>
              </div>
            </div>

            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
              Danh Sách Mặt Hàng Nhập Kho:
            </Text>
            <Table
              loading={detailLoading}
              columns={[
                {
                  title: 'Mã SP',
                  dataIndex: 'productId',
                  key: 'productId',
                  width: 90,
                  render: (id) => <Tag color="blue">{id}</Tag>,
                },
                {
                  title: 'Tên Sản Phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (name) => <Text strong>{name}</Text>,
                },
                {
                  title: 'Loại SP',
                  dataIndex: 'categoryName',
                  key: 'categoryName',
                  render: (cat) => (cat ? <Tag color="cyan">{cat}</Tag> : '-'),
                },
                {
                  title: 'SL Nhập',
                  dataIndex: 'purchasedQuantity',
                  key: 'purchasedQuantity',
                  align: 'center',
                  width: 90,
                },
                {
                  title: 'Giá Nhập',
                  dataIndex: 'purchasePrice',
                  key: 'purchasePrice',
                  align: 'right',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'Thành Tiền',
                  dataIndex: 'lineTotal',
                  key: 'lineTotal',
                  align: 'right',
                  render: (total, r) =>
                    formatCurrency(total || (r.purchasedQuantity * r.purchasePrice)),
                },
                {
                  title: 'HSD',
                  dataIndex: 'expirationDate',
                  key: 'expirationDate',
                  render: (d) => formatDate(d),
                },
              ]}
              dataSource={selectedReceipt.items || selectedReceipt.importedProducts || []}
              rowKey={(r) => r.purchaseDetailId || r.productId || Math.random()}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
