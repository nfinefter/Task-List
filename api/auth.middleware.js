import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const region = "us-east-2"; 
const userPoolId = "us-east-2_tkQVHKiTL"; 
const clientId = "63uh95r2deoaclc4jnjp7h76k9"; 

const client = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Missing Authorization header");

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).send("Invalid or expired token");
      }

      // Optionally ensure token was issued for your app client
      if (clientId && decoded.aud !== clientId) {
        return res.status(403).send("Token was not issued for this app client");
      }

      // Attach user info (Cognito “sub” = user ID)
      req.user = decoded;
      next();
    }
  );
};
export default verifyToken;