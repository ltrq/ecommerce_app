// app/utils/zodValidation.ts
import { z } from 'zod';

// Base schema for email/password validation
// app/utils/zodValidation.ts
export const authSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = authSchema
  .extend({
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type AuthForm = z.infer<typeof authSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
