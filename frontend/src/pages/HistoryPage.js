import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchHistory, clearHistory } from '../api/scanApi';
import ScoreTimeline from '../components/charts/ScoreGauge';

function gradeColor(grade) {
  if (['A+', 'A'].includes(grade)) return '#3fb950';
  if (['B+', 'B'].includes(grade)) return '#58a6ff';
  if (grade === 'C')               return '#d29922';
  return '#f85149';
}

function scoreBadge(score) {
  if (score >= 85) return { bg: '#1a4f1a', color: '#3fb950' };
  if (score >= 65) return { bg: '#1c2f4a', color: '#58a6ff' };
  if (score >= 50) return { bg: '#2d2a00', color: '#d29922' };
  return { bg: '#3d0f0f', color: '#f85149' };
}

function HistoryPage() {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      setError('Failed to load scan history.');
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm('Clear all scan history? This cannot be undone.')) return;
    try {
      setClearing(true);
      await clearHistory();
      setHistory([]);
      setSelected(null);
    } catch {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  }

  function getTimelineData(target) {
    return history
      .filter(s => s.target === target)
      .sort((a, b) => new Date(a.scannedAt) - new Date(b.scannedAt));
  }

  const uniqueTargets = [...new Set(history.map(s => s.target))];
  const avgScore = history.length
    ? Math.round(history.reduce((a, s) => a + s.riskScore, 0) / history.length)
    : 0;

  return (
    <Container style={{ paddingTop: '32px', paddingBottom: '60px' }}>

      {/* ── HEADER ───────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h3 style={{ color: '#c9d1d9', fontWeight: '700', margin: 0 }}>
            🕐 Scan History
          </h3>
          <small style={{ color: '#484f58' }}>
            {history.length} total scans · {uniqueTargets.length} unique targets
          </small>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* {history.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              style={{
                backgroundColor: '#3d0f0f',
                border: '1px solid #f8514933',
                borderRadius: '8px',
                color: '#f85149',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
              }}
            >
              {clearing ? '⏳ Clearing...' : '🗑️ Clear All'}
            </button>
          )} */}
          <Link to="/">
            <Button style={{
              backgroundColor: '#238636',
              border: '1px solid #2ea043',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}>
              ⚡ New Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { icon: '🔍', label: 'Total Scans',     value: history.length },
            { icon: '🎯', label: 'Unique Targets',  value: uniqueTargets.length },
            { icon: '📊', label: 'Average Score',   value: `${avgScore}/100` },
            { icon: '🔒', label: 'HTTPS Enabled',   value: `${history.filter(s => s.summary?.httpsEnabled).length}/${history.length}` },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ color: '#58a6ff', fontSize: '1.4rem', fontWeight: '700' }}>{stat.value}</div>
              <div style={{ color: '#484f58', fontSize: '0.72rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── LOADING ──────────────────────────────────── */}
      {loading && (
        <div className="text-center" style={{ paddingTop: '80px' }}>
          <Spinner animation="border" style={{ color: '#58a6ff' }} />
          <p style={{ color: '#8b949e', marginTop: '16px', fontSize: '0.9rem' }}>
            Loading history...
          </p>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────── */}
      {error && (
        <div style={{
          backgroundColor: '#3d0f0f',
          border: '1px solid #f8514933',
          borderRadius: '10px',
          padding: '16px 20px',
          color: '#f85149',
          marginBottom: '20px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── EMPTY STATE ──────────────────────────────── */}
      {!loading && !error && history.length === 0 && (
        <div className="text-center" style={{ paddingTop: '80px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <h5 style={{ color: '#c9d1d9', marginBottom: '8px' }}>No scans yet</h5>
          <p style={{ color: '#484f58', marginBottom: '24px', fontSize: '0.9rem' }}>
            Run your first scan to see results here.
          </p>
          <Link to="/">
            <Button style={{ backgroundColor: '#238636', border: 'none' }}>
              ⚡ Start Scanning
            </Button>
          </Link>
        </div>
      )}

      {/* ── HISTORY TABLE ────────────────────────────── */}
      {!loading && history.length > 0 && (
        <>
          <div className="section-card" style={{ marginBottom: '24px' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #30363d',
              color: '#c9d1d9',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}>
              📋 All Scans
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table hover style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Target</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Open Ports</th>
                    <th>HTTPS</th>
                    <th>Duration</th>
                    <th>Scanned At</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(scan => {
                    const sb = scoreBadge(scan.riskScore);
                    return (
                      <tr key={scan._id}>
                        <td>
                          <code style={{ color: '#58a6ff', fontSize: '0.88rem' }}>
                            {scan.target}
                          </code>
                        </td>
                        <td>
                          <span style={{
                            ...sb,
                            backgroundColor: sb.bg,
                            padding: '3px 10px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                          }}>
                            {scan.riskScore}/100
                          </span>
                        </td>
                        <td style={{
                          color: gradeColor(scan.grade),
                          fontWeight: '700',
                          fontSize: '1rem',
                        }}>
                          {scan.grade}
                        </td>
                        <td style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>
                          {scan.summary?.openPortsCount ?? '—'}
                        </td>
                        <td>
                          {scan.summary?.httpsEnabled
                            ? <span style={{ color: '#3fb950' }}>✅</span>
                            : <span style={{ color: '#f85149' }}>❌</span>
                          }
                        </td>
                        <td style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                          {scan.scanDuration ? `${scan.scanDuration}s` : '—'}
                        </td>
                        <td style={{ color: '#8b949e', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(scan.scannedAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            onClick={() => setSelected(
                              selected === scan.target ? null : scan.target
                            )}
                            style={{
                              backgroundColor: selected === scan.target ? '#1c2f4a' : '#21262d',
                              border: `1px solid ${selected === scan.target ? '#58a6ff' : '#30363d'}`,
                              borderRadius: '6px',
                              color: selected === scan.target ? '#58a6ff' : '#8b949e',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                          >
                            📈 Timeline
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>

          {/* ── TIMELINE ─────────────────────────────── */}
          {selected && (
            <div className="section-card">
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#c9d1d9', fontWeight: '600', fontSize: '0.9rem' }}>
                  📈 Score Timeline — <code style={{ color: '#58a6ff' }}>{selected}</code>
                </span>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b949e',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                <ScoreTimeline data={getTimelineData(selected)} />
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '16px',
                  flexWrap: 'wrap',
                }}>
                  {getTimelineData(selected).map((scan, i) => {
                    const sb = scoreBadge(scan.riskScore);
                    return (
                      <div key={i} style={{
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        minWidth: '120px',
                      }}>
                        <div style={{ color: '#484f58', marginBottom: '4px' }}>
                          {new Date(scan.scannedAt).toLocaleDateString()}
                        </div>
                        <div style={{
                          color: gradeColor(scan.grade),
                          fontWeight: '700',
                          fontSize: '1.1rem',
                        }}>
                          {scan.grade}
                        </div>
                        <div style={{ ...sb, backgroundColor: sb.bg, borderRadius: '6px', padding: '2px 6px', fontSize: '0.75rem', display: 'inline-block', marginTop: '2px' }}>
                          {scan.riskScore}/100
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default HistoryPage;