import { Request, Response, NextFunction } from 'express';
import { ICategoryService, CreateCategoryData, UpdateCategoryData } from '../../application/interfaces/ICategoryService';
import { Messages } from '../../application/constants/Messages';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}

export class CategoryController {
    constructor(private readonly categoryService: ICategoryService) {
        this.createCategory = this.createCategory.bind(this);
        this.getCategories = this.getCategories.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, description, image } = req.body as CreateCategoryData;
            const category = await this.categoryService.createCategory({ name, description, image });
            res.status(201).json({ message: Messages.CATEGORY_CREATED, category });
        } catch (err) { next(err); }
    }

    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.categoryService.getCategories(parsePagination(req.query));
            res.json(result);
        } catch (err) { next(err); }
    }

    async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            const { name, description, image } = req.body as UpdateCategoryData;
            const category = await this.categoryService.updateCategory(id, { name, description, image });
            res.json({ message: Messages.CATEGORY_UPDATED, category });
        } catch (err) { next(err); }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            await this.categoryService.deleteCategory(id);
            res.json({ message: Messages.CATEGORY_DELETED });
        } catch (err) { next(err); }
    }
}
