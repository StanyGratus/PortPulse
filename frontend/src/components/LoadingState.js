import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

const STEPS = [
  { icon: '🔍', label: 'Validating target...',         done: false },
  { icon: '🔌', label: 'Scanning ports...',            done: false },
  { icon: '🌐', label: 'Resolving DNS records...',     done: false },
  { icon: '🔒', label: 'Checking SSL certificate...',  done: false },
  { icon: '📡', label: 'Fetching IP information...',   done: false },
  { icon: '🔎', label: 'Enumerating subdomains...',    done: false },
  { icon: '🧩', label: 'Detecting technologies...',    done: false },
  { icon: '⚡', label: 'Measuring response time...',   done: false },
  { icon: '📊', label: 'Calculating risk score...',    done: false },
];

function LoadingState({ target }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container style={{ paddingTop: '60px', paddingBottom: '60px', maxWidth: '520px' }}>

      {/* Header */}
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '2px solid #58a6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 20px',
          animation: 'pulse 2s ease-in-out infinite',
          backgroundColor: '#1c2128',
        }}>
          🛡️
        </div>
        <h5 style={{ color: '#c9d1d9', fontWeight: '600', marginBottom: '6px' }}>
          Analyzing Target
        </h5>
        <code style={{
          color: '#58a6ff',
          backgroundColor: '#1c2128',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '0.9rem',
        }}>
          {target}
        </code>
      </div>

      {/* Steps */}
      <div style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {STEPS.map((step, i) => {
          const isDone    = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 20px',
                borderBottom: i < STEPS.length - 1 ? '1px solid #21262d' : 'none',
                backgroundColor: isCurrent ? '#1c2128' : 'transparent',
                transition: 'background-color 0.3s',
              }}
            >
              {/* Status indicator */}
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                flexShrink: 0,
                backgroundColor: isDone
                  ? '#1a4f1a'
                  : isCurrent
                  ? '#1c2f4a'
                  : '#21262d',
                border: `1px solid ${isDone ? '#3fb950' : isCurrent ? '#58a6ff' : '#30363d'}`,
                color: isDone ? '#3fb950' : isCurrent ? '#58a6ff' : '#484f58',
              }}>
                {isDone ? '✓' : isCurrent ? '●' : '○'}
              </div>

              {/* Icon */}
              <span style={{ fontSize: '1.2rem', opacity: isDone || isCurrent ? 1 : 0.3 }}>
                {step.icon}
              </span>

              {/* Label */}
              <span style={{
                fontSize: '1rem',
                color: isDone
                  ? '#3fb950'
                  : isCurrent
                  ? '#c9d1d9'
                  : '#484f58',
                fontWeight: isCurrent ? '500' : '400',
              }}>
                {step.label}
              </span>

              {/* Spinner for current */}
              {isCurrent && (
                <div style={{
                  marginLeft: 'auto',
                  width: '14px',
                  height: '14px',
                  border: '2px solid #30363d',
                  borderTop: '2px solid #58a6ff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <p style={{
        textAlign: 'center',
        color: '#8993a0',
        fontSize: '0.81rem',
        marginTop: '16px',
      }}>
        Comprehensive scan may take 30–60 seconds
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(88,166,255,0.3); }
          50%       { box-shadow: 0 0 0 12px rgba(88,166,255,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
}

export default LoadingState;