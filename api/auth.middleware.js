// auth.middleware.js
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";

let jwks;

export default async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send("Missing Authorization header");

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).send("Invalid token");

    // Load JWKs only once per cold start
    if (!jwks) {
      const userPoolId = "us-east-2_tkQVHKiTL";
      const jwksUrl = `https://cognito-idp.us-east-2.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
      const response = await fetch(jwksUrl);
      jwks = await response.json();
    }

    const key = jwks.keys.find(k => k.kid === decoded.header.kid);
    if (!key) return res.status(401).send("Invalid signing key");

    const pem = jwkToPem(key);
    const verified = jwt.verify(token, pem, { algorithms: ["RS256"] });

    req.user = verified; // attach user data to request
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).send("Unauthorized");
  }
}
