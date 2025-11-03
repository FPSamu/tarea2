import { Router } from 'express';
import { renderChat } from './controller';

const router = Router();

router.get('', renderChat);

export default router;