# https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands?view=powershell-7

# Aufruf:   .\dive.ps1 [bookworm|wolfi]
# ggf. vorher:  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# oder:         Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# "Param" muss in der 1. Zeile sein
Param (
  [string]$base = 'distroless'
)

Set-StrictMode -Version Latest

$versionMinimum = [Version]'7.4.0'
$versionCurrent = $PSVersionTable.PSVersion
if ($versionMinimum -gt $versionCurrent) {
  throw "PowerShell $versionMinimum statt $versionCurrent erforderlich"
}

# Titel setzen
$host.ui.RawUI.WindowTitle = 'dive'

$diveVersion = 'v0.11.0'
$imagePrefix = 'juergenzimmermann/'
$imageBase = 'buch'
$imageTag = "2023.10.0-$base"
$image = "$imagePrefix${imageBase}:$imageTag"

# $image = 'gcr.io/distroless/nodejs20-debian12:nonroot'
# $image = 'node:20.7.0-bookworm-slim'
# $image = 'cgr.dev/chainguard/node:latest'

# https://github.com/wagoodman/dive#installation
docker run --rm --interactive --tty `
  --mount type='bind,source=/var/run/docker.sock,destination=/var/run/docker.sock' `
  --hostname dive --name dive `
  --read-only --cap-drop ALL `
  wagoodman/dive:$diveVersion $image
