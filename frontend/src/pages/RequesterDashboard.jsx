import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import MapPicker from '../components/MapPicker';

export default function RequesterDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'Fire', severity: 'critical', description: '',
    location_name: '', landmark: '', latitude: 12.9716, longitude: 77.5946
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [tab, setTab] = useState('new');

  const crisisTypes = [
    { id: 'Fire', icon: '🔥', label: 'Fire' },
    { id: 'Medical', icon: '🚑', label: 'Medical' },
    { id: 'Accident', icon: '🚗', label: 'Accident' },
    { id: 'Flood', icon: '🌊', label: 'Flood' },
    { id: 'Power Cut', icon: '⚡', label: 'Power Cut' },
    { id: 'Other', icon: '🆘', label: 'Other' },
  ];

  useEffect(() => { fetchMyRequests(); }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/crisis/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(res.data);
    } catch (err) {}
  };

  const handleLocationSelect = ({ latitude, longitude, location_name }) => {
    setForm(prev => ({ ...prev, latitude, longitude, location_name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/crisis/create', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('🚨 Emergency alert sent! Volunteers are being notified.');
      setForm(prev => ({ ...prev, description: '', landmark: '' }));
      fetchMyRequests();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send alert');
    } finally { setLoading(false); }
  };

  const sevColor = { critical: '#E24B4A', moderate: '#EF9F27', low: '#639922' };
  const statusColor = { open: '#378ADD', assigned: '#EF9F27', resolved: '#1D9E75', cancelled: '#555' };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>Crisis Connect</span>
        </div>
        <div style={s.navCenter}>
          <button style={{...s.navTab, ...(tab === 'new' ? s.navTabActive : {})}} onClick={() => setTab('new')}>New Request</button>
          <button style={{...s.navTab, ...(tab === 'history' ? s.navTabActive : {})}} onClick={() => setTab('history')}>My Requests</button>
        </div>
        <div style={s.navRight}>
          <Link to="/dashboard" style={s.dashLink}>Dashboard</Link>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{user?.name?.[0]}</div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
        </div>
      </nav>

      {tab === 'new' && (
        <div style={s.body}>
          <div style={s.heroBar}>
            <div>
              <h1 style={s.heroTitle}>Report a Crisis</h1>
              <p style={s.heroSub}>Your alert will be sent to all available volunteers nearby instantly.</p>
            </div>
            <div style={s.liveTag}><div style={s.liveDot}></div>LIVE</div>
          </div>
          {success && <div style={s.successBanner}>{success}</div>}
          {error && <div style={s.errorBanner}>{error}</div>}
          <form onSubmit={handleSubmit} style={s.formGrid}>

            <div style={s.formCard}>
              <div style={s.cardLabel}>Crisis type</div>
              <div style={s.crisisGrid}>
                {crisisTypes.map(ct => (
                  <div key={ct.id}
                    style={{...s.crisisBtn, ...(form.type === ct.id ? s.crisisBtnActive : {})}}
                    onClick={() => setForm({...form, type: ct.id})}>
                    <span style={s.crisisIcon}>{ct.icon}</span>
                    <span style={s.crisisLabel}>{ct.label}</span>
                    {form.type === ct.id && <div style={s.crisisCheck}>✓</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={s.formCard}>
              <div style={s.cardLabel}>Severity level</div>
              <div style={s.sevGrid}>
                {[
                  {id:'critical', label:'Critical', desc:'Life threatening'},
                  {id:'moderate', label:'Moderate', desc:'Needs attention'},
                  {id:'low', label:'Low', desc:'Minor issue'}
                ].map(sv => (
                  <div key={sv.id}
                    style={{...s.sevCard, ...(form.severity === sv.id ? {borderColor: sevColor[sv.id], background: `${sevColor[sv.id]}11`} : {})}}
                    onClick={() => setForm({...form, severity: sv.id})}>
                    <div style={{...s.sevIndicator, background: sevColor[sv.id]}}></div>
                    <div>
                      <div style={{...s.sevName, ...(form.severity === sv.id ? {color: sevColor[sv.id]} : {})}}>{sv.label}</div>
                      <div style={s.sevDesc}>{sv.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.formCard}>
              <div style={s.cardLabel}>Situation description</div>
              <textarea style={s.textarea} rows={3}
                placeholder="Describe what's happening, number of people affected..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div style={s.formCard}>
              <div style={s.cardLabel}>Pin your exact location</div>
              <MapPicker onLocationSelect={handleLocationSelect} />
              <div style={{marginTop: '10px'}}>
                <input style={s.input} type="text" placeholder="Nearby landmark (e.g. Near Forum Mall)"
                  value={form.landmark}
                  onChange={e => setForm({...form, landmark: e.target.value})} />
              </div>
            </div>

            <button style={{...s.submitBtn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Sending alert...' : '🚨 Send Emergency Alert'}
            </button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div style={s.body}>
          <h2 style={s.sectionTitle}>My Crisis Requests</h2>
          {myRequests.length === 0 ? (
            <div style={s.emptyState}>No requests yet. Stay safe!</div>
          ) : (
            myRequests.map(r => (
              <div key={r.id} style={s.histCard}>
                <div style={s.histTop}>
                  <span style={s.histType}>{r.type}</span>
                  <span style={{...s.histStatus, color: statusColor[r.status], background: `${statusColor[r.status]}22`}}>
                    {r.status}
                  </span>
                </div>
                {r.description && <p style={s.histDesc}>{r.description}</p>}
                <div style={s.histMeta}>
                  {r.location_name && <span>📍 {r.location_name}</span>}
                  <span>🕐 {new Date(r.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', boxShadow: '0 0 8px #E24B4A' },
  logoText: { fontSize: '15px', fontWeight: '700', color: '#fff' },
  navCenter: { display: 'flex', gap: '4px', background: '#141414', borderRadius: '8px', padding: '4px' },
  navTab: { padding: '7px 20px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#555', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  navTabActive: { background: '#1f1f1f', color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  dashLink: { fontSize: '13px', color: '#555', textDecoration: 'none', padding: '7px 16px', border: '1px solid #222', borderRadius: '8px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#E24B4A22', border: '1px solid #E24B4A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#E24B4A' },
  userName: { fontSize: '13px', color: '#888' },
  logoutBtn: { padding: '7px 16px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', color: '#555', fontSize: '12px', cursor: 'pointer' },
  body: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px' },
  heroBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heroTitle: { fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '6px' },
  heroSub: { fontSize: '14px', color: '#555' },
  liveTag: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a0505', border: '1px solid #4a1010', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', color: '#E24B4A', letterSpacing: '0.1em' },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E24B4A' },
  successBanner: { background: '#0a1a0f', border: '1px solid #1a4a1a', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '14px', color: '#4ade80' },
  errorBanner: { background: '#1a0505', border: '1px solid #4a1515', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '14px', color: '#ff6b6b' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formCard: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' },
  cardLabel: { fontSize: '11px', fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' },
  crisisGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  crisisBtn: { padding: '14px 10px', border: '1px solid #1f1f1f', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: '#141414', position: 'relative' },
  crisisBtnActive: { border: '1px solid #E24B4A', background: '#1a0505' },
  crisisIcon: { display: 'block', fontSize: '22px', marginBottom: '6px' },
  crisisLabel: { fontSize: '12px', fontWeight: '500', color: '#888' },
  crisisCheck: { position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', background: '#E24B4A', fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sevGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sevCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: '1px solid #1f1f1f', borderRadius: '10px', cursor: 'pointer', background: '#141414' },
  sevIndicator: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sevName: { fontSize: '14px', fontWeight: '500', color: '#ccc' },
  sevDesc: { fontSize: '12px', color: '#444', marginTop: '2px' },
  textarea: { width: '100%', padding: '14px 16px', background: '#141414', border: '1px solid #1f1f1f', borderRadius: '10px', fontSize: '14px', color: '#fff', resize: 'vertical', outline: 'none', lineHeight: '1.6' },
  input: { width: '100%', padding: '13px 16px', background: '#141414', border: '1px solid #1f1f1f', borderRadius: '10px', fontSize: '14px', color: '#fff', outline: 'none' },
  submitBtn: { width: '100%', padding: '16px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '20px' },
  histCard: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  histTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  histType: { fontSize: '15px', fontWeight: '600', color: '#fff' },
  histStatus: { fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  histDesc: { fontSize: '13px', color: '#555', marginBottom: '10px' },
  histMeta: { display: 'flex', gap: '16px', fontSize: '12px', color: '#444' },
  emptyState: { textAlign: 'center', padding: '60px', color: '#333', fontSize: '14px' }
};