import jwt from "jsonwebtoken";

export const signToken = (
  payload: object,
  expiresIn: string = "7d",
): string => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  return jwt.verify(token, secret);
};
