# Save as: tools/time-spent.ps1
# Usage (from repo root):
#   .\tools\time-spent.ps1 -SinceDays 14 -GapCapMinutes 120 -LastCommitCapMinutes 30

param(
  [int]$SinceDays = 14,
  [int]$GapCapMinutes = 120,
  [int]$LastCommitCapMinutes = 30
)

function Get-Category([string[]]$files) {
  $map = @{
    "front-end/src/app/dashboard/growth"               = "Growth"
    "front-end/src/components/dashboard/GrowthNavbar"  = "Growth"
    "front-end/src/app/dashboard/track-creation"       = "Track Creation"
    "back-end/src/routes/trackCreation"                = "Track Creation"
    "back-end/src/utils/challegebuilder"               = "AI Utils"
    "back-end/src/utils/postcreation"                  = "AI Utils"
    "front-end/src/app/dashboard/live-support"         = "Live Support"
    "back-end/src/routes/liveSupport"                  = "Live Support"
    "front-end/src/components/dashboard/Navbar.tsx"    = "Navbar/UX"
    "front-end/src/components/dashboard/FeatureGrid.tsx" = "Feature Grid"
    "front-end/src/app/dashboard/team-management"      = "Team Management"
    "front-end/src/app/dashboard/speaker-jury-management" = "Speakers/Jury"
    "front-end/src/components/landing-page"            = "Landing"
    "front-end/src/app"                                = "Dashboard Misc"
    "back-end/src"                                     = "Backend Misc"
  }

  if (-not $files -or $files.Count -eq 0) { return "Other" }

  $scores = @{}
  foreach ($f in $files) {
    foreach ($k in $map.Keys) {
      if ($f -like "$k*") {
        $cat = $map[$k]
        if ($scores.ContainsKey($cat)) { $scores[$cat] += 1 } else { $scores[$cat] = 1 }
      }
    }
  }
  if ($scores.Keys.Count -eq 0) { return "Other" }
  ($scores.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
}

# Pull structured git log with files
$since = (Get-Date).AddDays(-$SinceDays)
$raw = git log --since="$since" --reverse --date=iso-strict --pretty=format:"--COMMIT--|%H|%ad|%an|%s" --name-only 2>$null
if (-not $?) {
  Write-Error "Failed to run git log. Ensure you’re in the repo and git is installed."
  exit 1
}

# Parse commits
$commits = @()
$curr = $null
foreach ($line in $raw -split "`n") {
  if ($line -like "--COMMIT--*") {
    if ($curr) { $commits += $curr }
    $parts = $line.Split("|",5)
    $curr = [ordered]@{
      Sha = $parts[1]
      Date = [DateTime]::Parse($parts[2])
      Author = $parts[3]
      Subject = $parts[4]
      Files = New-Object System.Collections.Generic.List[string]
    }
  } elseif ($line.Trim().Length -gt 0) {
    $curr.Files.Add($line.Trim())
  }
}
if ($curr) { $commits += $curr }

if ($commits.Count -eq 0) {
  Write-Host "No commits in the last $SinceDays days."
  exit 0
}

# Assign category per commit
$commits | ForEach-Object {
  $_.Category = Get-Category($_.Files)
}

# Compute time deltas capped by GapCapMinutes
$gapCap = [TimeSpan]::FromMinutes($GapCapMinutes)
$lastCap = [TimeSpan]::FromMinutes($LastCommitCapMinutes)

$estimates = @()
for ($i = 0; $i -lt $commits.Count; $i++) {
  $c = $commits[$i]
  if ($i -lt $commits.Count - 1) {
    $next = $commits[$i+1]
    $delta = $next.Date - $c.Date
    if ($delta -lt [TimeSpan]::Zero) { $delta = [TimeSpan]::Zero }
    if ($delta -gt $gapCap) { $delta = $gapCap }
  } else {
    $delta = $lastCap
  }
  $estimates += [pscustomobject]@{
    Sha = $c.Sha
    When = $c.Date
    Category = $c.Category
    Subject = $c.Subject
    DurationMinutes = [Math]::Round($delta.TotalMinutes)
  }
}

# Sum by category
$summary = $estimates | Group-Object Category | ForEach-Object {
  $mins = ($_.Group | Measure-Object DurationMinutes -Sum).Sum
  [pscustomobject]@{
    Category = $_.Name
    Minutes  = $mins
    Hours    = [Math]::Round($mins/60,2)
    Commits  = $_.Group.Count
  }
} | Sort-Object Hours -Descending

# Output
"=== Time by Category (capped gaps ${GapCapMinutes}m, last commit cap ${LastCommitCapMinutes}m) ==="
$summary | Format-Table -AutoSize
"`n=== Top commits (with estimated durations) ==="
$estimates | Sort-Object DurationMinutes -Descending | Select-Object -First 10 Sha,When,Category,DurationMinutes,Subject | Format-Table -AutoSize

# Also write CSVs
$summary | Export-Csv -Path .\time-summary.csv -NoTypeInformation
$estimates | Export-Csv -Path .\time-commits.csv -NoTypeInformation
Write-Host "`nWrote time-summary.csv and time-commits.csv"
