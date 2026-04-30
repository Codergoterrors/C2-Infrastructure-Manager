import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Server, Activity, AlertTriangle, Terminal, Settings, Globe, Database, UserX, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Dummy Data ---
const performanceData = [
  { time: '00:00', load: 12, traffic: 150 },
  { time: '04:00', load: 15, traffic: 180 },
  { time: '08:00', load: 45, traffic: 450 },
  { time: '12:00', load: 60, traffic: 620 },
  { time: '16:00', load: 55, traffic: 580 },
  { time: '20:00', load: 30, traffic: 320 },
  { time: '24:00', load: 18, traffic: 210 },
];

const redirectors = [
  { id: 1, name: 'aws-useast-01', ip: '3.14.159.26', provider: 'AWS', role: 'HTTPS Redirector', status: 'online', opsec: 92, lastPing: '2s ago' },
  { id: 2, name: 'do-lon-04', ip: '142.250.187.46', provider: 'DigitalOcean', role: 'DNS Redirector', status: 'online', opsec: 85, lastPing: '5s ago' },
  { id: 3, name: 'linode-fr-02', ip: '172.67.199.200', provider: 'Linode', role: 'SMTP Relay', status: 'warning', opsec: 64, lastPing: '1m ago' },
  { id: 4, name: 'azure-we-01', ip: '52.169.14.10', provider: 'Azure', role: 'HTTPS Redirector', status: 'offline', opsec: 30, lastPing: '1h ago' },
];

const domains = [
  { id: 1, name: 'windows-update.com.co', cdn: 'Cloudflare', status: 'Active', ttl: '300s', expiration: '342 days' },
  { id: 2, name: 'azure-telemetry.net', cdn: 'Fastly', status: 'Burned', ttl: '-', expiration: '12 days' },
  { id: 3, name: 'akamai-cdn-edge.org', cdn: 'Akamai', status: 'Active', ttl: '600s', expiration: '210 days' },
];

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Shield color="#0a0e17" size={20} />
        </div>
        <div>
          <h1>C2 INFRA MANAGER</h1>
          <span>v2.4.1 - STRIKE</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Operations</div>
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <Activity className="nav-icon" /> Dashboard
        </Link>
        <Link to="/infrastructure" className={`nav-item ${path === '/infrastructure' ? 'active' : ''}`}>
          <Server className="nav-icon" /> Infrastructure
        </Link>
        <Link to="/domains" className={`nav-item ${path === '/domains' ? 'active' : ''}`}>
          <Globe className="nav-icon" /> Domain Fronting
        </Link>
        
        <div className="nav-section-title" style={{ marginTop: '16px' }}>Deployment</div>
        <Link to="/provision" className={`nav-item ${path === '/provision' ? 'active' : ''}`}>
          <Cpu className="nav-icon" /> Provision Node
        </Link>
        
        <div className="nav-section-title" style={{ marginTop: '16px' }}>Security</div>
        <Link to="/alerts" className={`nav-item ${path === '/alerts' ? 'active' : ''}`}>
          <AlertTriangle className="nav-icon" /> Alerts & Health <span className="nav-badge">2</span>
        </Link>
        <Link to="/teardown" className={`nav-item ${path === '/teardown' ? 'active' : ''}`}>
          <UserX className="nav-icon" style={{ color: 'var(--accent-red)' }} /> Emergency Teardown
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="operator-info">
          <div className="operator-avatar">OP</div>
          <div className="operator-details">
            <div className="name">Operator 01</div>
            <div className="role">Red Team Lead</div>
          </div>
          <Settings size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </aside>
  );
};

