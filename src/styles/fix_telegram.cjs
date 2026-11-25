const fs = require('fs');
let c = fs.readFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', 'utf8');

// 760px media query - hero-copy text-align
c = c.replace('  .telegram-hero-copy {\\n    max-width: 100%;\\n  }', '  .telegram-hero-copy {\\n    max-width: 100%;\\n    text-align: center;\\n  }');

// 760px - qr-card padding
c = c.replace('  .telegram-qr-card {\\n    padding: var(--space-6);\\n  }', '  .telegram-qr-card {\\n    padding: var(--space-5) var(--space-4);\\n  }');

// 760px - capabilities gap
c = c.replace('    gap: var(--space-1);\\n  }\\n\\n  .telegram-capability {', '    gap: var(--space-3);\\n  }\\n\\n  .telegram-capability {');

// 760px - capability padding + flex column
c = c.replace('  .telegram-capability {\\n    padding: var(--space-2) var(--space-1);\\n  }', '  .telegram-capability {\\n    padding: var(--space-4);\\n    flex-direction: column;\\n    align-items: center;\\n    text-align: center;\\n  }\\n\\n  .telegram-capability > svg {\\n    margin-top: 0;\\n    margin-bottom: var(--space-2);\\n  }');

// 480px - layout gap
c = c.replace('  .telegram-layout {\\n    gap: var(--space-3);\\n  }', '  .telegram-layout {\\n    gap: var(--space-4);\\n  }');

// 480px - hero text-align
c = c.replace('    border-radius: var(--radius-2xl);\\n  }', '    border-radius: var(--radius-2xl);\\n    text-align: center;\\n  }');

// 480px - hero-copy text-align
c = c.replace('  .telegram-hero-copy {\\n    max-width: 100%;\\n  }', '  .telegram-hero-copy {\\n    max-width: 100%;\\n    text-align: center;\\n  }');

// 480px - hero-copy p font-size
c = c.replace('    max-width: 95%;\\n    font-size: var(--text-md);\\n  }', '    max-width: 100%;\\n    font-size: var(--text-sm);\\n  }');

// 480px - hero-actions justify-content
c = c.replace('    gap: var(--space-2);\\n    margin-top: var(--space-5);\\n  }', '    gap: var(--space-3);\\n    margin-top: var(--space-5);\\n    justify-content: center;\\n  }');

// 480px - open-button justify-content
c = c.replace('    width: 100%;\\n  }', '    width: 100%;\\n    justify-content: center;\\n  }');

// 480px - bot-handle
c = c.replace('  .telegram-card,\\n  .telegram-steps-card {', '  .telegram-bot-handle {\\n    display: block;\\n    text-align: center;\\n    margin-top: var(--space-2);\\n    font-size: var(--text-sm);\\n  }\\n\\n  .telegram-card,\\n  .telegram-steps-card {');

// 480px - qr-card padding
c = c.replace('  .telegram-code-panel {\\n    padding: var(--space-3);\\n  }', '  .telegram-code-panel {\\n    padding: var(--space-3);\\n  }\\n\\n  .telegram-qr-card {\\n    padding: var(--space-5) var(--space-4);\\n  }');

// 480px - qr image width
c = c.replace('  .telegram-qr-card {', '  .telegram-qr-link img {\\n    width: min(100%, 180px);\\n  }\\n\\n  .telegram-qr-card {');

// 480px - steps h3 font-size
c = c.replace('    padding: var(--space-3);\\n  }\\n\\n  .telegram-capabilities {', '    padding: var(--space-3);\\n  }\\n\\n  .telegram-steps h3 {\\n    font-size: var(--text-sm);\\n  }\\n\\n  .telegram-capabilities {');

// 480px - capability padding + flex column + svg
c = c.replace('  .telegram-capability {\\n    padding: var(--space-3);\\n  }', '  .telegram-capability {\\n    padding: var(--space-3);\\n    flex-direction: column;\\n    align-items: center;\\n    text-align: center;\\n  }\\n\\n  .telegram-capability > svg {\\n    margin-top: 0;\\n    margin-bottom: var(--space-2);\\n    font-size: var(--text-xl);\\n  }');

fs.writeFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', c, 'utf8');
console.log('All responsive changes applied');