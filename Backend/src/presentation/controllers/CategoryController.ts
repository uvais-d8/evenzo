import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../infrastructure/di/tokens';
import { Request, Response, NextFunction } from 'express';

import { ICategoryService, CreateCategoryData, UpdateCategoryData } from '../../application/interfaces/ICategoryService';
import { Messages } from '../../application/constants/Messages';
import { ApiResponse } from '../utils/ApiResponse';
import { HttpStatus } from '../../domain/enums/HttpStatus';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePagination(query: Request['query']): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
    return { page, limit };
}


/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Category]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Category created successfully
 */
@injectable()
export class CategoryController {
    constructor(@inject(TOKENS.CategoryUseCase) private readonly _categoryService: ICategoryService) {
        this.createCategory = this.createCategory.bind(this);
        this.getCategories = this.getCategories.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body } as CreateCategoryData;
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const category = await this._categoryService.createCategory(data);
            ApiResponse.success(res, Messages.CATEGORY_CREATED, category, HttpStatus.CREATED);
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/categories:
     *   get:
     *     summary: Get all categories with pagination
     *     tags: [Category]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema: { type: integer, default: 1 }
     *       - in: query
     *         name: limit
     *         schema: { type: integer, default: 10 }
     *     responses:
     *       200:
     *         description: List of categories
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
     */
    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._categoryService.getCategories(parsePagination(req.query));
            ApiResponse.success(res, 'Categories fetched successfully', result.data, HttpStatus.OK, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err) { next(err); }
    }

    /**
     * @openapi
     * /api/categories/{id}:
     *   put:
     *     summary: Update a category (Admin only)
     *     tags: [Category]
     *     security: [{ BearerAuth: [] }]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name: { type: string }
     *               description: { type: string }
     *               image: { type: string, format: binary }
     *     responses:
     *       200:
     *         description: Category updated successfully
     */
    async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            const data = { ...req.body } as UpdateCategoryData;
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const category = await this._categoryService.updateCategory(id, data);
            ApiResponse.success(res, Messages.CATEGORY_UPDATED, category);
        } catch (err) { next(err); }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params['id']);
            await this._categoryService.deleteCategory(id);
            ApiResponse.success(res, Messages.CATEGORY_DELETED);
        } catch (err) { next(err); }
    }
}
