# setup-gatemesh.ps1

# Set your organization name

$ORG = "gatemesh"
$BASE_DIR = "$HOME\projects\gatemesh"
$GH_PATH = "C:\Program Files\GitHub CLI\gh.exe"

# Create base directory and navigate to it
New-Item -ItemType Directory -Force -Path $BASE_DIR | Out-Null
Set-Location $BASE_DIR

# Fork core repositories
Write-Host "🍴 Forking Meshtastic repositories..."

& $GH_PATH repo fork meshtastic/firmware --clone --org $ORG
& $GH_PATH repo fork meshtastic/protobufs --clone --org $ORG
& $GH_PATH repo fork meshtastic/Meshtastic-Android --clone --org $ORG
& $GH_PATH repo fork meshtastic/Meshtastic-Apple --clone --org $ORG
& $GH_PATH repo fork meshtastic/web --clone --org $ORG
& $GH_PATH repo fork meshtastic/python --clone --org $ORG

# Rename local directories for clarity
Rename-Item -Path "firmware" -NewName "gatemesh-firmware"
Rename-Item -Path "protobufs" -NewName "gatemesh-protobufs"
Rename-Item -Path "Meshtastic-Android" -NewName "gatemesh-android"
Rename-Item -Path "Meshtastic-Apple" -NewName "gatemesh-ios"
Rename-Item -Path "web" -NewName "gatemesh-web"
Rename-Item -Path "python" -NewName "gatemesh-python"

Write-Host "✅ All repositories forked!"
