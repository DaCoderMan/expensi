import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const envLocalPath = path.join(root, '.env.local');
const envExamplePath = path.join(root, '.env.example');

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

function main() {
  if (!fs.existsSync(envExamplePath)) {
    console.error('No .env.example found – aborting.');
    process.exit(1);
  }

  if (fs.existsSync(envLocalPath)) {
    console.log('.env.local already exists. No changes made.');
    return;
  }

  const example = fs.readFileSync(envExamplePath, 'utf8').split('\n');

  const authSecret = generateSecret();
  const devPassword = generatePassword();

  const lines = example.map((line) => {
    if (line.startsWith('AUTH_SECRET=')) {
      return `AUTH_SECRET=${authSecret}`;
    }
    if (line.startsWith('DEV_PASSWORD=')) {
      return `DEV_PASSWORD=${devPassword}`;
    }
    // Keep other lines as-is (comments and keys with empty values)
    return line;
  });

  fs.mkdirSync(path.dirname(envLocalPath), { recursive: true });
  fs.writeFileSync(envLocalPath, lines.join('\n'));

  console.log('Created .env.local with:');
  console.log('- Random AUTH_SECRET');
  console.log('- Random DEV_PASSWORD');
  console.log('- Other keys copied from .env.example');
  console.log('');
  console.log('Next steps:');
  console.log('  Add OAuth credentials to .env.local (see ENV_GUIDE.md)');
}

main();

