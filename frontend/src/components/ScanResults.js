import React, { useState } from 'react';
import { Row, Col, Card, Table, Badge, Alert, ProgressBar } from 'react-bootstrap';

// ─── Helpers ─────────────────────────────────────────────
function gradeColor(grade) {
  if (['A+', 'A'].includes(grade)) return '#3fb950';
  if (['B+', 'B'].includes(grade)) return '#58a6ff';
  if (grade === 'C')               return '#d29922';
  if (grade === 'D')               return '#f85149';
  return '#da3633';
}

function scoreBackground(score) {
  if (score >= 85) return { bg: '#1a4f1a', color: '#3fb950', border: '#2ea04333' };
  if (score >= 65) return { bg: '#1c2f4a', color: '#58a6ff', border: '#58a6ff33' };
  if (score >= 50) return { bg: '#2d2a00', color: '#d29922', border: '#d2992233' };
  return { bg: '#3d0f0f', color: '#f85149', border: '#f8514933' };
}

function SectionHeader({ icon, title, badge }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid #30363d',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ color: '#c9d1d9', fontWeight: '600', fontSize: '0.95rem' }}>{title}</span>
      {badge && (
        <span style={{
          marginLeft: 'auto',
          backgroundColor: '#21262d',
          color: '#8b949e',
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: '500',
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, color }) {
  return (
    <tr>
      <td style={{ color: '#8b949e', fontSize: '0.82rem', width: '140px', paddingLeft: '20px !important' }}>
        {label}
      </td>
      <td style={{
        color: color || '#c9d1d9',
        fontSize: '0.85rem',
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value || '—'}
      </td>
    </tr>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    Critical: { bg: '#3d0f0f', color: '#da3633', label: '🔴 Critical' },
    High:     { bg: '#2d1a00', color: '#f85149', label: '🟠 High' },
    Medium:   { bg: '#2d2a00', color: '#d29922', label: '🟡 Medium' },
    Low:      { bg: '#1c2f4a', color: '#58a6ff', label: '🔵 Low' },
  };
  const s = map[severity] || map.Low;
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontSize: '0.7rem',
      padding: '2px 8px',
      borderRadius: '10px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function portSeverity(port) {
  const critical = [23, 21, 2375, 9200, 27017, 6379];
  const high     = [3306, 5432, 1433, 1521, 3389, 5900, 8888, 27018];
  const medium   = [22, 25, 110, 143, 445, 8080, 8000, 3000, 4000, 5000];
  if (critical.includes(port)) return 'Critical';
  if (high.includes(port))     return 'High';
  if (medium.includes(port))   return 'Medium';
  if (port === 80)             return 'Low';
  return 'Low';
}

// ─── MAIN COMPONENT ──────────────────────────────────────
function ScanResults({ data, onRescan }) {
  const [showAllHeaders, setShowAllHeaders] = useState(false);

  const {
    target, scannedAt, scanDuration,
    ipInfo, ports, dns, ssl,
    subdomains, techInfo, httpInfo,
    protocolStack, riskScore, grade,
    recommendations, severityCounts, summary,
  } = data;

  const sc = scoreBackground(riskScore);

  return (
    <div>

      {/* ── SCAN HEADER ─────────────────────────────── */}
      <div style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '18px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎯</span>
            <code style={{
              color: '#58a6ff',
              fontSize: '1.2rem',
              fontWeight: '700',
              backgroundColor: '#1c2128',
              padding: '2px 10px',
              borderRadius: '6px',
            }}>
              {target}
            </code>
          </div>
          <small style={{ color: '#fcfcfd', marginLeft: '28px', fontSize:'0.9rem' }}>
            {new Date(scannedAt).toLocaleString()} - {scanDuration}s - {ipInfo.city}, {ipInfo.country}
          </small>
        </div>
        <button
          onClick={onRescan}
          style={{
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#8b949e',
            padding: '8px 18px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.target.style.borderColor = '#58a6ff'; e.target.style.color = '#58a6ff'; }}
          onMouseOut={e => { e.target.style.borderColor = '#30363d'; e.target.style.color = '#8b949e'; }}
        >
          🔄 Rescan
        </button>
      </div>

      {/* ── ROW 1 — SCORE + SEVERITY + SUMMARY ──────── */}
      <Row className="mb-3">

        {/* Score Card */}
        <Col md={4} className="mb-3">
          <div style={{
            backgroundColor: sc.bg,
            border: `1px solid ${sc.border}`,
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            height: '100%',
          }}>
            <div style={{ color: sc.color, fontSize: '4.2rem', fontWeight: '700', lineHeight: 1 }}>
              {grade}
            </div>
            <div style={{ color: sc.color, fontSize: '1.8rem', fontWeight: '700', margin: '8px 0' }}>
              {riskScore}/100
            </div>
            <ProgressBar
              now={riskScore}
              style={{ height: '6px', backgroundColor: '#21262d', margin: '12px 0' }}
              variant={riskScore >= 85 ? 'success' : riskScore >= 65 ? 'info' : riskScore >= 50 ? 'warning' : 'danger'}
            />
            <div style={{ color: sc.color, fontSize: '0.9rem', fontWeight: '500', opacity: 0.8 }}>
              Exposure Score
            </div>

            {/* Severity counts */}
            {severityCounts && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '20px',
              }}>
                {[
                  { label: 'Critical', count: severityCounts.critical, color: '#da3633', bg: '#3d0f0f' },
                  { label: 'High',     count: severityCounts.high,     color: '#f85149', bg: '#2d1a00' },
                  { label: 'Medium',   count: severityCounts.medium,   color: '#d29922', bg: '#2d2a00' },
                  { label: 'Low',      count: severityCounts.low,      color: '#58a6ff', bg: '#1c2f4a' },
                ].map(s => (
                  <div key={s.label} style={{
                    backgroundColor: s.bg,
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: s.color, fontSize: '1.2rem', fontWeight: '700' }}>
                      {s.count}
                    </div>
                    <div style={{ color: s.color, fontSize: '0.68rem', opacity: 0.8 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* Summary Cards */}
        <Col md={8}>
          <Row>
            {[
              {
                icon: '🌐', label: 'IP Address',
                value: ipInfo.ip,
                sub: `${ipInfo.org || ''}`,
                color: '#c9d1d9',
              },
              {
                icon: '🔒', label: 'SSL Status',
                value: ssl.httpsEnabled
                  ? (ssl.expired ? '❌ Expired' : '✅ Valid')
                  : '❌ No HTTPS',
                sub: ssl.httpsEnabled
                  ? `${ssl.daysLeft}d left · ${ssl.tlsVersion} · ${ssl.issuer}`
                  : 'Connection is unencrypted',
                color: ssl.httpsEnabled && !ssl.expired ? '#3fb950' : '#f85149',
              },
              {
                icon: '🔌', label: 'Open Ports',
                value: `${summary.openPortsCount}`,
                sub: 'open ports detected',
                color: summary.openPortsCount > 5 ? '#f85149' : summary.openPortsCount > 2 ? '#d29922' : '#3fb950',
              },
              {
                icon: '🔎', label: 'Subdomains',
                value: `${summary.resolvedSubdomainsCount}`,
                sub: 'resolved subdomains',
                color: '#c9d1d9',
              },
              {
                icon: '🧩', label: 'Technologies',
                value: `${techInfo?.totalFound || 0}`,
                sub: 'detected from headers',
                color: '#c9d1d9',
              },
              {
                icon: '⚡', label: 'Response Time',
                value: httpInfo?.responseTime ? `${httpInfo.responseTime}ms` : '—',
                sub: httpInfo?.speedRating || '—',
                color:!httpInfo?.responseTime ? '#8b949e': httpInfo.responseTime < 300 ? '#3fb950' : httpInfo.responseTime < 800 ? '#d29922' : '#f85149'
              },
            ].map(card => (
              <Col xs={6} md={4} key={card.label} className="mb-3">
                <div style={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  height: '100%',
                }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{card.icon}</div>
                  <div style={{ color: '#8b949e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    {card.label}
                  </div>
                  <div style={{ color: card.color, fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.2 }}>
                    {card.value}
                  </div>
                  <div style={{ color: '#87a0c1', fontSize: '1rem', marginTop: '2px', lineHeight: 1.3 }}>
                    {card.sub}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

      </Row>

      {/* ── ROW 2 — PORTS ───────────────────── */}
      <Row className="mb-3">
        <Col lg={8} className="mb-3">
          <div className="section-card">
            <SectionHeader
              icon="🔌"
              title="Open Ports"
              badge={`${ports.length} open`}
            />
            {ports.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#484f58' }}>
                ✅ No open ports detected
              </div>
            ) : (
              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight:'450px' }}>
                <Table hover style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>Service</th>
                      <th>Severity</th>
                      <th>Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.map(p => (
                      <tr key={p.port}>
                        <td>
                          <code style={{ color: '#58a6ff', fontSize: '0.9rem' }}>{p.port}</code>
                        </td>
                        <td style={{ fontWeight: '500', color: '#c9d1d9' }}>{p.service}</td>
                        <td><SeverityBadge severity={portSeverity(p.port)} /></td>
                        <td style={{ color: '#8b949e', fontSize: '0.8rem', maxWidth: '240px' }}>
                          {p.info}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Col>
        
      </Row>

      {/* ── ROW 3 — SSL + DNS ───────────────────────── */}
      <Row className="mb-3">
        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader icon="🔒" title="SSL Certificate" />
            <Table borderless style={{ margin: 0 }}>
              <tbody>
                <InfoRow label="HTTPS"       value={ssl.httpsEnabled ? '✅ Enabled' : '❌ Disabled'} />
                <InfoRow label="Valid"        value={ssl.valid ? '✅ Yes' : '❌ No'} />
                <InfoRow label="Issuer"       value={ssl.issuer} />
                <InfoRow label="Issued To"    value={ssl.issuedTo} mono />
                <InfoRow label="Valid From"   value={ssl.validFrom} />
                <InfoRow label="Expires On"   value={ssl.expiresOn} />
                <InfoRow
                  label="Days Left"
                  value={ssl.daysLeft != null ? `${ssl.daysLeft} days ${ssl.expiringSoon ? '⚠️' : ssl.daysLeft > 60 ? '✅' : ''}` : '—'}
                  color={ssl.daysLeft > 60 ? '#3fb950' : ssl.daysLeft > 30 ? '#d29922' : '#f85149'}
                />
                <InfoRow
                  label="TLS Version"
                  value={ssl.tlsVersion}
                  color={ssl.tlsVersion === 'TLSv1.3' ? '#3fb950' : ssl.tlsVersion === 'TLSv1.2' ? '#a3b93f' : '#f85149'}
                />
              </tbody>
            </Table>
          </div>
        </Col>

        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader icon="🌐" title="DNS Records" />
            <div style={{ padding: '16px 20px' }}>
              {['A','AAAA', 'MX', 'CNAME', 'TXT'].map(type => (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      backgroundColor: '#1c2f4a',
                      color: '#58a6ff',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {type}
                    </span>
                    <span style={{ color: '#899cb6', fontSize: '0.75rem' }}>
                      {dns[type]?.length || 0} record{dns[type]?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {dns[type] && dns[type].length > 0 ? (
                    dns[type].slice(0, 3).map((record, i) => (
                      <div key={i} className="mono" style={{
                        color: '#c9d1d9',
                        backgroundColor: '#0d1117',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        marginBottom: '3px',
                        wordBreak: 'break-all',
                        fontSize: '0.78rem',
                      }}>
                        {typeof record === 'object'
                          ? `${record.exchange} (priority: ${record.priority})`
                          : record}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#899cb6', fontSize: '0.8rem' }}>No records</div>
                  )}
                  {dns[type]?.length > 3 && (
                    <div style={{ color: '#899cb6', fontSize: '0.72rem', marginTop: '3px' }}>
                      +{dns[type].length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* ── ROW 4 — IP INFO + HTTPS ───────────────────── */}
      <Row className="mb-3">
        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader icon="📡" title="IP Information" />
            <Table borderless style={{ margin: 0 }}>
              <tbody>
                <InfoRow label="IP Version" value={ipInfo.ip?.includes(':') ? 'IPv6' : 'IPv4'}/>
                <InfoRow label="IP Address" value={ipInfo.ip}          mono color="#58a6ff" />
                <InfoRow label="Country" value={`${ipInfo.countryCode || ''} ${ipInfo.country || ''}`}/>
                <InfoRow label="City"       value={ipInfo.city} />
                <InfoRow label="ISP"        value={ipInfo.isp} />
                <InfoRow label="Org"        value={ipInfo.org} />
                <InfoRow label="ASN"        value={ipInfo.asn}         mono />
              </tbody>
            </Table>
          </div>
        </Col>

        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader icon="⚡" title="HTTPS Response" />
            <Table borderless style={{ margin: 0 }}>
              <tbody>
                <InfoRow
                  label="Status"
                  value={httpInfo?.statusCode ? `${httpInfo.statusCode} ${httpInfo.statusText}` : '—'}
                  color={httpInfo?.statusCode === 200 ? '#3fb950' : '#d29922'}
                />
                <InfoRow
                  label="Response Time"
                  value={httpInfo?.responseTime ? `${httpInfo.responseTime}ms` : '—'}
                  color={httpInfo?.responseTime < 300 ? '#3fb950' : httpInfo?.responseTime < 800 ? '#d29922' : '#f85149'}
                />
                <InfoRow label="Speed Rating"   value={httpInfo?.speedRating} />
                <InfoRow label="Final URL"       value={httpInfo?.finalUrl} mono />
                <InfoRow label="Content Type"    value={httpInfo?.contentType} />
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* ── ROW 5 — Header Evidence ──────────────────── */}
      <Row className="mb-3">
        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader
              icon="🧩"
              title="Header Evidence"
              badge={`${techInfo?.totalFound || 0} found`}
            />
            {techInfo?.detected?.length > 0 ? (
              <>
                {/* Matched headers */}
                <div style={{ padding: '12px 20px' }}>
                  {techInfo.detected.map((tech, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '10px 0',
                      borderBottom: i < techInfo.detected.length - 1 ? '1px solid #21262d' : 'none',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#c9d1d9', fontWeight: '500', fontSize: '0.88rem' }}>
                          {tech.value}
                        </div>
                        <div className="mono" style={{ color: '#6c7683', fontSize: '0.72rem', marginTop: '2px' }}>
                          {tech.header}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: '#21262d',
                        color: '#58a6ff',
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {tech.category}
                      </span>
                    </div>
                  ))}
                </div>

                {/* All headers toggle */}
                {techInfo.allHeaders && Object.keys(techInfo.allHeaders).length > 0 && (
                  <div style={{ borderTop: '1px solid #30363d', padding: '12px 20px' }}>
                    <button
                      onClick={() => setShowAllHeaders(!showAllHeaders)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#58a6ff',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        padding: 0,
                      }}
                    >
                      {showAllHeaders ? '▲ Hide' : '▼ Show'} all response headers
                      ({Object.keys(techInfo.allHeaders).length})
                    </button>

                    {showAllHeaders && (
                      <div style={{ marginTop: '12px' }}>
                        {Object.entries(techInfo.allHeaders).map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex',
                            gap: '10px',
                            padding: '4px 0',
                            borderBottom: '1px solid #21262d',
                          }}>
                            <span className="mono" style={{ color: '#a0aab5', fontSize: '0.75rem', minWidth: '160px', flexShrink: 0 }}>
                              {k}
                            </span>
                            <span className="mono" style={{ color: '#c9d1d9', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                              {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#484f58', fontSize: '0.85rem' }}>
                No technology headers detected. Target may be hiding server information.
              </div>
            )}
          </div>
        </Col>

        {/* Subdomains */}
        <Col md={6} className="mb-3">
          <div className="section-card" style={{ height: '100%' }}>
            <SectionHeader
              icon="🔎"
              title="Subdomains"
              badge={`${summary.resolvedSubdomainsCount} resolved`}
            />
            {subdomains.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#484f58', fontSize: '0.85rem' }}>
                No subdomains resolved
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
                <Table hover style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Subdomain</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subdomains.map((s, i) => (
                      <tr key={i}>
                        <td className="mono" style={{ color: '#c9d1d9', fontSize: '0.78rem' }}>
                          {s.subdomain}
                        </td>
                        <td className="mono" style={{ color: '#58a6ff', fontSize: '0.78rem' }}>
                          {s.ip || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* ── PROTOCOL STACK ──────────────────────────── */}
      <div className="section-card mb-3">
        <SectionHeader icon="📶" title="Protocol Stack" />
        <div style={{ padding: '20px' }}>
          <Row>
            {[
              { layer: 'Application Layer', value: protocolStack?.application || 'Unknown', color: '#58a6ff', icon: '🌐', desc: 'Services & protocols' },
              { layer: 'Transport Layer',   value: protocolStack?.transport,   color: '#3fb950', icon: '📡', desc: 'End-to-end delivery' },
              { layer: 'Network Layer',     value: protocolStack?.network,     color: '#d29922', icon: '🔗', desc: 'Routing & addressing' },
              { layer: 'Data Link Layer',   value: protocolStack?.dataLink,    color: '#8b949e', icon: '⚡', desc: 'Physical link' },
            ].map((item, i) => (
              <Col md={3} sm={6} key={i} className="mb-3">
                <div style={{
                  backgroundColor: '#0d1117',
                  border: `1px solid ${item.color}22`,
                  borderLeft: `3px solid ${item.color}`,
                  borderRadius: '8px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ color: '#f7f7f7', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    {item.layer}
                  </div>
                  <div style={{ color: item.color, fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {item.value}
                  </div>
                  <div style={{ color: '#69727d', fontSize: '0.7rem' }}>{item.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ─────────────────────────── */}
      <div className="section-card mb-3">
        {recommendations.length === 0 && (
          <div
            style={{
              padding: '20px',
              color: '#3fb950'
            }}
          >
            ✅ No significant findings detected.
          </div>
        )}
        <SectionHeader
          icon="💡"
          title="Security Recommendations"
          badge={`${recommendations.length} finding${recommendations.length !== 1 ? 's' : ''}`}
        />
        <div style={{ padding: '16px 20px' }}>
          {recommendations.map((rec, i) => {
            const isCritical = rec.startsWith('🔴');
            const isHigh     = rec.startsWith('🟠');
            const isMedium   = rec.startsWith('🟡');
            const isLow      = rec.startsWith('🔵');
            const isGood     = rec.startsWith('✅');

            const style = isCritical
              ? { bg: '#3d0f0f', border: '#da363333', left: '#da3633' }
              : isHigh
              ? { bg: '#2d1a00', border: '#f8514933', left: '#f85149' }
              : isMedium
              ? { bg: '#2d2a00', border: '#d2992233', left: '#d29922' }
              : isLow
              ? { bg: '#1c2f4a', border: '#58a6ff33', left: '#58a6ff' }
              : { bg: '#1a4f1a', border: '#3fb95033', left: '#3fb950' };

            return (
              <div key={i} style={{
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                borderLeft: `3px solid ${style.left}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '8px',
                fontSize: '0.85rem',
                color: '#c9d1d9',
                lineHeight: '1.5',
              }}>
                {rec}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default ScanResults;