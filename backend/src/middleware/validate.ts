import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstErrorMessage = error.issues[0]?.message || 'Kiritilgan ma\'lumotlar noto\'g\'ri';
        return res.status(400).json({
          success: false,
          data: null,
          error: firstErrorMessage,
          details: error.issues
        });
      }
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Validatsiya xatoligi'
      });
    }
  };
};

export const loginSchema = z.object({
  body: z.object({
    pinCode: z.string({ message: 'PIN-kod kiritilishi shart' }).min(4, 'PIN-kod kamida 4 honali bo\'lishi kerak')
  })
});

export const createOrderSchema = z.object({
  body: z.object({
    cashierId: z.string().optional(),
    shiftId: z.string().optional(),
    paymentType: z.enum(['CASH', 'CARD', 'TRANSFER', 'SPLIT']).default('CASH'),
    items: z.array(
      z.object({
        productId: z.string({ message: 'Mahsulot ID kiritilishi shart' }),
        quantity: z.number().min(1, 'Miqdor kamida 1 bo\'lishi kerak'),
        unitPrice: z.number().optional(),
        totalPrice: z.number().optional(),
        ingredientDeductions: z.array(
          z.object({
            ingredientId: z.string(),
            quantity: z.number()
          })
        ).optional()
      })
    ).min(1, 'Buyurtma savatchasi bo\'sh bo\'lishi mumkin emas')
  })
});

export const openShiftSchema = z.object({
  body: z.object({
    cashierId: z.string({ message: 'Kassir ID kiritilishi shart' }),
    startCash: z.number().min(0, 'Boshlang\'ich naqd pul noldan kichik bo\'lishi mumkin emas')
  })
});

export const closeShiftSchema = z.object({
  body: z.object({
    shiftId: z.string({ message: 'Smena ID kiritilishi shart' }),
    actualCash: z.number().min(0, 'Sanab topshirilgan naqd pul noto\'g\'ri'),
    actualCard: z.number().min(0, 'Sanab topshirilgan terminal summasi noto\'g\'ri').optional()
  })
});
