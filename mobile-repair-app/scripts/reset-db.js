#!/usr/bin/env node
/**
 * Reset database script.
 * Drops and recreates all tables from schema.sql.
 *
 * Usage: node scripts/reset-db.js
 *
 * NOTE: This is a destructive operation. Only use in development.
 * In production, use Supabase Dashboard SQL Editor.
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.sql not found at:', schemaPath);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf-8');
console.log('📋 Schema loaded:', schema.split('\n').length, 'lines');
console.log('');
console.log('⚠️  To execute this schema:');
console.log('   1. Open Supabase Dashboard → SQL Editor');
console.log('   2. Paste the contents of supabase/schema.sql');
console.log('   3. Click "Run"');
console.log('');
console.log('   Or use the Supabase CLI:');
console.log('   supabase db reset');
