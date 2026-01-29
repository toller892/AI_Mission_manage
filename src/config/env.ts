import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
