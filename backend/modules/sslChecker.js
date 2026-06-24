const tls=require('tls');
function checkSSL(target)
{
    return new Promise((resolve)=>
    {
        const options={
            host:target,
            port:443,
            servername:target,
            rejectUnauthorized:false,
            timeout:5000
        };
        const socket=tls.connect(options, ()=>{
            const cert=socket.getPeerCertificate();
            const protocal=socket.getProtocol();

        // If no certificate returned
        if (!cert || Object.keys(cert).length === 0) {
            socket.destroy();
            resolve({
                httpsEnabled: true,
                valid: false,
                error: 'No certificate found',
            });
            return;
        }
        const expiresOn = new Date(cert.valid_to);
        const now = new Date();
        const daysLeft = Math.floor((expiresOn - now) / (1000 * 60 * 60 * 24));

        socket.destroy();
        resolve({
            httpsEnabled: true,
            valid: socket.authorized,
            authorizationError: socket.authorizationError || null,
            issuer: cert.issuer?.O || 'Unknown',
            issuedTo: cert.subject?.CN || target,
            validFrom: cert.valid_from,
            expiresOn: cert.valid_to,
            daysLeft,
            tlsVersion: protocal,
            expired: daysLeft < 0,
            expiringSoon: daysLeft <= 30 && daysLeft >= 0,
        });
        });
        // Connection error — HTTPS not available
        socket.on('error', () => {
        socket.destroy();
        resolve({
            httpsEnabled: false,
            valid: false,
            authorizationError: socket.authorizationError || null,
            error: 'Could not establish SSL connection',
        });
        });

        // Timeout
        socket.on('timeout', () => {
        socket.destroy();
        resolve({
            httpsEnabled: false,
            valid: false,
            error: 'SSL connection timed out',
        });
        });
  });
}

module.exports = { checkSSL };

