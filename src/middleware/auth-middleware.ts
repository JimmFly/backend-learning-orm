import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

function authMiddleware(
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
): void {
  const token = req.headers["authorization"];
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET not configured" });
    return;
  }
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (
      err: jwt.VerifyErrors | null,
      decoded: JwtPayload | string | undefined
    ) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }
      // Type guard to ensure decoded is a JwtPayload with id property
      if (decoded && typeof decoded === "object" && "id" in decoded) {
        req.userId = decoded.id as number;
        next();
      } else {
        res.status(403).json({ message: "Invalid token payload" });
      }
    }
  );
}

export default authMiddleware;
