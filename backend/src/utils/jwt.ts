import jwt from "jsonwebtoken";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export const signToken = (
  payload: object,
  expiresIn: string = "7d",
): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};
