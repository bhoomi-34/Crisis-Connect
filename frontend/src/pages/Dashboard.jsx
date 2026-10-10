import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => { fetchAll(); setLastUpdated(new Date()); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [reqRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/crisis/all-requests', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/crisis/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(reqRes.data);
      setStats(statsRes.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/crisis/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll();
    } catch (err) {}
  };

  const sevColor = { critical: '#E24B4A', moderate: '#EF9F27', low: '#639922' };
  const statusColor = { open: '#378ADD', assigned: '#EF9F27', resolved: '#1D9E75', cancelled: '#555' };
  const icons = { Fire: '🔥', Medical: '🚑', Accident: '🚗', Flood: '🌊', 'Power Cut': '⚡', Other: '🆘' };

  const filtered = requests
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => !search || r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.location_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{...s.page, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={s.loadingDot}></div>
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>Crisis Connect</span>
          <div style={s.navDivider}></div>
          <span style={s.navPageLabel}>Command Center</span>
        </div>
        <div style={s.navRight}>
          <Link to={user?.role === 'volunteer' ? '/volunteer' : '/requester'} style={s.navLink}>
            ← Back to app
          </Link>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{user?.name?.[0]}</div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
        </div>
      </nav>

      <div style={s.body}>

        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Crisis Dashboard</h1>
            <p style={s.pageSub}>Live overview · Last updated {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div style={s.liveTag}><div style={s.liveDot}></div>LIVE</div>
        </div>

        <div style={s.statsGrid}>
          {[
            { label: 'Total Requests', value: stats.total || 0, color: '#fff', sub: 'all time' },
            { label: 'Open', value: stats.open || 0, color: '#378ADD', sub: 'awaiting response' },
            { label: 'Assigned', value: stats.assigned || 0, color: '#EF9F27', sub: 'volunteer en route' },
            { label: 'Resolved', value: stats.resolved || 0, color: '#1D9E75', sub: 'successfully closed' },
            { label: 'Critical', value: stats.critical || 0, color: '#E24B4A', sub: 'high severity' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{...s.statNum, color: st.color}}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statSub}>{st.sub}</div>
            </div>
          ))}
        </div>

        <div style={s.resolvedBar}>
          <div style={s.resolvedLabel}>
            Resolution rate
            <span style={s.resolvedPct}>
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </span>
          </div>
          <div style={s.progressTrack}>
            <div style={{...s.progressFill, width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%`}}></div>
          </div>
        </div>

        <div style={s.tableSection}>
          <div style={s.tableHeader}>
            <div style={s.tableTitle}>All Requests</div>
            <div style={s.tableControls}>
              <input style={s.searchInput} placeholder="Search type, name, location..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <div style={s.filterRow}>
                {['all', 'open', 'assigned', 'resolved', 'cancelled'].map(f => (
                  <button key={f} style={{...s.filterBtn, ...(filter === f ? s.filterActive : {})}}
                    onClick={() => setFilter(f)}>
                    {f === 'all' ? `All (${requests.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter(r => r.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={s.emptyTable}>No requests match your filter.</div>
          ) : (
            <div style={s.table}>
              <div style={s.tableHead}>
                <div style={{...s.th, flex: 2}}>Request</div>
                <div style={{...s.th, flex: 1}}>Severity</div>
                <div style={{...s.th, flex: 1.5}}>Location</div>
                <div style={{...s.th, flex: 1}}>Requester</div>
                <div style={{...s.th, flex: 1}}>Volunteers</div>
                <div style={{...s.th, flex: 1}}>Time</div>
                <div style={{...s.th, flex: 1}}>Status</div>
                <div style={{...s.th, flex: 1.2}}>Action</div>
              </div>
              {filtered.map((r, i) => (
                <div key={r.id} style={{...s.tableRow, ...(i % 2 === 0 ? s.tableRowAlt : {})}}>
                  <div style={{...s.td, flex: 2}}>
                    <div style={s.reqType}>
                      <span>{icons[r.type] || '🆘'}</span>
                      <div>
                        <div style={s.reqTypeName}>{r.type}</div>
                        {r.description && <div style={s.reqDesc}>{r.description.slice(0, 50)}{r.description.length > 50 ? '...' : ''}</div>}
                      </div>
                    </div>
                  </div>
                  <div style={{...s.td, flex: 1}}>
                    <span style={{...s.badge, background: `${sevColor[r.severity]}22`, color: sevColor[r.severity], borderColor: `${sevColor[r.severity]}44`}}>
                      {r.severity}
                    </span>
                  </div>
                  <div style={{...s.td, flex: 1.5}}>
                    <div style={s.locText}>{r.location_name || '—'}</div>
                    {r.landmark && <div style={s.locSub}>{r.landmark}</div>}
                  </div>
                  <div style={{...s.td, flex: 1}}>
                    <div style={s.nameText}>{r.requester_name}</div>
                    {r.requester_phone && <div style={s.phoneSub}>{r.requester_phone}</div>}
                  </div>
                  <div style={{...s.td, flex: 1}}>
                    <div style={s.volCount}>
                      <span style={{color: r.volunteer_count > 0 ? '#1D9E75' : '#555'}}>{r.volunteer_count}</span>
                      <span style={s.volLabel}> responding</span>
                    </div>
                  </div>
                  <div style={{...s.td, flex: 1}}>
                    <div style={s.timeText}>{new Date(r.created_at).toLocaleDateString()}</div>
                    <div style={s.timeSub}>{new Date(r.created_at).toLocaleTimeString()}</div>
                  </div>
                  <div style={{...s.td, flex: 1}}>
                    <span style={{...s.statusBadge, background: `${statusColor[r.status]}22`, color: statusColor[r.status], borderColor: `${statusColor[r.status]}44`}}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{...s.td, flex: 1.2}}>
                    <select style={s.actionSelect}
                      value={r.status}
                      onChange={e => updateStatus(r.id, e.target.value)}>
                      <option value="open">Open</option>
                      <option value="assigned">Assigned</option>
                      <option value="resolved">Resolved</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  loadingDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', boxShadow: '0 0 8px #E24B4A' },
  logoText: { fontSize: '15px', fontWeight: '700', color: '#fff' },
  navDivider: { width: '1px', height: '16px', background: '#222' },
  navPageLabel: { fontSize: '13px', color: '#555', fontWeight: '500' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navLink: { fontSize: '13px', color: '#555', textDecoration: 'none', padding: '6px 12px', border: '1px solid #1f1f1f', borderRadius: '8px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#E24B4A22', border: '1px solid #E24B4A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#E24B4A' },
  userName: { fontSize: '13px', color: '#888' },
  logoutBtn: { padding: '7px 16px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', color: '#555', fontSize: '12px', cursor: 'pointer' },
  body: { padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  pageTitle: { fontSize: '30px', fontWeight: '700', color: '#fff', marginBottom: '6px' },
  pageSub: { fontSize: '13px', color: '#444' },
  liveTag: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a0505', border: '1px solid #4a1010', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', color: '#E24B4A', letterSpacing: '0.1em' },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E24B4A', animation: 'pulse 1.4s infinite' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' },
  statCard: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' },
  statNum: { fontSize: '32px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '2px' },
  statSub: { fontSize: '11px', color: '#333' },
  resolvedBar: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
  resolvedLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#555', marginBottom: '10px' },
  resolvedPct: { fontSize: '18px', fontWeight: '700', color: '#1D9E75' },
  progressTrack: { height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1D9E75, #5DCAA5)', borderRadius: '3px', transition: 'width 0.5s ease' },
  tableSection: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '14px', overflow: 'hidden' },
  tableHeader: { padding: '20px 24px', borderBottom: '1px solid #1a1a1a' },
  tableTitle: { fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '14px' },
  tableControls: { display: 'flex', flexDirection: 'column', gap: '10px' },
  searchInput: { width: '100%', padding: '10px 14px', background: '#141414', border: '1px solid #1f1f1f', borderRadius: '8px', fontSize: '13px', color: '#fff', outline: 'none' },
  filterRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', border: '1px solid #1f1f1f', borderRadius: '6px', background: 'transparent', color: '#555', fontSize: '12px', cursor: 'pointer', fontWeight: '500' },
  filterActive: { background: '#1f1f1f', color: '#fff', borderColor: '#333' },
  emptyTable: { padding: '60px', textAlign: 'center', color: '#333', fontSize: '14px' },
  table: { overflowX: 'auto' },
  tableHead: { display: 'flex', padding: '12px 24px', borderBottom: '1px solid #1a1a1a' },
  th: { fontSize: '11px', fontWeight: '600', color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em' },
  tableRow: { display: 'flex', padding: '14px 24px', borderBottom: '1px solid #141414', alignItems: 'center' },
  tableRowAlt: { background: '#0d0d0d' },
  td: { fontSize: '13px', color: '#888', paddingRight: '12px' },
  reqType: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  reqTypeName: { fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '2px' },
  reqDesc: { fontSize: '11px', color: '#444' },
  badge: { fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.06em' },
  statusBadge: { fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.06em' },
  locText: { fontSize: '13px', color: '#888' },
  locSub: { fontSize: '11px', color: '#444', marginTop: '2px' },
  nameText: { fontSize: '13px', color: '#888' },
  phoneSub: { fontSize: '11px', color: '#444', marginTop: '2px' },
  volCount: { fontSize: '14px', fontWeight: '600' },
  volLabel: { fontSize: '11px', color: '#444', fontWeight: '400' },
  timeText: { fontSize: '12px', color: '#666' },
  timeSub: { fontSize: '11px', color: '#333', marginTop: '2px' },
  actionSelect: { background: '#141414', border: '1px solid #1f1f1f', borderRadius: '6px', color: '#888', fontSize: '12px', padding: '6px 10px', cursor: 'pointer', outline: 'none', width: '100%' }
};