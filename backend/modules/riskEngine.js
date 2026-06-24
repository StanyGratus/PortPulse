function calculateRisk(scanData) {
  const { ports, ssl, subdomains, techInfo } = scanData;

  let score = 100;
  const findings = [];
  const recommendations = [];

  function deduct(points, severity, recommendation) {
    score -= points;
    findings.push({ severity, points });
    if (recommendation) recommendations.push(recommendation);
  }

  // ─────────────────────────────────────────────
  // 1. PORT ANALYSIS
  // ─────────────────────────────────────────────

  const criticalPorts = {
    23: 'Telnet',
    2375: 'Docker (unencrypted)',
    6379: 'Redis',
    27017: 'MongoDB',
  };

  const highRiskPorts = {
    3306: 'MySQL',
    5432: 'PostgreSQL',
    1433: 'MSSQL',
    1521: 'Oracle DB',
    3389: 'RDP',
    5900: 'VNC',
    8888: 'Jupyter Notebook',
    27018: 'MongoDB Shard',
    9200: 'Elasticsearch',
  };

  const mediumRiskPorts = {
    445: 'SMB',
    8080: 'HTTP-Alt',
    8000: 'HTTP-Alt',
    3000: 'Dev Server',
    4000: 'Dev Server',
    5000: 'Dev Server',
  };

  ports.forEach(p => {

    if (criticalPorts[p.port]) {
      deduct(
        20,
        'Critical',
        `🔴 CRITICAL: Port ${p.port} (${criticalPorts[p.port]}) is publicly exposed.`
      );
      return;
    }

    if (highRiskPorts[p.port]) {
      deduct(
        10,
        'High',
        `🟠 HIGH: Port ${p.port} (${highRiskPorts[p.port]}) is publicly accessible.`
      );
      return;
    }

    if (mediumRiskPorts[p.port]) {
      deduct(
        5,
        'Medium',
        `🟡 MEDIUM: Port ${p.port} (${mediumRiskPorts[p.port]}) is exposed.`
      );
      return;
    }

    // SSH = informational only
    if (p.port === 22) {
      recommendations.push(
        'ℹ️ SSH is publicly accessible. Ensure key-based authentication is enforced.'
      );
      return;
    }

    // FTP = informational only
    if (p.port === 21) {
      recommendations.push(
        'ℹ️ FTP is accessible. Consider using SFTP or FTPS where possible.'
      );
      return;
    }

    // Ignore standard HTTPS
    if (p.port === 443) return;

    deduct(
      2,
      'Low',
      `🔵 LOW: Port ${p.port} is open. Verify it is required.`
    );
  });

  // ─────────────────────────────────────────────
  // 2. HTTP / HTTPS
  // ─────────────────────────────────────────────

  const hasHTTP = ports.some(p => p.port === 80);

  if (!ssl.httpsEnabled) {
    deduct(
      30,
      'Critical',
      '🔴 CRITICAL: HTTPS is not enabled.'
    );
  } else {
    if (hasHTTP) {
      deduct(
        2,
        'Low',
        '🔵 LOW: HTTP is accessible. Ensure redirects to HTTPS.'
      );
    }
  }

  // ─────────────────────────────────────────────
  // 3. SSL ANALYSIS
  // ─────────────────────────────────────────────

  if (ssl.httpsEnabled) {

    if (ssl.expired) {
      deduct(
        25,
        'Critical',
        '🔴 CRITICAL: SSL certificate has expired.'
      );
    }
    else if (ssl.daysLeft <= 7) {
      deduct(
        20,
        'Critical',
        `🔴 CRITICAL: SSL certificate expires in ${ssl.daysLeft} days.`
      );
    }
    else if (ssl.daysLeft <= 30) {
      deduct(
        10,
        'High',
        `🟠 HIGH: SSL certificate expires in ${ssl.daysLeft} days.`
      );
    }
    else if (ssl.daysLeft <= 60) {
      deduct(
        3,
        'Medium',
        `🟡 MEDIUM: SSL certificate expires in ${ssl.daysLeft} days.`
      );
    }

    if (
      ssl.tlsVersion === 'TLSv1' ||
      ssl.tlsVersion === 'TLSv1.0'
    ) {
      deduct(
        20,
        'Critical',
        '🔴 CRITICAL: TLS 1.0 is deprecated.'
      );
    }
    else if (ssl.tlsVersion === 'TLSv1.1') {
      deduct(
        10,
        'High',
        '🟠 HIGH: TLS 1.1 is deprecated.'
      );
    }

    // TLS 1.2 = NO PENALTY
    // TLS 1.3 = NO PENALTY
  }

  // ─────────────────────────────────────────────
  // 4. SECURITY HEADERS
  // ─────────────────────────────────────────────

  const headers = techInfo?.allHeaders || {};

  if (!headers['strict-transport-security']) {
    deduct(
      5,
      'Medium',
      '🟡 MEDIUM: Missing HSTS header.'
    );
  }

  if (!headers['content-security-policy']) {
    deduct(
      5,
      'Medium',
      '🟡 MEDIUM: Missing Content-Security-Policy header.'
    );
  }

  if (!headers['x-frame-options']) {
    deduct(
      3,
      'Low',
      '🔵 LOW: Missing X-Frame-Options header.'
    );
  }

  if (!headers['x-content-type-options']) {
    deduct(
      3,
      'Low',
      '🔵 LOW: Missing X-Content-Type-Options header.'
    );
  }

  // ─────────────────────────────────────────────
  // 5. TECHNOLOGY VERSION ANALYSIS
  // ─────────────────────────────────────────────

  if (techInfo?.detected) {

    techInfo.detected.forEach(tech => {

      const val = String(tech.value || '').toLowerCase();

      if (
        tech.header === 'x-powered-by' &&
        val.includes('php')
      ) {

        const match = val.match(/php\/([\d.]+)/);

        if (match) {

          const version = parseFloat(match[1]);

          if (version < 7) {
            deduct(
              15,
              'High',
              `🟠 HIGH: PHP ${match[1]} is end-of-life.`
            );
          }
          else if (version < 8) {
            deduct(
              8,
              'Medium',
              `🟡 MEDIUM: PHP ${match[1]} is outdated.`
            );
          }
        }
      }
    });
  }

  // ─────────────────────────────────────────────
  // 6. SUBDOMAINS
  // ─────────────────────────────────────────────

  const sensitiveSubdomains = [
    'admin',
    'panel',
    'cpanel',
    'whm',
    'dev',
    'staging',
    'test',
    'internal',
    'db',
    'database',
    'grafana',
    'kibana',
    'jenkins',
  ];

  subdomains.forEach(s => {

    const prefix =
      s.subdomain.split('.')[0].toLowerCase();

    if (sensitiveSubdomains.includes(prefix)) {

      recommendations.push(
        `ℹ️ Sensitive subdomain detected: ${s.subdomain}`
      );

      deduct(
        1,
        'Low',
        null
      );
    }
  });

  // ─────────────────────────────────────────────
  // 7. SCORE LIMITS
  // ─────────────────────────────────────────────

  score = Math.max(0, Math.min(100, score));

  // ─────────────────────────────────────────────
  // 8. GRADE
  // ─────────────────────────────────────────────

  let grade;

  if (score >= 98) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  // ─────────────────────────────────────────────
  // 9. SEVERITY COUNTS
  // ─────────────────────────────────────────────

  const severityCounts = {
    critical: findings.filter(f => f.severity === 'Critical').length,
    high: findings.filter(f => f.severity === 'High').length,
    medium: findings.filter(f => f.severity === 'Medium').length,
    low: findings.filter(f => f.severity === 'Low').length,
  };

  if (recommendations.length === 0) {
    recommendations.push(
      '✅ No significant exposure detected.'
    );
  }

  return {
    score,
    grade,
    recommendations,
    severityCounts,
    summary: {
      openPortsCount: ports.length,
      resolvedSubdomainsCount: subdomains.length,
      httpsEnabled: ssl.httpsEnabled || false,
      certValid: ssl.valid && !ssl.expired,
    },
  };
}

module.exports = { calculateRisk };