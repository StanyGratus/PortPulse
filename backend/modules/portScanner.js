const net = require('net');

// service map for known ports
const service_MAP = {
  21:   { service: 'FTP',           info: 'File transfer protocol. Sends data unencrypted — risky if exposed.' },
  22:   { service: 'SSH',           info: 'Secure remote login. Safe if configured correctly, but a common attack target.' },
  23:   { service: 'Telnet',        info: 'Old remote login. Sends everything unencrypted — highly dangerous.' },
  25:   { service: 'SMTP',          info: 'Mail sending protocol. Exposure can allow spam relay attacks.' },
  53:   { service: 'DNS',           info: 'Domain name resolution. Open DNS can be abused for amplification attacks.' },
  80:   { service: 'HTTP',          info: 'Unencrypted web traffic. All data is visible in transit.' },
  110:  { service: 'POP3',          info: 'Email retrieval. Unencrypted version exposes credentials.' },
  143:  { service: 'IMAP',          info: 'Email access. Unencrypted version exposes mailbox data.' },
  443:  { service: 'HTTPS',         info: 'Encrypted web traffic. This is what you want.' },
  445:  { service: 'SMB',           info: 'Windows file sharing. Exploited by WannaCry ransomware.' },
  465:  { service: 'SMTPS',         info: 'Secure mail submission port.' },
  587:  { service: 'SMTP-Sub',      info: 'Mail submission port. Should require authentication.' },
  993:  { service: 'IMAPS',         info: 'Secure IMAP email access.' },
  995:  { service: 'POP3S',         info: 'Secure POP3 email retrieval.' },
  1433: { service: 'MSSQL',         info: 'Microsoft SQL Server. Should never be publicly exposed.' },
  1521: { service: 'Oracle DB',     info: 'Oracle database port. Critical if exposed publicly.' },
  2375: { service: 'Docker',        info: 'Docker daemon unencrypted. Extremely dangerous if exposed.' },
  2376: { service: 'Docker TLS',    info: 'Docker daemon with TLS. Verify access is restricted.' },
  3000: { service: 'Dev Server',    info: 'Common development server port. Should not be public.' },
  3306: { service: 'MySQL',         info: 'MySQL database. Should never be publicly exposed.' },
  3389: { service: 'RDP',           info: 'Windows remote desktop. Frequently brute-forced.' },
  4000: { service: 'Dev Server',    info: 'Common development server port.' },
  5000: { service: 'Dev/Flask',     info: 'Common Flask or dev server port. Should not be public.' },
  5432: { service: 'PostgreSQL',    info: 'PostgreSQL database. Should never be publicly exposed.' },
  5900: { service: 'VNC',           info: 'Remote desktop VNC. Dangerous if exposed without auth.' },
  6379: { service: 'Redis',         info: 'Redis cache. No auth by default — critical if exposed.' },
  7000: { service: 'Cassandra',     info: 'Apache Cassandra inter-node port.' },
  8000: { service: 'HTTP-Alt',      info: 'Alternate HTTP port. Often used for dev servers.' },
  8080: { service: 'HTTP-Alt',      info: 'Alternate HTTP port. Often left open accidentally.' },
  8443: { service: 'HTTPS-Alt',     info: 'Alternate HTTPS port.' },
  8888: { service: 'Jupyter',       info: 'Jupyter Notebook. Dangerous if exposed without auth.' },
  9200: { service: 'Elasticsearch', info: 'Elasticsearch. No auth by default — data exposure risk.' },
  9300: { service: 'Elasticsearch', info: 'Elasticsearch cluster port.' },
  27017:{ service: 'MongoDB',       info: 'MongoDB database. No auth by default — critical if exposed.' },
  27018:{ service: 'MongoDB',       info: 'MongoDB shard port.' },
  853:  { service: 'DNS over TLS',  info: 'A well-known TCP port assigned to DNS over TLS (DoT' },
};

// Ports to scan — well-known range + common extras
function getPortsToScan() {
  const ports = new Set();

  // Well-known ports 1–1024
  for (let i = 1; i <= 1024; i++) ports.add(i);

  // Common high ports
  [1433, 1521, 2375, 2376, 3000, 3306, 3389, 4000,
   5000, 5432, 5900, 6379, 7000, 8000, 8080, 8443,
   8888, 9200, 9300, 27017, 27018].forEach(p => ports.add(p));

  return Array.from(ports);
}

function scanPort(host, port, timeout = 200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    // 1. Start a strict countdown timer
    const timer = setTimeout(() => {
      socket.destroy(); // Safely kill the hung connection
      resolve({ port, open: false }); // Resolve as closed
    }, timeout);

    // 2. Handle a successful connection
    socket.connect(port, host, () => {
      clearTimeout(timer); // Stop the countdown immediately!
      socket.destroy(); // Close the open port
      resolve({ port, open: true }); // Resolve as open
    });

    // 3. Handle an explicit connection failure
    socket.on('error', () => {
      clearTimeout(timer); // Stop the countdown immediately!
      socket.destroy(); // Clean up the socket
      resolve({ port, open: false }); // Resolve as closed
    });
  });
}

async function scanPorts(host) {
  const portsToScan = getPortsToScan();

  // Scan in batches to avoid overwhelming the network
  const BATCH_SIZE = 64;
  const openPorts = [];
  console.log("Scanning:", host);
  for (let i = 0; i < portsToScan.length; i += BATCH_SIZE) {
    const batch = portsToScan.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(port => scanPort(host, port)));
    results.forEach(r => {
      if (r.open) openPorts.push(r.port);
    });
  }

  // Return only open ports with their info
  return openPorts.map(port => {
    const meta = service_MAP[port];
    return {
      port,
      status: 'open',
      service: meta?.service || 'Unknown',
      info: meta?.info || `Port ${port} is open. Research this Service which actually runs in this port to understand the risk.`,
    };
  });
}

module.exports = { scanPorts };