const fs = require('fs');
const path = require('path');

// Paths
const sourceBase = path.join(__dirname, '../../../_landing_page_option/CGMWTJULY2025/Source Code/juno-watts/public');
const targetBase = path.join(__dirname, '../public');

// Directories to copy
const directories = [
  { source: 'symbols', target: 'symbols' },
  { source: 'spotlight-images', target: 'spotlight-images' },
  { source: 'global', target: 'global' }
];

// Function to copy directory recursively
function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(`✓ Created directory: ${target}`);
  }

  // Read source directory
  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Copied: ${file}`);
    }
  });
}

// Main execution
console.log('🚀 Starting asset copy process...\n');

directories.forEach(({ source, target }) => {
  const sourcePath = path.join(sourceBase, source);
  const targetPath = path.join(targetBase, target);

  console.log(`\n📁 Copying ${source}...`);
  
  if (fs.existsSync(sourcePath)) {
    try {
      copyDirectory(sourcePath, targetPath);
      console.log(`✅ Successfully copied ${source}`);
    } catch (error) {
      console.error(`❌ Error copying ${source}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Source directory not found: ${sourcePath}`);
  }
});

console.log('\n✨ Asset copy process completed!\n');

