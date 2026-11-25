const fs = require('fs');
const path = 'd:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\components\\ExpirationCard.jsx';
let c = fs.readFileSync(path, 'utf8');

const marker = '      <div className="expiration-meta">\n        <div className="expiration-meta-item">';
if (c.includes(marker)) {
  c = c.replace(marker, '      <div className="expiration-meta">\n        {compactMode ? (\n          <>\n            <div className="expiration-meta-item">');
  fs.writeFileSync(path, c, 'utf8');
  console.log('Part 1 done: opening tag wrapped');
} else {
  console.log('Marker not found');
}