/**
 * 0711-I JWT Authentication Middleware
 * Validates RS256 JWTs against the 0711-I JWKS endpoint.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const O711I_JWKS_URL = process.env.O711I_JWKS_URL || "http://localhost:10300/.well-known/jwks.json";
const O711I_ISSUER = process.env.O711I_ISSUER || "https://id.0711.io";
const O711I_AUDIENCE = process.env.O711I_AUDIENCE || "0711-platform";

const client = jwksClient({
  jwksUri: O711I_JWKS_URL,
  cache: true,
  cacheMaxAge: 600000, // 10 min
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key?.getPublicKey());
  });
}

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    org_id?: string;
    scope?: string;
  };
  isAdmin?: boolean;
  config?: any;
}

/**
 * Require valid JWT on all API routes.
 * Health endpoint and static files are excluded.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Skip auth for health check
  if (req.path === "/api/health") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: O711I_ISSUER,
      audience: O711I_AUDIENCE,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const payload = decoded as jwt.JwtPayload;
      req.user = {
        sub: payload.sub || "",
        email: payload.email || "",
        org_id: payload.org_id,
        scope: payload.scope,
      };

      // Admin check based on app role (not path)
      req.isAdmin = req.path.startsWith("/api/admin") || payload.scope?.includes("admin");

      next();
    }
  );
}
