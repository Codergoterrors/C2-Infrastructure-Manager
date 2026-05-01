import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Server, Activity, AlertTriangle, Terminal, Settings, Globe, Database, UserX, Cpu, Wifi, Zap, ChevronRight, Eye, Lock, Radio, Skull, BarChart3, Clock, Hash } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trafficData = [
  { time: '00:00', traffic: 150 }, { time: '04:00', traffic: 180 },
  { time: '08:00', traffic: 450 }, { time: '12:00', traffic: 620 },
  { time: '16:00', traffic: 580 }, { time: '20:00', traffic: 320 },
  { time: '24:00', traffic: 210 },
];

const domains = [
  { id: 1, name: 'windows-update.com.co', cdn: 'Cloudflare', status: 'Active', ttl: '300s', expiry: '342d' },
  { id: 2, name: 'azure-telemetry.net', cdn: 'Fastly', status: 'Burned', ttl: '-', expiry: '12d' },
  { id: 3, name: 'akamai-cdn-edge.org', cdn: 'Akamai', status: 'Active', ttl: '600s', expiry: '210d' },
];

const ClanBrand = ({ suffix, size = 'sm' }) => (
  <span className="clan-nxt-brand" style={{ fontSize: size === 'lg' ? '1rem' : '0.62rem' }}>
    #𝐂𝐋𝐀𝐍 <span className="nxt">𝐍𝐗𝐓</span>{suffix && <span style={{ color: 'var(--text-muted)' }}> {suffix}</span>}
  </span>
);

