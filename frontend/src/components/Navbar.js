import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function AppNavbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#58a6ff' : '#8b949e',
    fontWeight: location.pathname === path ? '600' : '400',
    fontSize: '0.9rem',
    padding: '6px 14px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    backgroundColor: location.pathname === path ? '#1c2128' : 'transparent',
    marginLeft: '4px',
  });

  return (
    <Navbar
      expand="lg"
      sticky="top"
      style={{
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d',
        padding: '10px 0',
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#1c2f4a',
            border: '1px solid #1f4068',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            🛡️
          </div>
          <div>
            <div style={{ color: '#58a6ff', fontWeight: '700', fontSize: '1.1rem', lineHeight: 1.1 }}>
              PortPulse
            </div>
            <div style={{ color: '#9098a2', fontSize: '0.80rem', lineHeight: 1, marginTop:'7px' }}>
              Network Security Analyzer
            </div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="navbar-nav"
          style={{ border: '1px solid #30363d', color: '#8b949e' }}
        />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" style={linkStyle('/')}>
              🔍 Scan
            </Nav.Link>
            <Nav.Link as={Link} to="/history" style={linkStyle('/history')}>
              🕐 History
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;