const dns = require('dns').promises;

// Force use Google's public DNS — fixes corporate/ISP DNS blocking
require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);


async function resolveDNS(target) {
  const results = {
    A: [],   //IPv4
    AAAA:[],   //IPv6
    MX: [], //Mail Server
    CNAME: [],  //Canonical Name
    TXT: [],    //Text Info
  };

  // A Records — IPv4 addresses
  try {
    results.A = await dns.resolve4(target);
  } catch {
    results.A = [];
  }

  // AAAA Records - IPv6 addresses
  try {
    results.AAAA =
      await dns.resolve6(target);
  } catch {
    results.AAAA = [];
  }

  // MX Records — mail servers
  try {
    const mx = await dns.resolveMx(target);
    results.MX = mx.map(r => ({
      exchange: r.exchange,
      priority: r.priority,
    }));
  } catch {
    results.MX = [];
  }

  // CNAME Records — aliases
  try {
    results.CNAME = await dns.resolveCname(target);
  } catch {
    results.CNAME = [];
  }

  // TXT Records — text/verification records
  try {
    const txt = await dns.resolveTxt(target);
    results.TXT = txt.map(r => r.join(' '));
  } catch {
    results.TXT = [];
  }

  return results;
}

module.exports = { resolveDNS };