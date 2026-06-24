const { scanPorts }          = require('../modules/portScanner');
const { resolveDNS }         = require('../modules/dnsResolver');
const { checkSSL }           = require('../modules/sslChecker');
const { getIPInfo }          = require('../modules/ipInfo');
const { checkSubdomains }    = require('../modules/subdomainChecker');
const { calculateRisk }      = require('../modules/riskEngine');
const { detectTechnologies } = require('../modules/techDetector');
const { getHTTPSResponse }    = require('../modules/httpsResponse');
const ScanHistory            = require('../models/scanHistory');

function validateTarget(target) {
  if (!target || target.trim() === '') {
    return { valid: false, error: 'Target is required' };
  }
  const cleaned = target
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blocked.includes(cleaned.toLowerCase())) {
    return { valid: false, error: 'Scanning local addresses is not allowed' };
  }

  const privateIPv4 = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;
  const privateIPv6 =/^(fc|fd|fe80)/i;
  if (privateIPv4.test(cleaned) || privateIPv6.test(cleaned)) {
    return { valid: false, error: 'Scanning private IP ranges is not allowed' };
  }

  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  const ipPattern =/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const net= require('net');
  const isIP = net.isIP(cleaned) !== 0;
  console.log("cleaned =", cleaned);
  console.log("domainPattern =", domainPattern.test(cleaned));
  console.log("isIP =", net.isIP(cleaned));
  
  if (!domainPattern.test(cleaned) && !isIP) {
  return {
    valid: false,
    error: 'Invalid domain or IP address'
  };
}

  return { valid: true, cleaned };
}

async function targetExists(target) {
  const dns = require('dns').promises;
  require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  const net= require('net');
  const isIP = net.isIP(target) !== 0;
  const ipVersion = net.isIP(target);

  if (isIP) {
    // For IPs — try a basic TCP connection on port 80 or 443
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      socket.connect({
          host: target,
          port: 443,
          family: ipVersion
        }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        // Try port 80
        const s2 = new net.Socket();
        s2.connect({
          host: target,
          port: 80,
          family: ipVersion
        }, () => {
          s2.destroy();
          resolve(true);
        });
        s2.on('error', () => { s2.destroy(); resolve(false); });
        s2.setTimeout(1000, () => { s2.destroy(); resolve(false); });
      });
      socket.setTimeout(1000, () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  //Domain address checking 
    try {
      await dns.resolve(target);
      return true;
    } catch {
      return false;
    }
}

async function runScan(req, res) {
  const { target } = req.body;

  // Validate target
  const validation = validateTarget(target);

if (!validation.valid) {
  return res.status(400).json({
    error: validation.error
  });
}

const cleanTarget = validation.cleaned;

const exists = await targetExists(cleanTarget);

if (!exists) {
  return res.status(404).json({
    error: 'Target does not exist',
    message: `Could not resolve or reach "${cleanTarget}". Please check the domain or IP and try again.`,
    target: cleanTarget,
  });
}

  // Start scan duration timer
  const scanStart = Date.now();

  try {
    // Run all modules in parallel
    const [ports, dns, ssl, ipInfo, subdomains, techInfo, httpInfo] =
      await Promise.all([
        scanPorts(cleanTarget),
        resolveDNS(cleanTarget),
        checkSSL(cleanTarget),
        getIPInfo(cleanTarget),
        checkSubdomains(cleanTarget),
        detectTechnologies(cleanTarget),
        getHTTPSResponse(cleanTarget),
      ]);

    // Calculate scan duration
    const scanDuration = ((Date.now() - scanStart) / 1000).toFixed(1);

    // Build scan data for risk engine
    const scanData = { ports, dns, ssl, subdomains };
    const risk = calculateRisk(scanData);

    // Build protocol stack
    const appLayerServices = ports.map(p => p.service).join(', ') || 'None detected';

    const protocolStack = {
      application: appLayerServices,
      transport: 'TCP',
      network: `IP → ${ipInfo.ip}`,
      dataLink: 'Ethernet',
    };

    // Final result
    const result = {
      target: cleanTarget,
      scannedAt: new Date(),
      scanDuration,
      ipInfo,
      ports,
      dns,
      ssl,
      subdomains,
      techInfo,
      httpInfo,
      protocolStack,
      riskScore: risk.score,
      grade: risk.grade,
      recommendations: risk.recommendations,
      summary: risk.summary,
    };

    // Save to MongoDB
    await ScanHistory.create({
      target: cleanTarget,
      riskScore: risk.score,
      grade: risk.grade,
      scannedAt: result.scannedAt,
      scanDuration,
      summary: risk.summary,
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Scan error:', error.message);
    return res.status(500).json({
      error: 'Scan failed',
      message: error.message,
    });
  }
}

module.exports = { runScan };