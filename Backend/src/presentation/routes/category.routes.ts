import { Router } from 'express';
import { container } from '../../di/container';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/Role.enum';

const router = Router();
const categoryCtrl = container.categoryController;

// PUBLIC - paginated: ?page=1&limit=10
router.get('/', categoryCtrl.getCategories);

// ADMIN ONLY
router.post('/', authenticate, authorize([Role.ADMIN]), categoryCtrl.createCategory);
router.put('/:id', authenticate, authorize([Role.ADMIN]), categoryCtrl.updateCategory);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), categoryCtrl.deleteCategory);

export default router;
