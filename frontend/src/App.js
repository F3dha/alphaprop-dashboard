import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [traders, setTraders] = useState([]);
  const [skew, setSkew] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch data from your Render Backend
  const fetchData = async () => {
    try {
      // Replace with your actual Render URL later
      const response = await axios.get('http://localhost:5000/api/dashboard'); 
      setTraders(response.data.traders || []);
      calculateSkew(response.data.positions || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // 2. Calculate Asset Skew (Market Exposure)
  const calculateSkew = (positions) => {
    const totals = {};
    positions.forEach(p => {
      totals[p.symbol] = (totals[p.symbol] || 0) + parseFloat(p.volume);
    });
    setSkew(totals);
  };

  // 3. Refresh every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{color: 'white', padding: '20px'}}>Loading Alpha Prop Systems...</div>;

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8' }}>Alpha Prop Admin | God-View</h1>
        <p style={{ color: '#94a3b8' }}>Real-time Risk Monitor & Asset Skew</p>
      </header>

      {/* ASSET SKEW SECTION */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Total Market Exposure (Skew)</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {Object.entries(skew).length > 0 ? Object.entries(skew).map(([symbol, vol]) => (
            <div key={symbol} style={{ background: '#1e293b', padding: '15px 25px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>{symbol}</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{vol.toFixed(2)} Lots</span>
            </div>
          )) : <p style={{color: '#64748b'}}>No open positions detected.</p>}
        </div>
      </section>

      {/* TRADER PERFORMANCE TABLE */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Active Traders</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#334155', color: '#cbd5e1' }}>
              <th style={{ padding: '15px' }}>Trader Name</th>
              <th style={{ padding: '15px' }}>Equity</th>
              <th style={{ padding: '15px' }}>Drawdown</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {traders.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '15px', fontWeight: '500' }}>{t.name}</td>
                <td style={{ padding: '15px' }}>${t.balance.toLocaleString()}</td>
                <td style={{ padding: '15px', color: t.dd > 8 ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>
                  {t.dd.toFixed(2)}%
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    background: t.dd > 10 ? '#4c0519' : '#064e3b',
                    color: t.dd > 10 ? '#f43f5e' : '#10b981'
                  }}>
                    {t.dd > 10 ? '🚫 BREACHED' : '✅ ACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default App;