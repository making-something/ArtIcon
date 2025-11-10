import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  role: 'admin' | 'judge' | 'participant';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET is not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
      return;
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
        });
        return;
      }

      req.user = decoded as JwtPayload;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }
    next();
  });
};

export const authenticateJudge = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'judge') {
      res.status(403).json({
        success: false,
        message: 'Judge access required',
      });
      return;
    }
    next();
  });
};

export const authenticateParticipant = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'participant') {
      res.status(403).json({
        success: false,
        message: 'Participant access required',
      });
      return;
    }
    next();
  });
};

export const authenticateAdminOrJudge = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'judge') {
      res.status(403).json({
        success: false,
        message: 'Admin or Judge access required',
      });
      return;
    }
    next();
  });
};
