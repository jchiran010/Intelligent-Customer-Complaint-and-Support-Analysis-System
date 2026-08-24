import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: 'bar' | 'donut' | 'line';
  data: any[];
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, type, data }) => {
  return (
    <div className="df-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h4>
        {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>

      <div style={{ flex: 1, minHeight: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
        {type === 'bar' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', height: '180px', gap: '0.75rem' }}>
            {data.map((item, idx) => {
              const maxVal = Math.max(...data.map((d) => d.val || d.amount || d.count || 1));
              const currentVal = item.val || item.amount || item.count || 0;
              const heightPct = Math.max(12, Math.round((currentVal / maxVal) * 100));

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary-300)' }}>
                    {typeof currentVal === 'number' && currentVal > 1000 ? `$${(currentVal / 1000).toFixed(0)}k` : currentVal}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      background: idx % 2 === 0 ? 'linear-gradient(180deg, var(--primary-500), var(--primary-700))' : 'linear-gradient(180deg, var(--emerald-500), var(--emerald-700))',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 500ms ease-out',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                    {item.label || item.day || item.month || item.type || item.department}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {type === 'donut' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', height: '100%' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E293B" strokeWidth="3.8" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366F1" strokeWidth="3.8" strokeDasharray="75, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3.8" strokeDasharray="20, 100" strokeDashoffset="-75" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>91.8%</span>
                <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Presence</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === 0 ? '#6366F1' : i === 1 ? '#10B981' : '#EF4444' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.label || d.type}:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{d.val || d.count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
