// // const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
// const { fetchGooglePublicKeys } = require("./fetchGooglePublicKeys.js");

// function decodeIdToken(idToken) {
//     const segments = idToken.split('.');

//     // Base64 decode the payload segment
//     const payload = JSON.parse(atob(segments[1]));

//     return payload;
//   }

// async function verifyIdToken(req, res, next) {
//     console.log("inside Auth");
//     const idToken = req.get('Authorization'); // Assuming the id_token is passed in the Authorization header
//     console.log(idToken, "auth token");
//     if (!idToken) {
//         return res.status(401).send('No id_token provided');
//     }

//     const decodedToken = jwt.decode(idToken, { complete: true });
//     console.log(decodedToken, "decoded token");

//     if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
//         return res.status(401).send('Invalid or missing kid in the JWT header');
//     }

//     try {
//         const googlePublicKeys = await fetchGooglePublicKeys();
//         const kid = decodedToken.header.kid;
//         const publicKey = googlePublicKeys[kid];

//         console.log(googlePublicKeys, "kid");

//         if (!publicKey) {
//             return res.status(401).send('No public key retrieved from Google');
//         }

//         console.log(publicKey, "public key from Google");

//         jwt.verify(idToken, publicKey, (err, decoded) => {
//             if (err) {
//                 return res.status(401).send('Invalid id_token');
//             }

//             req.user = decoded; // You can store user information in the request for later use
//             next();
//         });
//     } catch (err) {
//         return res.status(500).send('Error fetching Google public keys');
//     }

// }

const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '614150455222-l4risfrj93cq394rp70bhj8vd1nih38j.apps.googleusercontent.com'; // Replace with your Google OAuth client ID
const client = new OAuth2Client(CLIENT_ID);

async function verifyIdToken(req, res, next) {
    const authHeader = req.get('Authorization'); // Get the Authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('No or invalid Authorization header');
    }

    const idToken = authHeader.replace('Bearer ', ''); // Remove "Bearer" prefix

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID, // The audience should match your client ID
        });

        const payload = ticket.getPayload();
        req.user = payload; // You can store user information in the request for later use
        next();
    } catch (error) {
        console.error('Error verifying id_token:', error.message);
        return res.status(401).send('Invalid id_token');
    }
}


module.exports = {
    verifyIdToken
}
