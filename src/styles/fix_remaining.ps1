$content = Get-Content 'd:\IT\Proyectos\plataformaIntegral\Front\src\styles\telegramAssistant.css' -Raw
$content = $content -replace 'display: grid\.', 'display: grid;'
$content = $content -replace 'padding: clamp\(var\(--space-5\), 3.5vw, var\(--space-8\))\.', 'padding: clamp(var(--space-5), 3.5vw, var(--space-8));'
Set-Content 'd:\IT\Proyectos\plataformaIntegral\Front\src\styles\telegramAssistant.css' -Encoding UTF8 -Value $content
Write-Host 'Remaining fixes complete'