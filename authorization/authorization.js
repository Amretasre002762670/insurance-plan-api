const https = require('https');
const jwt = require('jsonwebtoken');

function fetchGooglePublicKeys(callback) {
    https.get('https://www.googleapis.com/oauth2/v3/certs', (response) => {
      let data = '';
  
      response.on('data', (chunk) => {
        data += chunk;
      });
  
      response.on('end', () => {
        const googlePublicKeys = JSON.parse(data);
        callback(googlePublicKeys);
      });
    });
  }

function verifyIdToken(req, res, next) {
    console.log("inside Auth")
  const idToken = req.get('Authorization'); // Assuming the id_token is passed in the Authorization header

  if (!idToken) {
    return res.status(401).send('No id_token provided');
  }

  fetchGooglePublicKeys((googlePublicKeys) => {
    const kid = jwt.decode(idToken, { complete: true })?.header.kid;
    const publicKey = googlePublicKeys[kid];
    console.log(kid, "kid");
    if (!publicKey) {
      return res.status(401).send('No public key retrived from Google');
    }
    console.log(publicKey, "public key from google");
    jwt.verify(idToken, publicKey, (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid id_token');
      }

      req.user = decoded; // You can store user information in the request for later use
      next();
    });
  });
}

module.exports = {
  verifyIdToken,
};
