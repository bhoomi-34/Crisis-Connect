import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/toast';
import useSocket from '../hooks/usesocket';

export default function VolunteerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [crises, setCrises] = useState([]);
  const [responding, setResponding] = useState({});
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((crisis) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...crisis, id }]);
    fetchCrises();
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useSocket(token, 'volunteer', addToast);

  useEffect(() => {
    fetchCrises();
    const interval = setInterval(() => {
      fetchCrises();
      setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCrises = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/crisis/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCrises(res.data);
      setLastUpdated(new Date());
    } catch (err) {}
  };

  const handleRespond = async (crisisId) => {
    try {
      await axios.post('http://localhost:5000/api/volunteer/respond',
        { crisis_id: crisisId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponding(prev => ({ ...prev, [crisisId]: true }));
      fetchCrises();
    } catch (err) {}
  };

  const icons = { Fire: '🔥', Medical: '🚑', Accident: '🚗', Flood: '🌊', 'Power Cut': '⚡', Other: '🆘' };
  const sevColor = { critical: '#E24B4A', moderate: '#EF9F27', low: '#639922' };
  const filtered = filter === 'all' ? crises : crises.filter(c => c.severity === filter);

  return (
    <div style={s.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>Crisis Connect</span>
        </div>
        <div style={s.navRight}>
          <div style={s.liveTag}><div style={s.liveDot}></div>LIVE FEED</div>
          <Link to="/dashboard" style={s.dashLink}>Dashboard</Link>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{user?.name?.[0]}</div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>Crisis Feed</h1>
            <p style={s.pageSub}>Updated {lastUpdated.toLocaleTimeString()} · {crises.length} open alert{crises.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={s.filters}>
            {['all', 'critical', 'moderate', 'low'].map(f => (
              <button key={f}
                style={{...s.filterBtn, ...(filter === f ? s.filterActive : {})}}
                onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={s.statsRow}>
          {[
            { label: 'Critical', count: crises.filter(c => c.severity === 'critical').length, color: '#E24B4A' },
            { label: 'Moderate', count: crises.filter(c => c.severity === 'moderate').length, color: '#EF9F27' },
            { label: 'Low', count: crises.filter(c => c.severity === 'low').length, color: '#639922' }
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{...s.statNum, color: st.color}}>{st.count}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✓</div>
            <div style={s.emptyTitle}>All clear</div>
            <div style={s.emptySub}>No open crisis alerts right now</div>
          </div>
        ) : (
          <div style={s.feedGrid}>
            {filtered.map(crisis => (
              <div key={crisis.id} style={{...s.card, ...(crisis.severity === 'critical' ? s.cardCritical : {})}}>
                <div style={s.cardHeader}>
                  <div style={s.cardTitleRow}>
                    <span style={s.cardIcon}>{icons[crisis.type] || '🆘'}</span>
                    <span style={s.cardTitle}>{crisis.type} Emergency</span>
                  </div>
                  <div style={{...s.sevBadge, background: `${sevColor[crisis.severity]}22`, color: sevColor[crisis.severity], borderColor: `${sevColor[crisis.severity]}44`}}>
                    {crisis.severity}
                  </div>
                </div>
                {crisis.description && <p style={s.cardDesc}>{crisis.description}</p>}
                <div style={s.cardMeta}>
                  {crisis.location_name && <div style={s.metaChip}>📍 {crisis.location_name}</div>}
                  {crisis.landmark && <div style={s.metaChip}>🏢 {crisis.landmark}</div>}
                  <div style={s.metaChip}>👤 {crisis.requester_name}</div>
                  <div style={s.metaChip}>🕐 {new Date(crisis.created_at).toLocaleTimeString()}</div>
                </div>
                <button
                  style={{...s.respondBtn, ...(responding[crisis.id] ? s.respondedBtn : crisis.severity === 'critical' ? s.respondBtnCritical : {})}}
                  onClick={() => handleRespond(crisis.id)}
                  disabled={responding[crisis.id]}>
                  {responding[crisis.id] ? '✓ Responding — En route' : 'Respond to this crisis →'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', boxShadow: '0 0 8px #E24B4A' },
  logoText: { fontSize: '15px', fontWeight: '700', color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  liveTag: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a0505', border: '1px solid #4a1010', borderRadius: '20px', padding: '5px 12px', fontSize: '10px', fontWeight: '700', color: '#E24B4A', letterSpacing: '0.1em' },
  liveDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#E24B4A' },
  dashLink: { fontSize: '13px', color: '#555', textDecoration: 'none', padding: '7px 16px', border: '1px solid #222', borderRadius: '8px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#1D9E7522', border: '1px solid #1D9E7544', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#1D9E75' },
  userName: { fontSize: '13px', color: '#888' },
  logoutBtn: { padding: '7px 16px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', color: '#555', fontSize: '12px', cursor: 'pointer' },
  body: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  pageSub: { fontSize: '13px', color: '#444' },
  filters: { display: 'flex', gap: '6px' },
  filterBtn: { padding: '8px 16px', border: '1px solid #1f1f1f', borderRadius: '8px', background: '#0f0f0f', color: '#555', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  filterActive: { background: '#1f1f1f', color: '#fff', borderColor: '#333' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '16px 20px' },
  statNum: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#444' },
  feedGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '20px' },
  cardCritical: { border: '1px solid #4a1515', background: '#0f0808' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardTitleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardIcon: { fontSize: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#fff' },
  sevBadge: { fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardDesc: { fontSize: '14px', color: '#666', marginBottom: '14px', lineHeight: '1.6' },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
  metaChip: { fontSize: '11px', color: '#555', background: '#141414', border: '1px solid #1f1f1f', padding: '4px 10px', borderRadius: '20px' },
  respondBtn: { width: '100%', padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  respondBtnCritical: { background: '#E24B4A' },
  respondedBtn: { background: '#1a3a1a', color: '#1D9E75', border: '1px solid #1D9E7544' },
  empty: { textAlign: 'center', padding: '80px 40px' },
  emptyIcon: { fontSize: '40px', color: '#1D9E75', marginBottom: '12px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '6px' },
  emptySub: { fontSize: '14px', color: '#444' }
};