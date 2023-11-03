const https = require('https');

async function fetchGooglePublicKeys() {
  console.log("inside fetch google public keys")
  return new Promise((resolve, reject) => {
    https.get('https://www.googleapis.com/oauth2/v3/certs', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const googlePublicKeys = JSON.parse(data);
          resolve(googlePublicKeys);
        } catch (error) {
          reject(error);
        }
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
  });
}

module.exports = {
  fetchGooglePublicKeys,
};
