# create-favicons.ps1
# Create all favicon files for Mei Press Group

$projectRoot = "C:\Projects\meipress-group"
$assetsPath = "$projectRoot\assets\images"

# Create assets/images folder if it doesn't exist
New-Item -ItemType Directory -Force -Path $assetsPath | Out-Null

Write-Host "📁 Creating favicon files in: $assetsPath" -ForegroundColor Cyan

# ============================================
# Create SVG Favicon (Modern browsers)
# ============================================
$svgFavicon = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00b4d8;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="100" height="100" rx="20" ry="20" fill="url(#grad)"/>
    <text x="50" y="68" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">M</text>
    <circle cx="85" cy="15" r="8" fill="#00b4d8"/>
    <circle cx="15" cy="85" r="8" fill="#1a1a2e"/>
</svg>
'@

$svgFavicon | Out-File -FilePath "$assetsPath\favicon.svg" -Encoding UTF8
Write-Host "✅ Created: favicon.svg" -ForegroundColor Green

# ============================================
# Create manifest.json
# ============================================
$manifest = @'
{
    "name": "Mei Press Group",
    "short_name": "Mei Press",
    "description": "Build Your Future With Us - Premier recruitment and training organization",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a2e",
    "theme_color": "#1a1a2e",
    "icons": [
        {
            "src": "assets/images/android-icon-36x36.png",
            "sizes": "36x36",
            "type": "image/png",
            "density": "0.75"
        },
        {
            "src": "assets/images/android-icon-48x48.png",
            "sizes": "48x48",
            "type": "image/png",
            "density": "1.0"
        },
        {
            "src": "assets/images/android-icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "density": "1.5"
        },
        {
            "src": "assets/images/android-icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "density": "2.0"
        },
        {
            "src": "assets/images/android-icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "density": "3.0"
        },
        {
            "src": "assets/images/android-icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "density": "4.0"
        }
    ]
}
'@

$manifest | Out-File -FilePath "$assetsPath\manifest.json" -Encoding UTF8
Write-Host "✅ Created: manifest.json" -ForegroundColor Green

# ============================================
# Create browserconfig.xml (for Windows)
# ============================================
$browserConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="assets/images/ms-icon-70x70.png"/>
            <square150x150logo src="assets/images/ms-icon-150x150.png"/>
            <square310x310logo src="assets/images/ms-icon-310x310.png"/>
            <TileColor>#1a1a2e</TileColor>
        </tile>
    </msapplication>
</browserconfig>
'@

$browserConfig | Out-File -FilePath "$assetsPath\browserconfig.xml" -Encoding UTF8
Write-Host "✅ Created: browserconfig.xml" -ForegroundColor Green

# ============================================
# Create placeholder favicon.ico (Base64 encoded 16x16)
# ============================================
# This creates a simple favicon.ico file using a base64 encoded image
# For production, you should use actual image files

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Favicon files created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Location: $assetsPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Files Created:" -ForegroundColor Yellow
Write-Host "  ✓ favicon.svg"
Write-Host "  ✓ manifest.json"
Write-Host "  ✓ browserconfig.xml"
Write-Host ""
Write-Host "⚠️  IMPORTANT: For best results, you should:" -ForegroundColor Yellow
Write-Host "  1. Create actual PNG images for each size" -ForegroundColor White
Write-Host "  2. Generate favicon.ico from the SVG" -ForegroundColor White
Write-Host "  3. Use a tool like: https://realfavicongenerator.net/" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Recommended Tools:" -ForegroundColor Cyan
Write-Host "  - https://realfavicongenerator.net/ (Best)" -ForegroundColor White
Write-Host "  - https://favicon.io/ (Quick)" -ForegroundColor White
Write-Host "  - https://www.favicon-generator.org/ (Simple)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
