# =============================================================================
# VDBUS LOGISTICS PLATFORM - STOP ALL SERVICES SCRIPT
# Tat toan bo cac tien trinh tren cac cong 5000, 3000, 3001, 3002 va background services
# =============================================================================

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host " [VDBUS TMS] DANG TAT TOAN BO CAC TIEN TRINH HE THONG..." -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

$ports = @(5000, 3000, 3001, 3002)

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($procId in $pids) {
                if ($procId -gt 0) {
                    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($proc) {
                        Write-Host "[DUNG] Da dung tien trinh $($proc.ProcessName) (PID: $procId) tren port $port." -ForegroundColor Yellow
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    }
                }
            }
        } else {
            Write-Host "[INFO] Port $port dang trong, khong co tien trinh nao chay." -ForegroundColor DarkGray
        }
    } catch {
        # ignore lookup errors
    }
}

# Ket thuc bat ky tien trinh VDBus.Api nao con sot
$apiProcs = Get-Process -Name "VDBus.Api" -ErrorAction SilentlyContinue
if ($apiProcs) {
    foreach ($p in $apiProcs) {
        Write-Host "[DUNG] Dung tien trinh VDBus.Api (PID: $($p.Id))." -ForegroundColor Yellow
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host " [THANH CONG] DA TAT TOAN BO CAC DICH VU HE THONG VDBUS TMS!" -ForegroundColor Green
Write-Host "=============================================================================" -ForegroundColor Cyan
