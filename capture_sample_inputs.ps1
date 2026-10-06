$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "c:\Users\CHIRANJEEVI\Downloads\Capstone Project\screenshots"
$artDir = "C:\Users\CHIRANJEEVI\.gemini\antigravity\brain\c48ea31f-a058-4345-93f6-668c57ff638c"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }
if (-not (Test-Path $artDir)) { New-Item -ItemType Directory -Path $artDir -Force }

$figs = @(
    @{ id = "D1"; name = "figure_d1_login_input.png" },
    @{ id = "D2"; name = "figure_d2_user_registration_input.png" },
    @{ id = "D3"; name = "figure_d3_complaint_submission_input.png" },
    @{ id = "D4"; name = "figure_d4_categorization_priority_input.png" },
    @{ id = "D5"; name = "figure_d5_complaint_assignment_input.png" },
    @{ id = "D6"; name = "figure_d6_feedback_input.png" }
)

foreach ($f in $figs) {
    $url = "http://localhost:3000/capture-sample-inputs.html?fig=$($f.id)"
    $target1 = Join-Path $outDir $f.name
    $target2 = Join-Path $artDir $f.name

    Write-Host "Capturing $($f.id): $($f.name)..."
    Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1440,950", "--virtual-time-budget=2000", "--screenshot=`"$target1`"", $url -Wait

    if (Test-Path $target1) {
        Copy-Item -Path $target1 -Destination $target2 -Force
        $len = (Get-Item $target1).Length
        Write-Host "  -> Success ($len bytes) saved."
    } else {
        Write-Warning "  -> Failed to capture $($f.name)"
    }
}

Write-Host "All Sample Input figures successfully generated!"
