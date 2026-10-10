import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'requester', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <div style={s.logoDot}></div>
            <span style={s.logoText}>Crisis Connect</span>
          </div>
          <h1 style={s.heroTitle}>Join the<br /><span style={s.heroAccent}>network.</span></h1>
          <p style={s.heroSub}>Be part of a community that shows up when it matters most. Every volunteer saves lives.</p>
          <div style={s.featureList}>
            {['Instant crisis alerts near you', 'Real-time volunteer coordination', 'Verified skill-based matching', 'Community reputation system'].map((f, i) => (
              <div key={i} style={s.feature}>
                <div style={s.featureDot}></div>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.stepRow}>
            {[1, 2].map(n => (
              <div key={n} style={{...s.stepDot, ...(step >= n ? s.stepActive : {}), ...(step > n ? s.stepDone : {})}}>{step > n ? '✓' : n}</div>
            ))}
            <div style={s.stepLine}></div>
          </div>
          <h2 style={s.formTitle}>{step === 1 ? 'Choose your role' : 'Your details'}</h2>
          <p style={s.formSub}>{step === 1 ? 'How will you use Crisis Connect?' : 'Fill in your information'}</p>
          {error && <div style={s.errorBox}><span style={s.errorDot}></span>{error}</div>}
          {success && <div style={s.successBox}><span style={s.successDot}></span>{success}</div>}

          {step === 1 && (
            <div style={s.roleSection}>
              <div style={{...s.roleCard, ...(form.role === 'requester' ? s.roleCardActiveRed : {})}}
                onClick={() => setForm({...form, role: 'requester'})}>
                <div style={s.roleIcon}>🆘</div>
                <div style={s.roleName}>Requester</div>
                <div style={s.roleDesc}>I need help during a crisis situation</div>
                {form.role === 'requester' && <div style={s.roleCheck}>✓</div>}
              </div>
              <div style={{...s.roleCard, ...(form.role === 'volunteer' ? s.roleCardActiveGreen : {})}}
                onClick={() => setForm({...form, role: 'volunteer'})}>
                <div style={s.roleIcon}>🤝</div>
                <div style={s.roleName}>Volunteer</div>
                <div style={s.roleDesc}>I want to help people near me</div>
                {form.role === 'volunteer' && <div style={{...s.roleCheck, background: '#1D9E75'}}>✓</div>}
              </div>
              <button style={{...s.btn, ...(form.role === 'volunteer' ? s.btnGreen : {})}}
                onClick={() => setStep(2)}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldRow}>
                <div style={s.field}>
                  <label style={s.label}>Full name</label>
                  <input style={s.input} type="text" placeholder="Arjun Kumar"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone</label>
                  <input style={s.input} type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Email address</label>
                <input style={s.input} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button style={{...s.btn, flex: 1, ...(form.role === 'volunteer' ? s.btnGreen : {})}}
                  type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account →'}
                </button>
              </div>
            </form>
          )}
          <p style={s.switchText}>Already have an account? <Link to="/login" style={s.switchLink}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0a' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a0505 0%, #0a0a0a 60%)', display: 'flex', alignItems: 'center', padding: '60px', borderRight: '1px solid #1f1f1f' },
  leftContent: { maxWidth: '480px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' },
  logoDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#E24B4A', boxShadow: '0 0 12px #E24B4A' },
  logoText: { fontSize: '16px', fontWeight: '700', color: '#fff', letterSpacing: '0.02em' },
  heroTitle: { fontSize: '56px', fontWeight: '800', lineHeight: '1.1', color: '#fff', marginBottom: '20px' },
  heroAccent: { color: '#E24B4A' },
  heroSub: { fontSize: '16px', color: '#666', lineHeight: '1.7', marginBottom: '40px' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E24B4A', flexShrink: 0 },
  featureText: { fontSize: '14px', color: '#888' },
  right: { width: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: '#0a0a0a' },
  formBox: { width: '100%', maxWidth: '400px' },
  stepRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', position: 'relative' },
  stepDot: { width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#555', fontWeight: '600', zIndex: 1 },
  stepActive: { background: '#E24B4A', border: '1px solid #E24B4A', color: '#fff' },
  stepDone: { background: '#1a3a1a', border: '1px solid #1D9E75', color: '#1D9E75' },
  stepLine: { flex: 1, height: '1px', background: '#222' },
  formTitle: { fontSize: '26px', fontWeight: '700', color: '#fff', marginBottom: '8px' },
  formSub: { fontSize: '14px', color: '#555', marginBottom: '28px' },
  errorBox: { background: '#1a0505', border: '1px solid #4a1515', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' },
  errorDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E24B4A', flexShrink: 0 },
  successBox: { background: '#0a1a0a', border: '1px solid #1a4a1a', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' },
  successDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0 },
  roleSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  roleCard: { padding: '20px', border: '1px solid #1f1f1f', borderRadius: '12px', cursor: 'pointer', background: '#111', position: 'relative', transition: 'all 0.2s' },
  roleCardActiveRed: { border: '1px solid #E24B4A', background: '#1a0505' },
  roleCardActiveGreen: { border: '1px solid #1D9E75', background: '#0a1a0f' },
  roleIcon: { fontSize: '24px', marginBottom: '8px' },
  roleName: { fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  roleDesc: { fontSize: '13px', color: '#555' },
  roleCheck: { position: 'absolute', top: '16px', right: '16px', width: '22px', height: '22px', borderRadius: '50%', background: '#E24B4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: {},
  label: { display: 'block', fontSize: '11px', fontWeight: '500', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '13px 16px', background: '#141414', border: '1px solid #222', borderRadius: '10px', fontSize: '14px', color: '#fff', outline: 'none' },
  btn: { width: '100%', padding: '14px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  btnGreen: { background: '#1D9E75' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '4px' },
  backBtn: { padding: '14px 20px', background: 'transparent', border: '1px solid #222', borderRadius: '10px', color: '#555', fontSize: '14px', cursor: 'pointer' },
  switchText: { textAlign: 'center', fontSize: '13px', color: '#444', marginTop: '24px' },
  switchLink: { color: '#E24B4A', textDecoration: 'none', fontWeight: '500' }
};