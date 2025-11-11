const fs = require('fs');
const path = require('path');

console.log('\n🎉 Juno Landing Component Setup\n');
console.log('================================\n');

// Check if symbols exist
const symbolsDir = path.join(__dirname, '../public/symbols');
const symbolFiles = ['s1-dark.svg', 's1-light.svg', 's2-light.svg', 's3-dark.svg', 's3-light.svg'];
const symbolsExist = symbolFiles.every(file => 
  fs.existsSync(path.join(symbolsDir, file))
);

console.log('✅ Symbols:', symbolsExist ? 'Ready' : '❌ Missing');

// Check if spotlight mask exists
const maskPath = path.join(__dirname, '../public/global/spotlight-mask.svg');
const maskExists = fs.existsSync(maskPath);
console.log('✅ Spotlight Mask:', maskExists ? 'Ready' : '❌ Missing');

// Check if spotlight images directory exists
const spotlightDir = path.join(__dirname, '../public/spotlight-images');
const spotlightDirExists = fs.existsSync(spotlightDir);
console.log('✅ Spotlight Images Directory:', spotlightDirExists ? 'Ready' : '❌ Missing');

// Check component files
const componentPath = path.join(__dirname, '../src/components/JunoLanding/JunoLanding.jsx');
const cssPath = path.join(__dirname, '../src/components/JunoLanding/JunoLanding.css');
const componentExists = fs.existsSync(componentPath);
const cssExists = fs.existsSync(cssPath);

console.log('✅ Component:', componentExists ? 'Ready' : '❌ Missing');
console.log('✅ CSS:', cssExists ? 'Ready' : '❌ Missing');

// Check demo page
const demoPath = path.join(__dirname, '../src/app/juno-demo/page.jsx');
const demoExists = fs.existsSync(demoPath);
console.log('✅ Demo Page:', demoExists ? 'Ready' : '❌ Missing');

console.log('\n================================\n');

if (symbolsExist && maskExists && componentExists && cssExists && demoExists) {
  console.log('🎉 Setup Complete! Everything is ready!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/juno-demo');
  console.log('3. (Optional) Add spotlight images to public/spotlight-images/\n');
  console.log('📚 Read CONVERSION_COMPLETE.md for full details\n');
} else {
  console.log('⚠️  Some files are missing. Please check the setup.\n');
  console.log('Run these commands to fix:');
  if (!symbolsExist) {
    console.log('  node scripts/create-placeholder-symbols.js');
  }
  console.log('\n📚 See JUNO_LANDING_SETUP.md for help\n');
}

