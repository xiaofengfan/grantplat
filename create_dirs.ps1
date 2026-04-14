$dirs = @(
    "backend/app/api/v1/auth",
    "backend/app/api/v1/strategy",
    "backend/app/api/v1/data",
    "backend/app/api/v1/backtest",
    "backend/app/api/v1/sim",
    "backend/app/api/v1/live",
    "backend/app/api/v1/risk",
    "backend/app/core",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/services",
    "backend/app/tasks",
    "backend/tests",
    "frontend/src/components",
    "frontend/src/pages",
    "frontend/src/services",
    "frontend/src/stores",
    "frontend/src/hooks",
    "frontend/src/utils",
    "frontend/src/types",
    "frontend/public"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir"
    }
}

Write-Host "All directories created successfully!"
