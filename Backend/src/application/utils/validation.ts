import { z } from 'zod';


export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().optional(), // Using string because it might come as string from req.body
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
    idProof: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    role: z.string().optional(),
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export const emailSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createServiceSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
    categoryId: z.string().min(1, "Category is required"),
    events: z.preprocess((val) => {
        if (typeof val === 'string' && val.trim().startsWith('[')) {
            try { return JSON.parse(val); } catch { return [val]; }
        } else if (typeof val === 'string' && val.trim().length > 0) {
            return [val];
        }
        return val;
    }, z.array(z.string())).optional(),
    image: z.string().optional(),
});


export const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    category: z.string().min(1, "Category is required"),
    date: z.preprocess((val) => new Date(val as string), z.date().refine(d => d > new Date(), "Event date must be in the future")),
    address: z.string().min(5, "Address must be at least 5 characters"),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
    isTicketed: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(true)),
    locationName: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    mainGuests: z.string().optional(),
    time: z.string().optional(),
    venue: z.string().optional(),
    contact: z.string().optional(),
    ticketDetails: z.string().optional(),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional(),
});

export const updateVendorSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
    address: z.string().min(5).optional(),
    profession: z.string().optional(),
    description: z.string().min(10).optional(),
    eventHistory: z.string().optional(),
    idProof: z.string().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
    address: z.string().min(5).optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export const createBookingSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
    ticketCount: z.number().min(1, "At least one ticket is required"),
    amount: z.number().min(0),
});

export const createCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    image: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const verifyVendorSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    reason: z.string().optional(),
});

// Infer types from schemas to use as DTOs
export const updateServiceSchema = createServiceSchema.partial();

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>;
export type EmailDTO = z.infer<typeof emailSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type CreateServiceDTO = z.infer<typeof createServiceSchema>;
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;
export type EventDTO = z.infer<typeof eventSchema>;
export type UpdateVendorDTO = z.infer<typeof updateVendorSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type VerifyVendorDTO = z.infer<typeof verifyVendorSchema>;






