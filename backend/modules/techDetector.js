const axios = require('axios');

async function detectTechnologies(target) {
  try {
    const response = await axios.get(`https://${target}`, {
      timeout: 5000,
      maxRedirects: 3,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortPulse/1.0)' },
    });

    const headers = response.headers;
    const detected = [];

    // Return ALL non-empty headers as tech evidence
    const relevantHeaders = [
      'server',
      'x-powered-by',
      'x-generator',
      'x-drupal-cache',
      'x-wordpress-cache',
      'via',
      'x-cache',
      'x-served-by',
      'x-backend-server',
      'x-application-context',
      'x-aspnet-version',
      'x-aspnetmvc-version',
      'cf-ray',
      'x-amz-cf-id',
      'x-azure-ref',
      'x-varnish',
      'x-shopify-stage',
      'x-wix-request-id',
      'x-magento-cache-debug',
    ];

    relevantHeaders.forEach(header => {
      const value = headers[header];
      if (value) {
        detected.push({
          header,
          value,
          category: inferCategory(header, value),
        });
      }
    });

    return {
      detected,
      totalFound: detected.length,
      allHeaders: Object.fromEntries(
        Object.entries(headers).filter(([, v]) => v)
      ),
    };

  } catch {
    try {
      const response = await axios.get(`http://${target}`, {
        timeout: 5000,
        maxRedirects: 3,
        validateStatus: () => true,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortPulse/1.0)' },
      });

      const headers = response.headers;
      return {
        detected: headers['server']
          ? [{ header: 'server', value: headers['server'], category: 'Web Server' }]
          : [],
        totalFound: headers['server'] ? 1 : 0,
        allHeaders: Object.fromEntries(
            Object.entries(headers)
              .filter(([k, v]) =>
                v &&
                k !== 'set-cookie'
              )
        ),
      };
    } catch {
      return { detected: [], totalFound: 0, allHeaders: {} };
    }
  }
}

function inferCategory(header, value) {
  const lowerValue = String(value).toLowerCase();
  if (header === 'server')                    return 'Web Server';
  if (header === 'x-powered-by')             return 'Language / Framework';
  if (header === 'x-generator')              return 'CMS';
  if (header.includes('cf-') || lowerValue.includes('cloudflare')) return 'CDN';
  if (header.includes('amz') || header.includes('aws'))       return 'Cloud - AWS';
  if (header.includes('azure'))              return 'Cloud - Azure';
  if (header.includes('varnish'))            return 'Cache';
  if (header.includes('shopify'))            return 'E-Commerce';
  if (header.includes('wix'))               return 'Website Builder';
  if (header.includes('magento'))           return 'E-Commerce';
  if (header.includes('aspnet'))            return 'Framework';
  if (header === 'via')                     return 'Proxy / CDN';
  return 'Server Info';
}

module.exports = { detectTechnologies };