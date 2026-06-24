const dns = require('dns').promises;
const axios = require('axios');
require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Expanded common subdomain wordlist
const COMMON_SUBDOMAINS = [
  'www', 'mail', 'api', 'admin', 'dev', 'staging', 'ftp', 'blog',
  'app', 'portal', 'vpn', 'remote', 'shop', 'store', 'cdn', 'static',
  'assets', 'media', 'images', 'img', 'video', 'docs', 'help', 'support',
  'status', 'monitor', 'dashboard', 'panel', 'login', 'auth', 'sso',
  'secure', 'test', 'beta', 'alpha', 'sandbox', 'demo', 'preview',
  'old', 'new', 'v1', 'v2', 'mobile', 'm', 'wap', 'web', 'service',
  'services', 'internal', 'intranet', 'extranet', 'gateway', 'proxy',
  'smtp', 'imap', 'pop', 'mx', 'ns', 'ns1', 'ns2', 'dns', 'dns1',
  'dns2', 'cpanel', 'whm', 'webmail', 'autoconfig', 'autodiscover',
  'git', 'svn', 'jenkins', 'ci', 'jira', 'confluence', 'wiki',
  'forum', 'community', 'chat', 'slack', 'meet', 'video', 'stream',
  'analytics', 'tracking', 'metrics', 'grafana', 'kibana', 'elastic',
  'db', 'database', 'mysql', 'mongo', 'redis', 'cache', 'queue',
  'search', 'solr', 'elastic', 'backup', 'archive', 'log', 'logs',
];

// Fetch subdomains from certificate transparency logs
async function fetchFromCRT(domain) {
  try {
    const response = await axios.get(
      `https://crt.sh/?q=%25.${domain}&output=json`,
      { timeout: 3000 }
    );

    if (!response.data || !Array.isArray(response.data)) return [];

    const subdomains = new Set();
    response.data.forEach(cert => {
      const names = cert.name_value?.split('\n') || [];
      names.forEach(name => {
        const clean = name.trim().toLowerCase().replace(/^\*\./, '');
        if (clean.endsWith(domain) && clean !== domain) {
          subdomains.add(clean);
        }
      });
    });

    return [...subdomains];
  } catch {
    return [];
  }
}

async function checkSubdomain(subdomain) {
  try {
    // Try IPv4 first
    const ipv4 = await dns.resolve4(subdomain);

    return {
      subdomain,
      resolved: true,
      ip: ipv4[0],
      ipVersion: 4,
    };

  } catch {

    try {
      // Fallback to IPv6
      const ipv6 = await dns.resolve6(subdomain);

      return {
        subdomain,
        resolved: true,
        ip: ipv6[0],
        ipVersion: 6,
      };

    } catch {

      return {
        subdomain,
        resolved: false,
        ip: null,
        ipVersion: null,
      };

    }
  }
}

async function checkSubdomains(target) {
  const baseDomain = target
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .replace(/\/.*$/, '');

  // Step 1 — fetch from certificate transparency logs
  const crtSubdomains = await fetchFromCRT(baseDomain);
  const MAX_SUBDOMAINS = 50;

  // Step 2 — combine with common wordlist
  const wordlistSubs = COMMON_SUBDOMAINS.map(s => `${s}.${baseDomain}`);
  const allSubdomains = [...new Set([...crtSubdomains, ...wordlistSubs])].slice(0, MAX_SUBDOMAINS);

  // Step 3 — resolve all in batches
  const BATCH_SIZE = 30;
  const results = [];

  for (let i = 0; i < allSubdomains.length; i += BATCH_SIZE) {
    const batch = allSubdomains.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(checkSubdomain));
    results.push(...batchResults);
  }

  // Return only resolved subdomains
  return results.filter(s => s.resolved);
}

module.exports = { checkSubdomains };