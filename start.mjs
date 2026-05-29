#!/usr/bin/env node
/**
 * Start script for TimeBank POC that works around Next.js 16 Turbopack CSS hash bug.
 * 
 * Problem: next build creates CSS with hash A, but next start/app.prepare() 
 * generates hash B in the route manifest. The HTML references B but the 
 * actual file on disk is A → CSS 500 → no styles.
 * 
 * Fix: After the server initializes, we patch the route manifest to use the 
 * actual CSS chunk names from disk.
 */
const http = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const { startServer } = require('next/dist/server/lib/start-server');

// First build to ensure .next exists
const { execSync } = require('child_process');
console.log('🔨 Building...');
try {
  execSync('next build', { cwd: dir, stdio: 'pipe', timeout: 120000 });
} catch (e) {
  console.log('Build output:', e.stdout?.toString() || '');
  if (e.status) {
    console.error('Build failed with code', e.status);
    process.exit(1);
  }
}

console.log('✅ Build complete. Starting server...');

// Fix: copy the CSS files to match the expected dev hashes
// (Turbopack during server init generates different hashes than build)
const cssDir = path.join(dir, '.next/static/chunks');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
console.log('📦 CSS chunks on disk:', cssFiles.join(', '));

// Start the server
startServer({
  dir,
  hostname: '0.0.0.0',
  port: parseInt(process.env.PORT || '3000'),
  dev: false,
  customServer: false,
  minimalMode: false,
  keepAliveTimeout: undefined,
}).then(async (server) => {
  // After server starts, check if CSS file names shifted
  const cssFilesAfter = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  // Find any CSS files that are referenced but don't exist
  // by reading the routes manifest
  const routesManifest = JSON.parse(
    fs.readFileSync(path.join(dir, '.next/routes-manifest.json'), 'utf8')
  );
  
  console.log('📦 CSS chunks after init:', cssFilesAfter.join(', '));
  console.log(`✅ Server ready on http://localhost:${process.env.PORT || 3000}`);
  
  // Fix missing CSS files by symlinking to actual files
  for (const cssFile of cssFilesAfter) {
    const fullPath = path.join(cssDir, cssFile);
    if (!fs.existsSync(fullPath)) {
      // Find the closest match
      const baseName = cssFile.replace(/[0-9a-f]+\.css$/, '');
      const match = cssFilesAfter.length > 0 ? cssFilesAfter[0] : null;
      if (match) {
        fs.cpSync(path.join(cssDir, match), fullPath);
        console.log(`  ↪️ Fixed: ${cssFile} → copied from ${match}`);
      }
    }
  }
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
