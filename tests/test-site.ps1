# DEVOPS ARENA - basic site tests
# Run from the project root:  .\tests\test-site.ps1

$root = Split-Path -Parent $PSScriptRoot
$failed = 0

function Pass($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red; $script:failed++ }

# ---------- TEST 1: required files exist and are not empty ----------
$requiredFiles = @(
    "index.html",
    "css/style.css",
    "css/game.css",
    "games/battle-royale.html",
    "games/retro-racer.html",
    "games/cyber-runner.html",
    "games/terminal-hack.html",
    "js/battle-royale.js",
    "js/retro-racer.js",
    "js/cyber-runner.js",
    "js/terminal-hack.js"
)

Write-Host "`nTEST 1: required files exist and are not empty"
foreach ($f in $requiredFiles) {
    $path = Join-Path $root $f
    if (-not (Test-Path $path)) {
        Fail "$f is missing"
    } elseif ((Get-Item $path).Length -eq 0) {
        Fail "$f is empty"
    } else {
        Pass "$f"
    }
}

# ---------- TEST 2: important elements in index.html ----------
Write-Host "`nTEST 2: index.html content"
$html = Get-Content (Join-Path $root "index.html") -Raw

function Check-Html($pattern, $description) {
    if ($html -match $pattern) { Pass $description } else { Fail $description }
}

Check-Html "<title>DEVOPS ARENA</title>" "page title is DEVOPS ARENA"
Check-Html "<nav>" "navigation bar exists"
Check-Html 'id="games"' "games section exists"
Check-Html 'id="pipeline"' "pipeline section exists"
Check-Html 'href="css/style.css"' "stylesheet is linked"

$cardCount = ([regex]::Matches($html, '<article class="game-card">')).Count
if ($cardCount -eq 4) { Pass "4 game cards found" } else { Fail "expected 4 game cards, found $cardCount" }

$playLinks = ([regex]::Matches($html, 'href="games/[a-z-]+\.html"')).Count
if ($playLinks -eq 4) { Pass "4 Play links found" } else { Fail "expected 4 Play links, found $playLinks" }

# ---------- TEST 3: article tags are balanced ----------
Write-Host "`nTEST 3: HTML tags are balanced"
$open = ([regex]::Matches($html, '<article')).Count
$close = ([regex]::Matches($html, '</article>')).Count
if ($open -eq $close) { Pass "article tags balanced ($open open, $close close)" } else { Fail "article tags NOT balanced ($open open, $close close)" }

# ---------- RESULT ----------
Write-Host ""
if ($failed -eq 0) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$failed TEST(S) FAILED" -ForegroundColor Red
    exit 1
}