const Dashboard = () => {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Command Center</h2>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Terminal size={16} /> Sync Config
          </button>
          <button className="btn btn-primary">
            <Server size={16} /> New Redirector
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card cyan">
          <div className="stat-label">Active Nodes</div>
          <div className="stat-value">14</div>
          <div className="stat-change positive">↑ 2 since yesterday</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Active Listeners</div>
          <div className="stat-value">8</div>
          <div className="stat-change positive">All operational</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Avg OPSEC Score</div>
          <div className="stat-value">91%</div>
          <div className="stat-change positive">↑ 4% this week</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Burned Domains</div>
          <div className="stat-value">3</div>
          <div className="stat-change negative">Requires attention</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3><Activity size={18} /> Global Traffic Load</h3>
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="traffic" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--bg-primary)' }} activeDot={{ r: 6, fill: 'var(--accent-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Server size={18} /> Redirector Fleet Status</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>IP / Role</th>
                  <th>OPSEC</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {redirectors.map(red => (
                  <tr key={red.id}>
                    <td style={{ fontWeight: 600 }}>{red.name}</td>
                    <td>
                      <div>{red.ip}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{red.role}</div>
                    </td>
                    <td>
                      <div className={`opsec-score ${red.opsec > 80 ? 'opsec-high' : red.opsec > 50 ? 'opsec-medium' : 'opsec-low'}`}>
                        {red.opsec}
                        <div className="opsec-bar">
                          <div className="opsec-bar-fill" style={{ width: `${red.opsec}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${red.status}`}>
                        <span className="badge-dot"></span> {red.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3><Terminal size={18} /> System Activity Log</h3>
          </div>
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot red"></div>
              <div className="terminal-dot yellow"></div>
              <div className="terminal-dot green"></div>
              <div className="terminal-title">operator@c2-master:~</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="timestamp">[14:22:01]</span>
                <span className="level-info">[INFO]</span>
                <span className="message">Automated domain rotation initiated for azure-telemetry.net</span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[14:22:05]</span>
                <span className="level-success">[OK]</span>
                <span className="message">Cloudflare DNS API updated successfully</span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[14:25:33]</span>
                <span className="level-warn">[WARN]</span>
                <span className="message">High latency detected on redirector linode-fr-02 (250ms)</span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[14:30:12]</span>
                <span className="level-error">[ERROR]</span>
                <span className="message">Heartbeat lost from azure-we-01. Marking offline.</span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[14:30:15]</span>
                <span className="level-info">[INFO]</span>
                <span className="message">Slack webhook dispatched for offline node.</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

const Provisioning = () => {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Provision Node (Terraform / Ansible)</h2>
      </div>
      <div className="grid-2">
          <div className="card">
              <div className="card-header">
                  <h3>Configuration</h3>
              </div>
              <div className="form-group">
                  <label className="form-label">Cloud Provider</label>
                  <select className="form-select">
                      <option>DigitalOcean</option>
                      <option>AWS</option>
                      <option>Linode</option>
                      <option>Azure</option>
                  </select>
              </div>
               <div className="form-group">
                  <label className="form-label">Region</label>
                  <select className="form-select">
                      <option>NYC1 (New York)</option>
                      <option>LON1 (London)</option>
                      <option>FRA1 (Frankfurt)</option>
                      <option>SGP1 (Singapore)</option>
                  </select>
              </div>
               <div className="form-group">
                  <label className="form-label">Node Role</label>
                  <select className="form-select">
                      <option>HTTPS Redirector (Nginx + Socat)</option>
                      <option>DNS Redirector</option>
                      <option>SMTP Relay / Phishing</option>
                      <option>Payload Hosting</option>
                  </select>
              </div>
              <div className="form-group">
                  <label className="form-label">Attach Domain</label>
                  <select className="form-select">
                      {domains.filter(d => d.status === 'Active').map(d => (
                          <option key={d.id}>{d.name}</option>
                      ))}
                      <option>-- Provision without domain --</option>
                  </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                  <Cpu size={16} /> Execute Terraform Build
              </button>
          </div>
          <div className="card">
             <div className="card-header">
                  <h3>Provisioning Log</h3>
              </div>
               <div className="terminal" style={{ height: 'calc(100% - 50px)' }}>
                <div className="terminal-header">
                  <div className="terminal-dot red"></div>
                  <div className="terminal-dot yellow"></div>
                  <div className="terminal-dot green"></div>
                  <div className="terminal-title">terraform apply</div>
                </div>
                <div className="terminal-body" style={{ color: 'var(--text-muted)' }}>
                  Awaiting execution...
                </div>
              </div>
          </div>
      </div>
    </div>
  )
}

const EmergencyTeardown = () => {
    return (
        <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '50px' }}>
            <AlertTriangle size={80} color="var(--accent-red)" style={{ margin: '0 auto 20px', display: 'block', animation: 'pulse-dot 2s infinite' }} />
            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-red)', marginBottom: '20px' }}>EMERGENCY TEARDOWN</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>
                Warning: This action will permanently destroy all active cloud infrastructure (droplets, EC2 instances), 
                scrub DNS records, and delete local state files to prevent compromise attribution. 
                This action is <strong>irreversible</strong>.
            </p>
            
            <div className="card" style={{ borderColor: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'left' }}>
                <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--accent-red)' }}>Type "BURN EVERYTHING" to confirm</label>
                    <input type="text" className="form-input" placeholder="BURN EVERYTHING" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }} />
                </div>
                <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1.2rem', marginTop: '10px' }}>
                    <Database size={20} /> INITIATE TEARDOWN PROTOCOL
                </button>
            </div>
        </div>
    )
}

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/provision" element={<Provisioning />} />
          <Route path="/teardown" element={<EmergencyTeardown />} />
          <Route path="*" element={<div className="animate-in"><h2>Module loaded dynamically or under construction.</h2></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
