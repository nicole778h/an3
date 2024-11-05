// routes.ts
import express from 'express';
import { register, login } from './controllers/authController';
import { authenticate } from './middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/protected', authenticate, (req: Request, res: Response) => {
    res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;
