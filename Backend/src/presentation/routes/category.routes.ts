import { Router } from 'express';
import { categoryController as categoryCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';

const router = Router();

// PUBLIC - paginated: ?page=1&limit=10
router.get('/', categoryCtrl.getCategories);

// ADMIN ONLY
router.post('/', authenticate, authorize([Role.ADMIN]), categoryCtrl.createCategory);
router.put('/:id', authenticate, authorize([Role.ADMIN]), categoryCtrl.updateCategory);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), categoryCtrl.deleteCategory);

export default router;
