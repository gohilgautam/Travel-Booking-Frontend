import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Upload, Space, Button, Typography, ConfigProvider, theme, Row, Col, Divider } from 'antd';
import { 
  PlusOutlined, 
  ArrowLeftOutlined, 
  InfoCircleOutlined, 
  EnvironmentOutlined, 
  TagOutlined, 
  FileTextOutlined, 
  PictureOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminSidebar } from '../../components/Sidebar';
import { packageService } from '../../services/packageService';
import { categoryService, type Category } from '../../services/categoryService';
import { toast } from 'react-toastify';

const { Text, Title } = Typography;

const PRIMARY = '#f59e0b';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#a1a1aa';

const GRADIENTS = [
  { label: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function AdminPackageFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const catData = await categoryService.getAll();
        setCategories(catData.filter(c => c.active !== false));

        if (isEdit) {
          const pkg = await packageService.getById(id!);
          form.setFieldsValue({
            ...pkg,
            highlights: pkg.highlights?.join(', '),
            includes: pkg.includes?.join(', '),
            subDestinations: pkg.subDestinations?.join(', '),
          });
        } else {
          form.setFieldsValue({
            title: '',
            destination: '',
            country: 'India',
            duration: 1,
            price: 0,
            originalPrice: 0,
            emoji: '🌍',
            gradient: GRADIENTS[0].value,
            category: catData.length > 0 ? catData[0].slug : 'other',
            available: true,
            seats: 20,
            highlights: '',
            includes: '',
            subDestinations: '',
            description: '',
            travelMode: 'Mixed',
            contact: '',
          });
        }
      } catch (err) {
        toast.error('Failed to load data');
        navigate('/admin/packages');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit, form, navigate]);

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
      const subDestinations = values.subDestinations
        ? values.subDestinations.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      Object.entries({
        ...values,
        highlights: JSON.stringify(highlights),
        includes: JSON.stringify(includes),
        subDestinations: JSON.stringify(subDestinations)
      }).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== 'imageFile') fd.append(k, String(v));
      });

      if (values.imageFile && values.imageFile.length > 0) {
        values.imageFile.forEach((fileObj: any) => {
          if (fileObj.originFileObj) {
            fd.append('images', fileObj.originFileObj);
          }
        });
      }

      setSaving(true);
      if (isEdit) {
        await packageService.update(id!, fd);
        toast.success('Package updated successfully');
      } else {
        await packageService.create(fd);
        toast.success('New package created');
      }
      navigate('/admin/packages');
    } catch (error) {
      console.error(error);
      toast.error('Please check the form for errors');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
            <ClockCircleOutlined style={{ fontSize: 40, color: PRIMARY }} />
          </motion.div>
          <Text style={{ display: 'block', marginTop: 16, color: TEXT_SECONDARY }}>Loading Galaxy Data...</Text>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: PRIMARY,
            colorBgContainer: 'rgba(20, 20, 35, 0.6)',
            colorBgElevated: 'rgba(30, 30, 50, 0.95)',
            colorBorder: 'rgba(255, 255, 255, 0.08)',
            colorText: TEXT_PRIMARY,
            colorTextSecondary: TEXT_SECONDARY,
            borderRadius: 12,
            controlHeight: 42,
          },
          components: {
            Input: { colorBgContainer: 'rgba(0, 0, 0, 0.2)', hoverBorderColor: PRIMARY, activeBorderColor: PRIMARY },
            InputNumber: { colorBgContainer: 'rgba(0, 0, 0, 0.2)', hoverBorderColor: PRIMARY, activeBorderColor: PRIMARY },
            Select: { colorBgContainer: 'rgba(0, 0, 0, 0.2)', optionSelectedBg: 'rgba(245, 158, 11, 0.2)' },
            Divider: { colorSplit: 'rgba(255, 255, 255, 0.06)' }
          },
        }}
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}
        >
          {/* Pixel Perfect Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 32,
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <Space size="large" align="center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/packages')} 
                type="text" 
                style={{ 
                  color: TEXT_SECONDARY, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  padding: '4px 8px'
                }}
              >
                Back to Inventory
              </Button>
              <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <Title level={4} style={{ margin: 0, color: TEXT_PRIMARY, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {isEdit ? '✏️ Edit Package' : '🚀 New Adventure'}
              </Title>
            </Space>
            <Button 
              type="primary" 
              size="large" 
              icon={isEdit ? <CheckCircleOutlined /> : <PlusOutlined />}
              onClick={handleSave} 
              loading={saving}
              style={{ 
                height: 44,
                padding: '0 28px', 
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {isEdit ? 'Update Package' : 'Launch Package'}
            </Button>
          </div>

          <Form form={form} layout="vertical" requiredMark={false} size="large">
            <Row gutter={[32, 32]}>
              {/* Left Column - Core Data */}
              <Col xs={24} lg={15}>
                <motion.div variants={itemVariants} className="glass-card" style={{ padding: 32, borderRadius: 24, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ padding: 8, background: 'rgba(245,158,11,0.1)', borderRadius: 10, color: PRIMARY }}>
                      <InfoCircleOutlined style={{ fontSize: 18 }} />
                    </div>
                    <Title level={5} style={{ color: TEXT_PRIMARY, margin: 0 }}>Basic Information</Title>
                  </div>
                  
                  <Form.Item name="title" label="Package Title" rules={[{ required: true, message: 'Please enter a title' }]}>
                    <Input placeholder="e.g. Mysterious Maldives Getaway" style={{ height: 50, fontSize: '1.15rem', fontWeight: 600, borderRadius: 12 }} />
                  </Form.Item>

                  <Row gutter={20}>
                    <Col span={14}>
                      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Select 
                          prefix={<TagOutlined />}
                          style={{ borderRadius: 12 }}
                          options={categories.map(c => ({ value: c.slug, label: `${c.icon || '📍'} ${c.name}` }))} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item name="emoji" label="Emoji Icon">
                        <Input placeholder="🌍" style={{ textAlign: 'center', fontSize: '1.4rem', height: 42 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="description" label="The Story & Vision">
                    <Input.TextArea rows={6} placeholder="Describe the journey in a way that captivates travelers..." style={{ borderRadius: 12, padding: 16 }} />
                  </Form.Item>

                  <Divider style={{ margin: '32px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ padding: 8, background: 'rgba(34,197,94,0.1)', borderRadius: 10, color: '#22c55e' }}>
                      <EnvironmentOutlined style={{ fontSize: 18 }} />
                    </div>
                    <Title level={5} style={{ color: TEXT_PRIMARY, margin: 0 }}>Route & Logistics</Title>
                  </div>

                  <Row gutter={20}>
                    <Col span={12}>
                      <Form.Item name="destination" label="Primary Destination" rules={[{ required: true }]}>
                        <Input placeholder="City or Region" style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="country" label="Country">
                        <Input placeholder="e.g. India" style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="subDestinations" label="Sub Destinations (Comma Separated Stops)">
                    <Input placeholder="e.g. Mumbai, Goa, Kochi" style={{ borderRadius: 12 }} />
                  </Form.Item>

                  <Row gutter={20}>
                    <Col span={12}>
                      <Form.Item name="travelMode" label="Primary Transport">
                        <Select
                          style={{ borderRadius: 12 }}
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
                    </Col>
                    <Col span={12}>
                      <Form.Item name="available" label="Market Visibility">
                        <Select
                          style={{ borderRadius: 12 }}
                          options={[
                            { value: true, label: '🟢 Active & Public' },
                            { value: false, label: '🔴 Hidden / Private' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </motion.div>
              </Col>

              {/* Right Column - Pricing & Media */}
              <Col xs={24} lg={9}>
                <Space direction="vertical" size={32} style={{ width: '100%' }}>
                  {/* Pricing Card */}
                  <motion.div variants={itemVariants} style={{ padding: 28, borderRadius: 24, background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.1)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <TagOutlined style={{ color: PRIMARY, fontSize: 18 }} />
                      <Title level={5} style={{ color: TEXT_PRIMARY, margin: 0 }}>Pricing & Slots</Title>
                    </div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="price" label="Sale Price (₹)" rules={[{ required: true }]}>
                          <InputNumber prefix="₹" style={{ width: '100%', borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="originalPrice" label="MSRP (₹)">
                          <InputNumber prefix="₹" style={{ width: '100%', borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="duration" label="Days" rules={[{ required: true }]}>
                          <InputNumber min={1} style={{ width: '100%', borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="seats" label="Max Seats">
                          <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="contact" label="Inquiry Hotline" style={{ marginBottom: 0 }}>
                      <Input placeholder="+91 00000 00000" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </motion.div>

                  {/* Theme Selector */}
                  <motion.div variants={itemVariants} style={{ padding: 28, borderRadius: 24, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <PictureOutlined style={{ color: PRIMARY, fontSize: 18 }} />
                      <Title level={5} style={{ color: TEXT_PRIMARY, margin: 0 }}>Visual Identity</Title>
                    </div>
                    <Form.Item name="gradient" label="Card Gradient Theme" style={{ marginBottom: 0 }}>
                      <Row gutter={[10, 10]}>
                        {GRADIENTS.map(g => (
                          <Col span={8} key={g.value}>
                            <motion.div
                              whileHover={{ scale: 1.08, y: -2 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => form.setFieldValue('gradient', g.value)}
                              style={{
                                height: 42,
                                borderRadius: 10,
                                background: g.value,
                                cursor: 'pointer',
                                border: form.getFieldValue('gradient') === g.value ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'border 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: form.getFieldValue('gradient') === g.value ? '0 0 15px rgba(255,255,255,0.2)' : 'none'
                              }}
                            >
                              {form.getFieldValue('gradient') === g.value && <CheckCircleOutlined style={{ color: '#fff', fontSize: 16 }} />}
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </Form.Item>
                  </motion.div>

                  {/* Gallery Card */}
                  <motion.div variants={itemVariants} style={{ padding: 28, borderRadius: 24, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <PlusOutlined style={{ color: PRIMARY, fontSize: 18 }} />
                      <Title level={5} style={{ color: TEXT_PRIMARY, margin: 0 }}>Media Gallery</Title>
                    </div>
                    <Form.Item
                      name="imageFile"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                      style={{ marginBottom: 0 }}
                    >
                      <Upload 
                        beforeUpload={() => false} 
                        maxCount={5} 
                        multiple 
                        listType="picture-card" 
                        accept="image/*"
                        className="custom-uploader"
                      >
                        <div style={{ color: TEXT_SECONDARY }}>
                          <PlusOutlined style={{ fontSize: 20 }} />
                          <div style={{ marginTop: 8, fontSize: 12 }}>Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: '0.75rem', marginTop: 12, display: 'block', opacity: 0.6 }}>
                      JPG/PNG, Max 5MB per file.
                    </Text>
                  </motion.div>

                  {/* Mobile Submit */}
                  <div style={{ display: window.innerWidth < 992 ? 'block' : 'none', marginTop: 12 }}>
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleSave} 
                      loading={saving} 
                      block 
                      icon={<SendOutlined />}
                      style={{ height: 50, borderRadius: 14 }}
                    >
                      {isEdit ? 'Update Package' : 'Launch Package'}
                    </Button>
                  </div>
                </Space>
              </Col>
            </Row>
          </Form>
        </motion.div>
      </ConfigProvider>

      <style>{`
        .glass-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .ant-form-item-label label {
          color: #a1a1aa !important;
          font-weight: 600 !important;
          font-size: 0.82rem !important;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 4px;
        }
        .ant-input, .ant-input-number, .ant-select-selector, .ant-input-affix-wrapper {
          border-color: rgba(255, 255, 255, 0.08) !important;
          background: rgba(0, 0, 0, 0.25) !important;
          transition: all 0.3s ease !important;
        }
        .ant-input:hover, .ant-input-number:hover, .ant-select-selector:hover, .ant-input-affix-wrapper:hover {
          border-color: var(--primary) !important;
          background: rgba(0, 0, 0, 0.35) !important;
        }
        .ant-input:focus, .ant-input-number-focused, .ant-select-focused .ant-select-selector, .ant-input-affix-wrapper-focused {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1) !important;
        }
        .ant-input-number-handler-wrap {
          display: none;
        }
        .custom-uploader .ant-upload-select {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px dashed rgba(255, 255, 255, 0.15) !important;
          border-radius: 14px !important;
        }
        .custom-uploader .ant-upload-list-item {
          border-radius: 12px !important;
          padding: 8px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </AdminSidebar>
  );
}
