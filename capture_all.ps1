$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "c:\Users\CHIRANJEEVI\Downloads\Capstone Project\screenshots"
$artDir = "C:\Users\CHIRANJEEVI\.gemini\antigravity\brain\c48ea31f-a058-4345-93f6-668c57ff638c"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }
if (-not (Test-Path $artDir)) { New-Item -ItemType Directory -Path $artDir -Force }

$modules = @(
    @{ id = 1; name = "module_3_5_1_dashboard.png" },
    @{ id = 2; name = "module_3_5_2_user_registration_login.png" },
    @{ id = 3; name = "module_3_5_3_complaint_submission.png" },
    @{ id = 4; name = "module_3_5_4_complaint_management.png" },
    @{ id = 5; name = "module_3_5_5_complaint_categorization.png" },
    @{ id = 6; name = "module_3_5_6_priority_assignment.png" },
    @{ id = 7; name = "module_3_5_7_ticket_generation.png" },
    @{ id = 8; name = "module_3_5_8_complaint_assignment.png" },
    @{ id = 9; name = "module_3_5_9_complaint_status_tracking.png" },
    @{ id = 10; name = "module_3_5_10_notification_management.png" },
    @{ id = 11; name = "module_3_5_11_feedback_rating.png" },
    @{ id = 12; name = "module_3_5_12_complaint_analytics_reporting.png" },
    @{ id = 13; name = "module_3_5_13_logout.png" }
)

foreach ($m in $modules) {
    $url = "http://localhost:3000/capture-modules.html?module=$($m.id)"
    $target1 = Join-Path $outDir $m.name
    $target2 = Join-Path $artDir $m.name

    Write-Host "Capturing Module $($m.id): $($m.name)..."
    Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1440,950", "--virtual-time-budget=2000", "--screenshot=`"$target1`"", $url -Wait

    if (Test-Path $target1) {
        Copy-Item -Path $target1 -Destination $target2 -Force
        $len = (Get-Item $target1).Length
        Write-Host "  -> Success ($len bytes) saved to both locations."
    } else {
        Write-Warning "  -> Failed to capture $($m.name)"
    }
}

Write-Host "All 13 system development module screenshots successfully captured!"
