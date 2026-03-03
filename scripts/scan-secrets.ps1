param(
  [switch]$IncludeHistory
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$contentPatterns = @(
  @{ Name = "AWS Access Key ID"; Regex = "AKIA[0-9A-Z]{16}" },
  @{ Name = "AWS Temporary Access Key ID"; Regex = "ASIA[0-9A-Z]{16}" },
  @{ Name = "GitHub PAT"; Regex = "ghp_[A-Za-z0-9]{36}" },
  @{ Name = "GitHub Fine-Grained PAT"; Regex = "github_pat_[A-Za-z0-9_]{20,}" },
  @{ Name = "Google API Key"; Regex = "AIza[0-9A-Za-z\-_]{35}" },
  @{ Name = "Stripe Live Secret"; Regex = "sk_live_[0-9A-Za-z]{24,}" },
  @{ Name = "Private Key Block"; Regex = "-----BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----" },
  @{ Name = "Generic Bearer Token"; Regex = "(?i)\bAuthorization\b\s*[:=]\s*[`"']?Bearer\s+[A-Za-z0-9\-\._~\+/]+=*" }
)

$suspiciousFilenameRegex = '(?i)(^|/)\.env(\.|$)|\.(pem|key|p12|pfx|crt|cer|jks|keystore)$|(^|/)id_rsa$|(^|/)(credentials|secrets?)($|[._-])'
$excludePathRegex = '(?i)(^|/)\.git/|(^|/)node_modules/|(^|/)cdk\.out/|(^|/)dist/|(^|/)build/|\.lock$'
$excludeExt = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico", ".pdf", ".zip")

$findings = New-Object System.Collections.Generic.List[object]

$trackedFiles = @(git ls-files)
foreach ($file in $trackedFiles) {
  $normalized = $file -replace "\\", "/"
  if ($normalized -match $excludePathRegex) { continue }

  $ext = [System.IO.Path]::GetExtension($normalized).ToLowerInvariant()
  if ($excludeExt -contains $ext) { continue }

  if ($normalized -match $suspiciousFilenameRegex) {
    $findings.Add([pscustomobject]@{
      Scope   = "working-tree"
      Type    = "suspicious-file"
      Rule    = "Suspicious filename"
      File    = $normalized
      Line    = "-"
      Snippet = "(tracked file name indicates possible secret material)"
    })
  }

  foreach ($pattern in $contentPatterns) {
    $matches = Select-String -Path $normalized -Pattern $pattern.Regex -Encoding UTF8
    foreach ($match in $matches) {
      $findings.Add([pscustomobject]@{
        Scope   = "working-tree"
        Type    = "content-match"
        Rule    = $pattern.Name
        File    = $normalized
        Line    = $match.LineNumber
        Snippet = $match.Line.Trim()
      })
    }
  }
}

if ($IncludeHistory) {
  $historyPatterns = @(
    "AKIA[0-9A-Z]{16}",
    "ASIA[0-9A-Z]{16}",
    "ghp_[A-Za-z0-9]{36}",
    "github_pat_[A-Za-z0-9_]{20,}",
    "AIza[0-9A-Za-z\-_]{35}",
    "sk_live_[0-9A-Za-z]{24,}",
    "-----BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----"
  )
  $historyRegex = [string]::Join("|", $historyPatterns)
  $commits = @(git rev-list --all)
  foreach ($commit in $commits) {
    $historyMatches = @(git grep -n -I -E "$historyRegex" $commit -- 2>$null)
    foreach ($m in $historyMatches) {
      $findings.Add([pscustomobject]@{
        Scope   = "git-history"
        Type    = "history-match"
        Rule    = "High-confidence history pattern"
        File    = $m
        Line    = "-"
        Snippet = "(history hit)"
      })
    }
  }
}

if ($findings.Count -eq 0) {
  Write-Host "PASS: no high-confidence secret patterns found."
  exit 0
}

Write-Host "FAIL: potential secret exposure detected."
Write-Host ""
$findings | ForEach-Object {
  Write-Host "[$($_.Scope)] $($_.Rule) :: $($_.File):$($_.Line)"
  Write-Host "  $($_.Snippet)"
}

exit 1
