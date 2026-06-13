/**
 * Creates the first owner account in admin_users.
 * Usage: tsx scripts/seed-admin.ts <username> <password> <name>
 * Example: tsx scripts/seed-admin.ts sasa mypassword "Sasanka"
 *
 * Run this AFTER applying db/admin-migration.sql to your Neon database.
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
// Note: run with DATABASE_URL set in your environment, or add dotenv manually.
// e.g.: DATABASE_URL=... tsx scripts/seed-admin.ts sasa mypassword "Sasanka"

const [,, username, password, name] = process.argv;

if (!username || !password || !name) {
  console.error('Usage: tsx scripts/seed-admin.ts <username> <password> <name>');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);

const hash = await bcrypt.hash(password, 12);

await sql`
  INSERT INTO admin_users (name, username, password_hash, role)
  VALUES (${name}, ${username}, ${hash}, 'owner')
  ON CONFLICT (username) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = 'owner'
`;

console.log(`✓ Admin user "${username}" (owner) created.`);
