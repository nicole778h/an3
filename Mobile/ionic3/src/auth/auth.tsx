import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = jwt.verify(token, 'your-secret-key') as JwtPayload;
        // @ts-ignore
        req.user = user; // Salvează informațiile utilizatorului în request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};
