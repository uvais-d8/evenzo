import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    category: z.string().min(1, "Category is required"),
    date: z.date().refine(d => d > new Date(), "Event date must be in the future"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    price: z.number().min(0, "Price cannot be negative"),
    isTicketed: z.boolean().default(true),
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
