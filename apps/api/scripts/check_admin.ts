import { Database } from '../src/modules/00-shared/infrastructure/database.js';

async function main() {
  const db = new Database(process.env.DATABASE_URL!);
  const u = await db.query('SELECT id, email, is_superadmin, status, two_factor_enabled FROM users WHERE email = $1', ['admin@bipesend.com.br']);
  console.log('ADMIN USER:', u);
  const allSuperadmins = await db.query('SELECT id, email, is_superadmin, status FROM users WHERE is_superadmin = true');
  console.log('ALL SUPERADMINS:', allSuperadmins);
  const recentTokens = await db.query('SELECT identifier, token, expires FROM verification_tokens ORDER BY expires DESC LIMIT 5');
  console.log('RECENT TOKENS:', recentTokens);
  process.exit(0);
}

main().catch(console.error);
