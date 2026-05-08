import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Upload, Space, Tag, Typography,
  ConfigProvider, theme
} from 'antd';
import { toast } from 'react-toastify';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../../utils/sweetalert';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import { AdminSidebar } from '../../components/Sidebar';
import { packageService, type TravelPackage } from '../../services/packageService';
import { categoryService, type Category } from '../../services/categoryService';

const { Text } = Typography;

// Original colour palette
const PRIMARY = '#f59e0b';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#a1a1aa';
const SUCCESS = '#10b981';
const DANGER = '#ef4444';
const WARNING = '#f59e0b';

const GRADIENTS = [
  { label: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
];



export default function AdminPackages() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TravelPackage | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgData, catData] = await Promise.all([
        packageService.getAll(),
        categoryService.getAll()
      ]);
      setPackages(pkgData);
      setCategories(catData.filter(c => c.active !== false));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const fd = new FormData();

      const highlights = values.highlights
        ? values.highlights.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      const includes = values.includes
        ? values.includes.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      Object.entries({ ...values, highlights: JSON.stringify(highlights), includes: JSON.stringify(includes) }).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });

      if (values.imageFile && values.imageFile.length > 0) {
        values.imageFile.forEach((fileObj: any) => {
          if (fileObj.originFileObj) {
            fd.append('images', fileObj.originFileObj);
          }
        });
      }

      if (editRecord) {
        const updated = await packageService.update(editRecord._id, fd);
        setPackages(prev => prev.map(p => p._id === updated._id ? updated : p));
        toast.success('Package updated successfully');
      } else {
        const created = await packageService.create(fd);
        setPackages(prev => [created, ...prev]);
        toast.success('New package created');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      toast.error('Please check the form for errors');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirmAlert(
      'Are you sure?',
      'This package will be permanently removed from the catalog.',
      'Yes, Delete It'
    );

    if (result.isConfirmed) {
      try {
        await packageService.delete(id);
        setPackages(prev => prev.filter(p => p._id !== id));
        showSuccessAlert('Deleted!', 'The travel package has been removed.');
      } catch (err: any) {
        showErrorAlert('Error', err?.response?.data?.message || 'Could not delete the package');
      }
    }
  };

  const handleToggle = async (record: TravelPackage) => {
    const updated = await packageService.toggleStatus(record._id);
    setPackages(prev => prev.map(p => p._id === updated._id ? updated : p));
    toast.info(`Package ${updated.active !== false ? 'activated' : 'deactivated'}`);
  };

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({
      country: 'India',
      duration: 1,
      price: 0,
      originalPrice: 0,
      emoji: '🌍',
      gradient: GRADIENTS[0].value,
      category: categories.length > 0 ? categories[0].slug : 'other',
      available: true,
      seats: 20,
      highlights: '',
      includes: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (record: TravelPackage) => {
    setEditRecord(record);
    form.setFieldsValue({
      ...record,
      highlights: (record.highlights ?? []).join(', '),
      includes: (record.includes ?? []).join(', '),
    });
    setModalOpen(true);
  };

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(searchText.toLowerCase()) ||
    p.destination.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Package',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: TravelPackage) => (
        <Space>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: record.gradient || 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {record.emoji || '🌍'}
          </div>
          <div>
            <Text strong>{record.title}</Text>
            <br />
            <Text style={{ color: TEXT_SECONDARY, fontSize: 12 }}>⏱ {record.duration} Days</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Destination',
      key: 'destination',
      render: (_: any, record: TravelPackage) => (
        <Text style={{ color: TEXT_SECONDARY }}>📍 {record.destination}, {record.country}</Text>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: any, record: TravelPackage) => (
        <div>
          <Text strong style={{ color: PRIMARY }}>₹{record.price.toLocaleString('en-IN')}</Text>
          {(record.originalPrice ?? 0) > 0 && (
            <Text delete style={{ color: TEXT_SECONDARY, marginLeft: 8, fontSize: 12 }}>
              ₹{record.originalPrice?.toLocaleString('en-IN')}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      key: 'seats',
      align: 'center' as const,
    },
    {
      title: 'Status',
      key: 'active',
      render: (_: any, record: TravelPackage) => (
        <Tag color={record.active !== false ? SUCCESS : DANGER}>
          {record.active !== false ? 'Active' : 'Hidden'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TravelPackage) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Button
            ghost
            size="small"
            icon={record.active !== false ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => handleToggle(record)}
            style={{ color: record.active !== false ? WARNING : SUCCESS, borderColor: record.active !== false ? WARNING : SUCCESS }}
          />
          <Button 
            danger 
            ghost 
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminSidebar>
      {/* Apply glassmorphism colour scheme to all Ant Design components */}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: PRIMARY,
            colorBgContainer: 'rgba(20, 20, 40, 0.45)',
            colorBgElevated: 'rgba(25, 25, 45, 0.75)',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            colorText: TEXT_PRIMARY,
            colorTextSecondary: TEXT_SECONDARY,
            borderRadius: 16,
            controlHeight: 38,
            fontFamily: 'inherit',
          },
          components: {
            Table: {
              headerBg: 'rgba(245, 158, 11, 0.15)',
              headerColor: '#fff',
              rowHoverBg: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            },
            Modal: {
              contentBg: 'rgba(20, 20, 40, 0.85)',
              headerBg: 'transparent',
            },
            Input: {
              activeBorderColor: PRIMARY,
              hoverBorderColor: PRIMARY,
              colorBgContainer: 'rgba(0, 0, 0, 0.3)',
            },
            Select: {
              optionSelectedBg: 'rgba(245, 158, 11, 0.2)',
              colorBgContainer: 'rgba(0, 0, 0, 0.3)',
            },
            Button: {
              defaultGhostColor: TEXT_SECONDARY,
            },
          },
        }}
      >
        <div style={{ padding: window.innerWidth < 768 ? 12 : 24, position: 'relative', zIndex: 1 }}>
          <Space direction="vertical" size="large" style={{ 
            width: '100%', 
            background: 'rgba(20, 20, 40, 0.45)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: 20, 
            padding: window.innerWidth < 768 ? 16 : 24, 
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' 
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: 16
            }}>
              <div>
                <Text strong style={{ fontSize: 24, display: 'block' }}>📦 Packages</Text>
                <Text style={{ color: TEXT_SECONDARY }}>Manage travel packages</Text>
              </div>
              <Space direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }}>
                <Input.Search
                  placeholder="Search packages..."
                  allowClear
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: window.innerWidth < 768 ? '100%' : 250 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} block={window.innerWidth < 768}>
                  Add Package
                </Button>
              </Space>
            </div>

            {/* Table Card */}
            <Table<TravelPackage>
              dataSource={filtered}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              locale={{ emptyText: 'No packages found' }}
              scroll={{ x: 800 }}
            />
          </Space>
        </div>

        {/* Add/Edit Modal with preserved gradient picker */}
        <Modal
          title={editRecord ? '✏️ Edit Package' : '➕ Add Package'}
          open={modalOpen}
          onOk={handleSave}
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
          }}
          width={window.innerWidth < 768 ? '95%' : 700}
          okText={editRecord ? 'Update' : 'Create'}
          destroyOnClose
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
            initialValues={{
              title: '',
              destination: '',
              country: 'India',
              duration: 1,
              price: 0,
              originalPrice: 0,
              emoji: '🌍',
              gradient: GRADIENTS[0].value,
              category: categories.length > 0 ? categories[0].slug : 'other',
              available: true,
              seats: 20,
              highlights: '',
              includes: '',
              description: '',
              travelMode: 'Mixed',
              contact: '',
            }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', 
              gap: 16 
            }}>
              <Form.Item name="title" label="Package Title" rules={[{ required: true }]} style={{ gridColumn: '1 / -1' }}>
                <Input placeholder="e.g. Goa Beach Bliss" />
              </Form.Item>
              <Form.Item name="destination" label="Destination" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="country" label="Country">
                <Input />
              </Form.Item>
              <Form.Item name="duration" label="Duration (Days)">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="category" label="Category">
                <Select options={categories.map(c => ({ value: c.slug, label: `${c.icon || ''} ${c.name}`.trim() }))} />
              </Form.Item>
              <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="originalPrice" label="Original Price (₹)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="emoji" label="Emoji Icon">
                <Input maxLength={2} />
              </Form.Item>
              <Form.Item name="seats" label="Available Seats">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="gradient" label="Card Color" style={{ gridColumn: '1 / -1' }}>
                <Space wrap>
                  {GRADIENTS.map(g => (
                    <div
                      key={g.value}
                      onClick={() => form.setFieldValue('gradient', g.value)}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: g.value,
                        cursor: 'pointer',
                        border: form.getFieldValue('gradient') === g.value ? '3px solid #fff' : '3px solid transparent',
                        transition: 'border 0.15s'
                      }}
                      title={g.label}
                    />
                  ))}
                </Space>
              </Form.Item>
              <Form.Item name="description" label="Description" style={{ gridColumn: '1 / -1' }}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="highlights" label="Highlights (comma separated)" style={{ gridColumn: '1 / -1' }}>
                <Input placeholder="e.g. Scuba diving, Sunset cruise" />
              </Form.Item>
              <Form.Item name="includes" label="Includes (comma separated)" style={{ gridColumn: '1 / -1' }}>
                <Input placeholder="e.g. Breakfast, Airport transfer" />
              </Form.Item>
              <Form.Item name="travelMode" label="✈️ Travel Mode">
                <Select
                  options={[
                    { value: 'Flight', label: '✈️ Flight' },
                    { value: 'Train', label: '🚆 Train' },
                    { value: 'Bus', label: '🚌 Bus' },
                    { value: 'Cruise', label: '🚢 Cruise' },
                    { value: 'Car', label: '🚗 Car' },
                    { value: 'Mixed', label: '🔄 Mixed' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="contact" label="📞 Contact Info">
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
              <Form.Item name="available" label="Availability">
                <Select
                  options={[
                    { value: true, label: '✅ Available' },
                    { value: false, label: '❌ Unavailable' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="imageFile"
                label="Package Image"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={5}
                  multiple
                  listType="picture"
                  accept="image/*"
                >
                  <Button icon={<PlusOutlined />} block>Select Images (Max 5)</Button>
                </Upload>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </ConfigProvider>
    </AdminSidebar>
  );
}