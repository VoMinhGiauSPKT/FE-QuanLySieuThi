import { Modal, Form, Input, Space, Button } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'

export default function CustomerRegisterModal({
  open,
  initialPhone,
  onCancel,
  onRegister,
  loading,
}) {
  const [form] = Form.useForm()

  return (
    <Modal
      title="Đăng Ký Thành Viên Mới Tại Quầy"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ phoneNumber: initialPhone }}
        onFinish={async (values) => {
          const ok = await onRegister(values)
          if (ok) {
            form.resetFields()
          }
        }}
      >
        <Form.Item
          name="fullName"
          label="Họ và Tên khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên khách hàng!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Ví dụ: Trần Văn B" size="large" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Số điện thoại (để tích điểm)"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại gồm 10-11 chữ số!' },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0909123456" size="large" />
        </Form.Item>

        <Form.Item name="email" label="Email (tùy chọn)">
          <Input prefix={<MailOutlined />} placeholder="Ví dụ: khachhang@gmail.com" size="large" />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đăng Ký & Gắn Vào Hóa Đơn
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )
}