// ─── SIDEBAR ───
const Sidebar = () => {
  const { pathname: p } = useLocation();
  const nav = [
    { section: 'Operations', items: [
      { to: '/', icon: Activity, label: 'Command Center' },
      { to: '/infrastructure', icon: Server, label: 'Infrastructure' },
      { to: '/domains', icon: Globe, label: 'Domain Fronting' },
    ]},
    { section: 'Deploy', items: [
      { to: '/provision', icon: Cpu, label: 'Provision Node' },
    ]},
    { section: 'Security', items: [
      { to: '/alerts', icon: AlertTriangle, label: 'Alerts', badge: '2' },
      { to: '/teardown', icon: Skull, label: 'Emergency Teardown', danger: true },
    ]},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Shield color="#000" size={18} /></div>
        <div>
          <h1>CLAN <span style={{ color: 'var(--accent-red)', textShadow: '0 0 20px rgba(255,0,51,0.5)' }}>NXT</span></h1>
          <span>C2 Framework v3.0</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(g => (
          <React.Fragment key={g.section}>
            <div className="nav-section-title">{g.section}</div>
            {g.items.map(i => (
              <Link key={i.to} to={i.to} className={`nav-item ${p === i.to ? 'active' : ''}`}>
                <i.icon className="nav-icon" style={i.danger ? { color: 'var(--accent-red)' } : {}} />
                {i.label}
                {i.badge && <span className="nav-badge">{i.badge}</span>}
              </Link>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="operator-info">
          <div className="operator-avatar">OP</div>
          <div className="operator-details">
            <div className="name">operator_01</div>
            <div className="role">root@nxt-c2</div>
          </div>
          <Settings size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </aside>
  );
};

// ─── DASHBOARD ───
const Dashboard = () => {
  const [nodes, setNodes] = useState([]);
  const [stats, setStats] = useState({ active_listeners: 0, avg_opsec: 0 });
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), level: 'info', msg: 'System initialized. Awaiting backend sync...' }
  ]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const r = await fetch('http://localhost:8000/api/status');
        const d = await r.json();
        if (d.nodes) {
          setNodes(d.nodes);
          setStats({ active_listeners: d.active_listeners || 0, avg_opsec: Math.round(d.avg_opsec || 0) });
        }
      } catch (e) { console.error("Backend:", e); }
    };
    fetchStatus();
    const i = setInterval(fetchStatus, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), level: 'success', msg: `Backend sync complete. ${nodes.length} nodes loaded.` }, ...prev].slice(0, 20));
    }, 1500);
    return () => clearTimeout(t);
  }, [nodes.length]);

  const online = nodes.filter(n => n.status === 'online').length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Command Center</h2>
        <div className="header-actions">
          <button className="btn btn-secondary"><Terminal size={14} /> Sync</button>
          <Link to="/provision"><button className="btn btn-primary"><Zap size={14} /> Deploy Node</button></Link>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Active Nodes', value: nodes.length, sub: `${online} online`, cls: 'cyan', positive: true },
          { label: 'Listeners', value: stats.active_listeners, sub: 'Operational', cls: 'purple', positive: true },
          { label: 'OPSEC Score', value: `${stats.avg_opsec}%`, sub: 'Calculated', cls: 'green', positive: true },
          { label: 'Burned Domains', value: domains.filter(d => d.status === 'Burned').length, sub: 'Attention', cls: 'red', positive: false },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={!s.positive ? { color: 'var(--accent-red)', textShadow: '0 0 20px rgba(255,0,51,0.3)' } : {}}>{s.value}</div>
            <div className={`stat-change ${s.positive ? 'positive' : 'negative'}`}>{s.positive ? '●' : '⚠'} {s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3><Activity size={14} /> Network Traffic</h3></div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff41" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00ff41" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.04)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.15)" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={{ backgroundColor: '#060610', borderColor: 'rgba(0,255,65,0.15)', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                <Area type="monotone" dataKey="traffic" stroke="#00ff41" strokeWidth={2} fill="url(#gG)" dot={{ r: 3, fill: '#000', stroke: '#00ff41', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><Server size={14} /> Fleet Status</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Node</th><th>IP / Role</th><th>OPSEC</th><th>Status</th></tr></thead>
              <tbody>
                {nodes.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No nodes deployed. <Link to="/provision" style={{ color: 'var(--accent-matrix)' }}>Deploy →</Link></td></tr>}
                {nodes.map(n => (
                  <tr key={n.id}>
                    <td style={{ color: 'var(--accent-matrix)', fontWeight: 600 }}>{n.name}</td>
                    <td><div style={{ color: 'var(--text-primary)' }}>{n.ip}</div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{n.role}</div></td>
                    <td><div className={`opsec-score ${n.opsec > 80 ? 'opsec-high' : n.opsec > 50 ? 'opsec-medium' : 'opsec-low'}`}>{n.opsec}<div className="opsec-bar"><div className="opsec-bar-fill" style={{ width: `${n.opsec}%` }}></div></div></div></td>
                    <td><span className={`badge badge-${n.status}`}><span className="badge-dot"></span> {n.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header"><h3><Terminal size={14} /> System Log</h3></div>
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dot red"></div><div className="terminal-dot yellow"></div><div className="terminal-dot green"></div>
            <div className="terminal-title"><ClanBrand suffix="~ syslog" /></div>
          </div>
          <div className="terminal-body">
            {logs.map((l, i) => (
              <div key={i} className="terminal-line">
                <span className="timestamp">[{l.time}]</span>
                <span className={`level-${l.level}`}>[{l.level.toUpperCase()}]</span>
                <span className="message">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INFRASTRUCTURE ───
const Infrastructure = () => {
  const [nodes, setNodes] = useState([]);
  useEffect(() => {
    const f = () => fetch('http://localhost:8000/api/status').then(r => r.json()).then(d => d.nodes && setNodes(d.nodes)).catch(() => {});
    f(); const i = setInterval(f, 5000); return () => clearInterval(i);
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header"><h2>Infrastructure Map</h2></div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><h3><Globe size={14} /> Node Topology</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {nodes.map(n => (
            <div key={n.id} className={`node-card ${n.status}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Server size={16} color={n.status === 'online' ? '#00ff41' : '#ff0033'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-matrix)', fontSize: '0.82rem' }}>{n.name}</span>
                <span className={`badge badge-${n.status}`} style={{ marginLeft: 'auto', fontSize: '0.52rem' }}><span className="badge-dot"></span> {n.status.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '2' }}>
                <div>IP: <span style={{ color: 'var(--text-primary)' }}>{n.ip}</span></div>
                <div>Provider: <span style={{ color: 'var(--text-primary)' }}>{n.provider}</span></div>
                <div>Role: <span style={{ color: 'var(--text-primary)' }}>{n.role}</span></div>
                <div>OPSEC: <span style={{ color: n.opsec > 80 ? 'var(--accent-matrix)' : 'var(--accent-red)' }}>{n.opsec}%</span></div>
              </div>
            </div>
          ))}
          {nodes.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>No infrastructure deployed. <Link to="/provision" style={{ color: 'var(--accent-matrix)' }}>Deploy a node →</Link></div>}
        </div>
      </div>
    </div>
  );
};

// ─── DOMAIN FRONTING ───
const DomainFronting = () => (
  <div className="animate-in">
    <div className="page-header"><h2>Domain Fronting</h2></div>
    <div className="card">
      <div className="card-header"><h3><Globe size={14} /> Domain Registry</h3></div>
      <table className="data-table">
        <thead><tr><th>Domain</th><th>CDN</th><th>Status</th><th>TTL</th><th>Expires</th></tr></thead>
        <tbody>
          {domains.map(d => (
            <tr key={d.id}>
              <td style={{ color: d.status === 'Burned' ? 'var(--accent-red)' : 'var(--accent-matrix)', fontWeight: 600 }}>{d.name}</td>
              <td>{d.cdn}</td>
              <td><span className={`badge ${d.status === 'Active' ? 'badge-online' : 'badge-offline'}`}><span className="badge-dot"></span> {d.status}</span></td>
              <td>{d.ttl}</td>
              <td>{d.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── ALERTS ───
const Alerts = () => (
  <div className="animate-in">
    <div className="page-header"><h2>Alerts & Health</h2></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[
        { level: 'warn', icon: <AlertTriangle size={16} color="#ff6600" />, title: 'High latency detected', desc: 'Redirector linode-fr-02 is responding with 250ms+ latency', time: '14:25:33' },
        { level: 'error', icon: <Wifi size={16} color="#ff0033" />, title: 'Heartbeat lost', desc: 'Node azure-we-01 has not responded in over 1 hour', time: '14:30:12' },
      ].map((a, i) => (
        <div key={i} className="card" style={{ borderColor: a.level === 'error' ? 'rgba(255,0,51,0.15)' : 'rgba(255,102,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {a.icon}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: a.level === 'error' ? 'var(--accent-red)' : 'var(--accent-orange)' }}>{a.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{a.desc}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── PROVISIONING ───
const Provisioning = () => {
  const [provider, setProvider] = useState('Docker (Free)');
  const [region, setRegion] = useState('NYC1 (New York)');
  const [role, setRole] = useState('HTTPS Redirector (Nginx + Socat)');
  const [domain, setDomain] = useState('-- Provision without domain --');
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState(['> Awaiting execution...']);

  const handleProvision = async () => {
    setIsDeploying(true);
    setLogs([`> Initiating Terraform build for ${provider} in ${region}...`, '> POST /api/provision']);
    try {
      const r = await fetch('http://localhost:8000/api/provision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, region, role, domain })
      });
      const d = await r.json();
      setLogs(prev => [...prev, `> Response received. Node ID: ${d.node.id}`, '> Terraform apply running in background.', '> Check Dashboard for live status.']);
      setTimeout(() => setIsDeploying(false), 2000);
    } catch (e) {
      setLogs(prev => [...prev, '> ERROR: Connection to backend failed.']);
      setIsDeploying(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h2>Provision Node</h2></div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3><Cpu size={14} /> Configuration</h3></div>
          <div className="form-group"><label className="form-label">Cloud Provider</label>
            <select className="form-select" value={provider} onChange={e => setProvider(e.target.value)}>
              <option>Docker (Free)</option><option>DigitalOcean</option><option>AWS</option><option>Linode</option><option>Azure</option>
            </select></div>
          <div className="form-group"><label className="form-label">Region</label>
            <select className="form-select" value={region} onChange={e => setRegion(e.target.value)}>
              <option>NYC1 (New York)</option><option>LON1 (London)</option><option>FRA1 (Frankfurt)</option><option>SGP1 (Singapore)</option>
            </select></div>
          <div className="form-group"><label className="form-label">Node Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option>HTTPS Redirector (Nginx + Socat)</option><option>DNS Redirector</option><option>SMTP Relay / Phishing</option><option>Payload Hosting</option>
            </select></div>
          <div className="form-group"><label className="form-label">Attach Domain</label>
            <select className="form-select" value={domain} onChange={e => setDomain(e.target.value)}>
              {domains.filter(d => d.status === 'Active').map(d => <option key={d.id}>{d.name}</option>)}
              <option>-- Provision without domain --</option>
            </select></div>
          <button className={`btn ${isDeploying ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '13px' }}
            onClick={handleProvision} disabled={isDeploying}>
            <Zap size={14} /> {isDeploying ? 'DEPLOYING...' : 'EXECUTE TERRAFORM BUILD'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3><Terminal size={14} /> Provisioning Log</h3></div>
          <div className="terminal" style={{ height: 'calc(100% - 50px)' }}>
            <div className="terminal-header">
              <div className="terminal-dot red"></div><div className="terminal-dot yellow"></div><div className="terminal-dot green"></div>
              <div className="terminal-title"><ClanBrand suffix="~ terraform apply" /></div>
            </div>
            <div className="terminal-body" style={{ color: 'var(--text-secondary)' }}>
              {logs.map((l, i) => (
                <div key={i} className="terminal-line">
                  <span className="message" style={{ color: l.includes('ERROR') ? 'var(--accent-red)' : l.includes('Response') ? 'var(--accent-matrix)' : 'inherit' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EMERGENCY TEARDOWN ───
const EmergencyTeardown = () => {
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleTeardown = async () => {
    if (confirmText !== 'BURN EVERYTHING') { setStatus('error'); setMessage('Type exactly: BURN EVERYTHING'); return; }
    setStatus('loading'); setMessage('Destroying all infrastructure...');
    try {
      const r = await fetch('http://localhost:8000/api/teardown', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmation_text: confirmText }) });
      const d = await r.json();
      if (r.ok) { setStatus('success'); setMessage(d.message || 'All infrastructure destroyed.'); setConfirmText(''); }
      else { setStatus('error'); setMessage(d.detail || 'Teardown failed.'); }
    } catch { setStatus('error'); setMessage('Backend connection failed.'); }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
      <Skull size={64} color="var(--accent-red)" style={{ margin: '0 auto 20px', display: 'block', animation: 'pulse-dot 2s infinite', filter: 'drop-shadow(0 0 20px rgba(255,0,51,0.4))' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent-red)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.12em', textShadow: '0 0 30px rgba(255,0,51,0.4)' }}>Emergency Teardown</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '30px', fontFamily: 'var(--font-mono)', lineHeight: '1.9' }}>
        This will permanently destroy all active infrastructure, scrub DNS records, and delete local state files. This action is <strong style={{ color: 'var(--accent-red)' }}>irreversible</strong>.
      </p>
      {status === 'success' && <div style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '4px', padding: '12px', marginBottom: '16px', color: 'var(--accent-matrix)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>✓ {message}</div>}
      {status === 'error' && <div style={{ background: 'rgba(255,0,51,0.04)', border: '1px solid rgba(255,0,51,0.15)', borderRadius: '4px', padding: '12px', marginBottom: '16px', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>✗ {message}</div>}
      <div className="card" style={{ borderColor: 'rgba(255,0,51,0.12)', textAlign: 'left' }}>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--accent-red)' }}>Type "BURN EVERYTHING" to confirm</label>
          <input type="text" className="form-input" placeholder="BURN EVERYTHING" value={confirmText} onChange={e => setConfirmText(e.target.value)}
            style={{ borderColor: 'rgba(255,0,51,0.25)', color: 'var(--accent-red)' }} />
        </div>
        <button className="btn btn-danger" onClick={handleTeardown} disabled={status === 'loading'}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.85rem', marginTop: '6px', opacity: status === 'loading' ? 0.5 : 1 }}>
          <Database size={16} /> {status === 'loading' ? 'DESTROYING...' : 'INITIATE BURN PROTOCOL'}
        </button>
      </div>
    </div>
  );
};

// ─── LAYOUT & APP ───
const Layout = ({ children }) => (
  <div className="app-layout"><Sidebar /><main className="main-content"><div className="page-container">{children}</div></main></div>
);

function App() {
  return (
    <Router><Layout><Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/infrastructure" element={<Infrastructure />} />
      <Route path="/domains" element={<DomainFronting />} />
      <Route path="/provision" element={<Provisioning />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/teardown" element={<EmergencyTeardown />} />
      <Route path="*" element={<div className="animate-in" style={{ textAlign: 'center', paddingTop: '60px' }}><h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>MODULE NOT FOUND</h2></div>} />
    </Routes></Layout></Router>
  );
}

export default App;
