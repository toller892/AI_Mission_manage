import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['DATABASE_URL'] as const;
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('='.repeat(50));
  console.error('ERROR: Missing required environment variables:');
  missingVars.forEach(v => console.error(`  - ${v}`));
  console.error('');
  console.error('Please set these in Zeabur dashboard:');
  console.error('  Project Settings > Environment Variables');
  console.error('='.repeat(50));
  process.exit(1);
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  nodeEnv: process.env.NODE_ENV || 'production',
};
