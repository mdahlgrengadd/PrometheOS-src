# Update import paths in desktop-3d module files

Write-Host "Updating import paths in desktop-3d module..." -ForegroundColor Green

$files = Get-ChildItem -Path "src/desktop-3d/components/*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Update relative imports to work within the module
    $content = $content -replace "from '../data/iconData'", "from '../data/iconData'"
    $content = $content -replace "from '../data/periodicTableData'", "from '../data/periodicTableData'"
    $content = $content -replace "from '../stores/windowStore'", "from '../stores/windowStore'"
    $content = $content -replace "from '../types/Window'", "from '../types/Window'"
    
    # Save the updated content
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated imports in: $($file.Name)" -ForegroundColor Cyan
}

Write-Host "Import paths updated successfully!" -ForegroundColor Green 