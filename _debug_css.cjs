const fs = require('fs');
const css = fs.readFileSync('packages/ui/dist/globals.css', 'utf-8');

// Find the before\:content selectors
const regex = /\.before\\:content-\\\[[^\]]*\\\]/g;
let m;
while ((m = regex.exec(css)) !== null) {
  const selector = m[0];
  // Show raw chars
  console.log('Raw selector:', selector);
  console.log('Char codes:', [...selector].map(c => c.charCodeAt(0)));
  console.log('---');
}

// Also check what class names CVA would produce
const cvaPlus = 'before:content-[\'+\']';
const cvaMinus = 'before:content-[\'-\']';
console.log('CVA + class:', cvaPlus, '→ codes:', [...cvaPlus].map(c => c.charCodeAt(0)));
console.log('CVA - class:', cvaMinus, '→ codes:', [...cvaMinus].map(c => c.charCodeAt(0)));
