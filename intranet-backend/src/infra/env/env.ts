import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3001),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // Tightened in later phases: S3 (F7)
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('7d'),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().optional().default(true),
})

export type Env = z.infer<typeof envSchema>
