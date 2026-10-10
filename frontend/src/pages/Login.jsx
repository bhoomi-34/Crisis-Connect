import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'volunteer') navigate('/volunteer');
      else navigate('/requester');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <h1 style={s.heroTitle}>Every second<br /><span style={s.heroAccent}>matters.</span></h1>
          <p style={s.heroSub}>A real-time community crisis response platform connecting people in need with nearby volunteers.</p>
          <div style={s.statsRow}>
            <div style={s.stat}><div style={s.statNum}>2min</div><div style={s.statLabel}>avg response</div></div>
            <div style={s.statDiv}></div>
            <div style={s.stat}><div style={s.statNum}>500+</div><div style={s.statLabel}>volunteers</div></div>
            <div style={s.statDiv}></div>
            <div style={s.stat}><div style={s.statNum}>98%</div><div style={s.statLabel}>resolved</div></div>
          </div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Welcome back</h2>
          <p style={s.formSub}>Sign in to your account</p>
          {error && <div style={s.errorBox}><span style={s.errorDot}></span>{error}</div>}
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={s.switchText}>Don't have an account? <Link to="/register" style={s.switchLink}>Create one</Link></p>
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
  heroSub: { fontSize: '16px', color: '#666', lineHeight: '1.7', marginBottom: '48px', maxWidth: '380px' },
  statsRow: { display: 'flex', alignItems: 'center', gap: '24px' },
  stat: {},
  statNum: { fontSize: '28px', fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: '12px', color: '#555', marginTop: '2px' },
  statDiv: { width: '1px', height: '40px', background: '#222' },
  right: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: '#0a0a0a' },
  formBox: { width: '100%', maxWidth: '360px' },
  formTitle: { fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' },
  formSub: { fontSize: '14px', color: '#555', marginBottom: '32px' },
  errorBox: { background: '#1a0505', border: '1px solid #4a1515', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' },
  errorDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E24B4A', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: {},
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '14px 16px', background: '#141414', border: '1px solid #222', borderRadius: '10px', fontSize: '14px', color: '#fff', outline: 'none', transition: 'border-color 0.2s' },
  btn: { width: '100%', padding: '14px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', transition: 'opacity 0.2s' },
  switchText: { textAlign: 'center', fontSize: '13px', color: '#444', marginTop: '24px' },
  switchLink: { color: '#E24B4A', textDecoration: 'none', fontWeight: '500' }
};