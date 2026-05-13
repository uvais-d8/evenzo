import { Router } from 'express';
import { categoryController as categoryCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';
import { upload } from '../middleware/multer';
import { validateRequest } from '../middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../../application/utils/validation';

const router = Router();

// PUBLIC - paginated: ?page=1&limit=10
router.get('/', categoryCtrl.getCategories);

// ADMIN ONLY
router.post('/', authenticate, authorize([Role.ADMIN]), upload.single('image'), validateRequest(createCategorySchema), categoryCtrl.createCategory);
router.put('/:id', authenticate, authorize([Role.ADMIN]), upload.single('image'), validateRequest(updateCategorySchema), categoryCtrl.updateCategory);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), categoryCtrl.deleteCategory);

export default router;

