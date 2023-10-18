# https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands?view=powershell-7

# Aufruf:   .\fortio.ps1

Set-StrictMode -Version Latest

$versionMinimum = [Version]'7.4.0'
$versionCurrent = $PSVersionTable.PSVersion
if ($versionMinimum -gt $versionCurrent) {
  throw "PowerShell $versionMinimum statt $versionCurrent erforderlich"
}

# Titel setzen
$host.ui.RawUI.WindowTitle = 'fortio'

# https://github.com/fortio/fortio
Write-Output 'Webbrowser mit http://localhost:8088/fortio aufrufen'
Write-Output '    URL:                       https://localhost:3000/rest/1'
Write-Output '    QPS (queries per second):  30'
Write-Output '    Duration:                  5s'
Write-Output '    Timeout:                   750s'
Write-Output '    https insecure:            Haken setzen'

C:\Zimmermann\fortio\fortio server -h2 -http-port 8088
