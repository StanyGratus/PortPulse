import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { runScan } from '../api/scanApi';
import LoadingState from '../components/LoadingState';
import ScanResults from '../components/ScanResults';

const FEATURES = [
  { icon: '🔌', label: 'Port Scanning',     desc: 'Full 1-1024 range + common high ports' },
  { icon: '🌐', label: 'DNS Analysis',      desc: 'A, AAAA, MX, CNAME, TXT records' },
  { icon: '🔒', label: 'SSL Inspection',    desc: 'Certificate validity, TLS version' },
  { icon: '🧩', label: 'Tech Detection',    desc: 'Server, framework, CDN headers' },
  { icon: '🔎', label: 'Subdomain Enum',    desc: 'Dictionary-based Subdomain Enumeration (crt.sh + wordlist)' },
  { icon: '📊', label: 'Risk Scoring',      desc: 'Severity-based accurate scoring' },
];

function HomePage() {
  const [target, setTarget]   = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError]     = useState(null);

  async function handleScan(t) {
    const scanTarget = t || target;
    if (!scanTarget.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const data = await runScan(scanTarget.trim());
      setResults(data);
      setTarget(scanTarget.trim());
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Scan failed. Please check the target and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── SEARCH BAR ──────────────────────────────── */}
      <div style={{
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d',
        padding: '20px 0',
        position: 'sticky',
        top: '58px',
        zIndex: 100,
      }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={7}>
              <InputGroup size="lg">
                <InputGroup.Text style={{
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRight: 'none',
                  color: '#8b949e',
                  fontSize: '1rem',
                }}>
                  🔍
                </InputGroup.Text>
                <Form.Control
                  placeholder="Enter domain or IP address..."
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  disabled={loading}
                  style={{ borderLeft: 'none', fontSize: '0.95rem' }}
                />
                <Button
                  onClick={() => handleScan()}
                  disabled={loading || !target.trim()}
                  style={{
                    backgroundColor: '#12c235',
                    border: '1px solid #11e137',
                    padding: '0 28px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    borderRadius: '8px 8px 8px 8px',
                    color:'#ffffff'
                  }}
                >
                  {loading ? '⏳ Scanning...' : '⚡ Analyze'}
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </div>

      <Container style={{ paddingTop: '32px', paddingBottom: '60px' }}>

        {/* Error */}
        {error && (
          <Row className="justify-content-center mb-4">
            <Col md={8} lg={7}>
              <Alert
                style={{
                  backgroundColor: '#3d0f0f',
                  border: '1px solid #f8514933',
                  color: '#f85149',
                  borderRadius: '10px',
                }}
                onClose={() => setError(null)}
                dismissible
              >
                <strong>⚠️ Error:</strong> {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Loading */}
        {loading && (
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <LoadingState target={target} />
            </Col>
          </Row>
        )}

        {/* Empty state */}
        {!loading && !results && !error && (
          <div>
            {/* Hero */}
            <div className="text-center" style={{ padding: '60px 0 50px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🛡️</div>
              <h1 style={{
                color: '#c9d1d9',
                fontWeight: '700',
                fontSize: '2rem',
                marginBottom: '12px',
              }}>
                Network Security Analysis
              </h1>
              <p style={{
                color: '#8b949e',
                fontSize: '1rem',
                maxWidth: '500px',
                margin: '0 auto 32px',
                lineHeight: '1.7',
              }}>
                Analyze any domain or IP for open ports, SSL health,
                DNS records, subdomains, technologies, and security risks.
              </p>

              {/* Feature grid */}
              <Row className="justify-content-center" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {FEATURES.map(f => (
                  <Col xs={6} md={4} key={f.label} style={{ marginBottom: '16px' }}>
                    <div style={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'left',
                      height: '100%',
                    }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{f.icon}</div>
                      <div style={{ color: '#c9d1d9', fontWeight: '600', fontSize: '0.85rem', marginBottom: '3px' }}>
                        {f.label}
                      </div>
                      <div style={{ color: '#484f58', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {f.desc}
                      </div>
                    </div>
                  </Col>
                ))}
                <Row><div><p><small style={{color:'#8b949e'}}>The scan will take 30-60 seconds</small></p></div></Row>
              </Row>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <ScanResults data={results} onRescan={() => handleScan()} />
        )}

      </Container>
    </div>
  );
}

export default HomePage;