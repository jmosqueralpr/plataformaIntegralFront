const fs = require('fs');
let c = fs.readFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', 'utf8');

// Fix ? artifacts
c = c.replace('justify-content: center;\n?\n  overflow: hidden;\n?\n  padding: clamp', 'justify-content: center;\n  overflow: hidden;\n  padding: clamp');

// Also fix any remaining . at end of property lines
c = c.replace(/([a-z-]+:\s*[^;]*?)\.\n/g, '$1;\n');

fs.writeFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', c, 'utf8');
console.log('Artifacts cleaned');