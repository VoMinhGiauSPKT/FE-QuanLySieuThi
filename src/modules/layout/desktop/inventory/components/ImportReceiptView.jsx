import { useState } from 'react'
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
} from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { formatCurrency, formatDateTime, formatDate } from '../../../../../utils/formatters'

const { Text, Title } = Typography

export default function ImportReceiptView({
  receipts,
  loading,
  onCreateReceipt,
  creating,
  onRefresh,
}) {
  const safeReceipts = Array.isArray(receipts) ? receipts : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Danh sách các dòng mặt hàng nhập trong Form
  const [items, setItems] = useState([
    {
      key: 1,
      productName: '',
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
        purchasedQuantity: Number(it.purchasedQuantity),
        purchasePrice: Number(it.purchasePrice),
        unitPrice: Number(it.unitPrice),
        expirationDate: it.expirationDate ? it.expirationDate.format('YYYY-MM-DDTHH:mm:ss') : undefined,
      })),
    }

    const ok = await onCreateReceipt(payload)
    if (ok) {
      form.resetFields()
      setItems([
        {
          key: 1,
          productName: '',
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
      render: (id) => <Text code>{id ? id.substring(0, 8) + '...' : 'N/A'}</Text>,
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
          onClick={() => {
            setSelectedReceipt(record)
            setIsDetailModalOpen(true)
          }}
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
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <div>
                  <Text style={{ fontSize: 12 }}>Tên Sản Phẩm:</Text>
                  <Input
                    placeholder="Tên sản phẩm"
                    value={item.productName}
                    onChange={(e) => handleItemFieldChange(item.key, 'productName', e.target.value)}
                  />
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
        title="Chi Tiết Phiếu Nhập Hàng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedReceipt && (
          <div>
            <p>
              Nhà cung cấp: <strong>{selectedReceipt.supplierName}</strong>
            </p>
            <p>Thời gian: {formatDateTime(selectedReceipt.createdAt)}</p>
            <p>
              Tổng tiền:{' '}
              <strong style={{ color: '#1890ff' }}>{formatCurrency(selectedReceipt.totalAmount)}</strong>
            </p>
            <Divider style={{ margin: '12px 0' }} />
            <Table
              columns={[
                { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
                { title: 'SL Nhập', dataIndex: 'purchasedQuantity', key: 'purchasedQuantity' },
                {
                  title: 'Giá Nhập',
                  dataIndex: 'purchasePrice',
                  key: 'purchasePrice',
                  render: (p) => formatCurrency(p),
                },
                {
                  title: 'HSD',
                  dataIndex: 'expirationDate',
                  key: 'expirationDate',
                  render: (d) => formatDate(d),
                },
              ]}
              dataSource={selectedReceipt.importedProducts || []}
              rowKey="productId"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
