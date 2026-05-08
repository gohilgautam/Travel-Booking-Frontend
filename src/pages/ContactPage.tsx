import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageCircle,
  Globe,
  Clock
} from 'lucide-react';
import { InstagramOutlined, TwitterOutlined, FacebookOutlined } from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/contact', formData);
      if (response.data.success) {
        toast.success('Message sent! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Sidebar>
      <div className="topbar" style={{ 
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(30px)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '20px 32px',
        marginBottom: '24px'
      }}>
        <div>
          <div className="topbar-title">Contact Us</div>
          <div className="topbar-sub">We'd love to hear from you.</div>
        </div>
      </div>

      <div className="page-body">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.2fr 0.8fr',
            gap: 24,
            alignItems: 'start'
          }}
        >
          {/* Contact Form */}
          <motion.div 
            variants={itemVariants}
            className="content-card"
            style={{ padding: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                color: '#f59e0b',
                padding: 12,
                borderRadius: 12
              }}>
                <MessageCircle size={24} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Send a Message</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-wrap">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-wrap">
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <div className="form-input-wrap">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Inquiry about Maldives Package"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <div className="form-input-wrap" style={{ borderRadius: 16 }}>
                  <textarea 
                    className="form-input" 
                    rows={5} 
                    placeholder="Tell us what's on your mind..."
                    style={{ resize: 'none', padding: '12px 16px' }}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="btn-primary"
                style={{ 
                  marginTop: 8,
                  height: 52,
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12
                }}
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info & Socials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <motion.div 
              variants={itemVariants}
              className="content-card"
              style={{ padding: '32px' }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 24 }}>Contact Information</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ color: '#f59e0b', marginTop: 4 }}><Mail size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Email Support</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@travelora.com</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ color: '#f59e0b', marginTop: 4 }}><Phone size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Phone</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91 98765 43210</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ color: '#f59e0b', marginTop: 4 }}><MapPin size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Main Office</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Galactic Tower, Sector 62,<br />
                      Noida, UP 201301
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ color: '#f59e0b', marginTop: 4 }}><Clock size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Working Hours</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mon - Sat: 9:00 AM - 7:00 PM</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="content-card"
              style={{ 
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>Follow Our Journey</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                Join our community of 50k+ explorers and get exclusive travel tips.
              </p>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <SocialLink icon={<InstagramOutlined style={{ fontSize: 20 }} />} label="Instagram" />
                <SocialLink icon={<TwitterOutlined style={{ fontSize: 20 }} />} label="Twitter" />
                <SocialLink icon={<FacebookOutlined style={{ fontSize: 20 }} />} label="Facebook" />
                <SocialLink icon={<Globe size={20} />} label="Website" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Sidebar>
  );
}

function SocialLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <motion.a
      href="#"
      whileHover={{ y: -4, background: '#f59e0b', color: '#000' }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        transition: 'all 0.2s'
      }}
      title={label}
    >
      {icon}
    </motion.a>
  );
}
