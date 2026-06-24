const axios = require('axios');
const dns = require('dns').promises;

// Force Google DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function getIPInfo(target) {
  try {
    // Step 1 — check if already an IP
    const net = require('net');
    const isIP = net.isIP(target) !== 0;
    let ip = target;

    // Step 2 — resolve domain to IP
    if (!isIP) {
      try {
      // Try IPv4 first
      const ipv4Addresses = await dns.resolve4(target);

      if (ipv4Addresses.length > 0) {
        ip = ipv4Addresses[0];
      } else {
        throw new Error('No IPv4 records found');
      }

    } catch {

      try {
        // Fallback to IPv6
        const ipv6Addresses = await dns.resolve6(target);

        if (ipv6Addresses.length > 0) {
          ip = ipv6Addresses[0];
        } else {
          throw new Error('No IPv6 records found');
        }

      } catch {

        // Final fallback — system resolver
        const { promisify } = require('util');
        const dnsLookup = promisify(require('dns').lookup);

        const result = await dnsLookup(target);

        ip = result.address;
      }
    }
    }

    // Step 3 — fetch geolocation
    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,org,isp,lat,lon,as`,
      { timeout: 5000 }
    );

    const data = response.data;

    if (data.status !== 'success') {
      return {
        ip,
        error: 'Could not fetch IP information',
      };
    }

    return {
      ip,
      country: data.country || 'Unknown',
      countryCode: data.countryCode || '',
      city: data.city || 'Unknown',
      org: data.org || 'Unknown',
      isp: data.isp || 'Unknown',
      asn: data.as || 'Unknown',
      lat: data.lat,
      lon: data.lon,
    };

  } catch (error) {
    return {
      ip: target,
      error: `IP info fetch failed: ${error.message}`,
    };
  }
}

module.exports = { getIPInfo };