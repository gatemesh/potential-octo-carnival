# setup-chocolatey.ps1

# This script installs Chocolatey and required tools for the project on Windows

# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}
else {
    Write-Host "Chocolatey is already installed."
}

# Install required tools
choco install platformio -y
choco install protoc -y
choco install nodejs -y
choco install python --version=3.11.0 -y

Write-Host "✅ Chocolatey and all required tools installed!"
