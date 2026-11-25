const fs = require('fs');
let c = fs.readFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', 'utf8');

// Add missing styles to 480px media query
const oldEnd = `  .telegram-qr-card {
    padding: var(--space-5) var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce)`;

const newEnd = `  .telegram-qr-card {
    padding: var(--space-5) var(--space-4);
  }

  .telegram-steps {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .telegram-steps li {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-3);
  }

  .telegram-steps h3 {
    font-size: var(--text-sm);
  }

  .telegram-capabilities {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    padding: 0;
  }

  .telegram-capability {
    padding: var(--space-3);
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .telegram-capability > svg {
    margin-top: 0;
    margin-bottom: var(--space-2);
    font-size: var(--text-xl);
  }
}

@media (prefers-reduced-motion: reduce)`;

c = c.replace(oldEnd, newEnd);

fs.writeFileSync('d:\\IT\\Proyectos\\plataformaIntegral\\Front\\src\\styles\\telegramAssistant.css', c, 'utf8');
console.log('480px missing styles added');