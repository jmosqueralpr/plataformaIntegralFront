$content = Get-Content 'd:\IT\Proyectos\plataformaIntegral\Front\src\styles\telegramAssistant.css' -Raw

# Replace the 760px media query block
$old760 = '@media (max-width: 760px) {
  .telegram-hero-copy {
    max-width: 100%;
  }

  .telegram-hero-mark {
    display: none;
  }

  .telegram-setup-grid {
    grid-template-columns: 1fr;
  }

  .telegram-qr-card {
    padding: var(--space-6);
  }

  .telegram-steps {
    grid-template-columns: 1fr;
  }

  .telegram-capabilities {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  .telegram-capability {
    padding: var(--space-2) var(--space-1);
  }
}'

$new760 = '@media (max-width: 760px) {
  .telegram-hero-copy {
    max-width: 100%;
    text-align: center;
  }

  .telegram-hero-mark {
    display: none;
  }

  .telegram-setup-grid {
    grid-template-columns: 1fr;
  }

  .telegram-qr-card {
    padding: var(--space-5) var(--space-4);
  }

  .telegram-steps {
    grid-template-columns: 1fr;
  }

  .telegram-capabilities {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .telegram-capability {
    padding: var(--space-4);
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .telegram-capability > svg {
    margin-top: 0;
    margin-bottom: var(--space-2);
  }
}'

# Replace the 480px media query block
$old480 = '@media (max-width: 480px) {
  .telegram-page {
    padding: var(--space-4) var(--space-3) var(--space-7);
  }

  .telegram-layout {
    gap: var(--space-3);
  }

  .telegram-hero {
    min-height: auto;
    padding: var(--space-6) var(--space-5);
    border-radius: var(--radius-2xl);
  }

  .telegram-hero-copy > p {
    max-width: 95%;
    font-size: var(--text-md);
  }

  .telegram-hero-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-5);
  }

  .telegram-open-button {
    width: 100%;
  }

  .telegram-card,
  .telegram-steps-card {
    border-radius: var(--radius-xl);
  }

  .telegram-link-card,
  .telegram-steps-card {
    padding: var(--space-5) var(--space-4);
  }

  .telegram-card-description {
    margin: var(--space-4) 0;
  }

  .telegram-code-panel {
    padding: var(--space-3);
  }
}'

$new480 = '@media (max-width: 480px) {
  .telegram-page {
    padding: var(--space-4) var(--space-3) var(--space-7);
  }

  .telegram-layout {
    gap: var(--space-4);
  }

  .telegram-hero {
    min-height: auto;
    padding: var(--space-6) var(--space-5);
    border-radius: var(--radius-2xl);
    text-align: center;
  }

  .telegram-hero-copy {
    max-width: 100%;
    text-align: center;
  }

  .telegram-hero-copy > p {
    max-width: 100%;
    font-size: var(--text-sm);
  }

  .telegram-hero-actions {
    align-items: center;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-5);
    justify-content: center;
  }

  .telegram-open-button {
    width: 100%;
    justify-content: center;
  }

  .telegram-bot-handle {
    display: block;
    text-align: center;
    margin-top: var(--space-2);
    font-size: var(--text-sm);
  }

  .telegram-hero-mark {
    display: none;
  }

  .telegram-card,
  .telegram-steps-card {
    border-radius: var(--radius-xl);
  }

  .telegram-link-card,
  .telegram-steps-card {
    padding: var(--space-5) var(--space-4);
  }

  .telegram-card-description {
    margin: var(--space-4) 0;
  }

  .telegram-code-panel {
    padding: var(--space-3);
  }

  .telegram-qr-card {
    padding: var(--space-5) var(--space-4);
  }

  .telegram-qr-link img {
    width: min(100%, 180px);
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
}'

$content = $content -replace [regex]::Escape($old760), $new760
$content = $content -replace [regex]::Escape($old480), $new480

Set-Content 'd:\IT\Proyectos\plataformaIntegral\Front\src\styles\telegramAssistant.css' -Encoding UTF8 -Value $content
Write-Host 'Responsive layout fixed'