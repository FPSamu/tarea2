import { json, Router } from "express"
import chatRoutes from './chat/routes'


const router = Router();

router.use(json());
router.use('/chat', chatRoutes);



export default router;