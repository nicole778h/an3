// routes.ts
import express from 'express';
// @ts-ignore
import { register, login } from './controllers/authController';
// @ts-ignore
import { authenticate } from './middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// @ts-ignore
router.get('/protected', authenticate, (req: Request, res: Response) => {
    // @ts-ignore
    res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;
