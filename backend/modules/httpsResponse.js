const axios = require('axios');

async function getHTTPSResponse(target) {
  const url = `https://${target}`;

  try {
    const start = Date.now();

    const response = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortPulse/1.0)',
      },
    });

    const responseTime = Date.now() - start;

    let speedRating;

    if (responseTime < 300)
      speedRating = 'Fast';
    else if (responseTime < 800)
      speedRating = 'Moderate';
    else if (responseTime < 2000)
      speedRating = 'Slow';
    else
      speedRating = 'Very Slow';

    return {
      reachable: true,
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      speedRating,
      finalUrl: response.request?.res?.responseUrl || url,  //returned by Node.js not Axios
      contentType:
        response.headers['content-type'] || null,
    };

  } catch (error) {
    return {
      reachable: false,
      statusCode: null,
      statusText: null,
      responseTime: null,
      speedRating: 'Unreachable',
      error: error.message,
      contentType: null,
    };
  }
}

module.exports = { getHTTPSResponse };