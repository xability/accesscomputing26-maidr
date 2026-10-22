param(
  [string]$ExtensionRoot = (Join-Path $PSScriptRoot '..\_extensions\jy-a11y'),
  # Keep project fixtures on a normal path; Quarto may skip hidden ancestors.
  [string]$WorkRoot = $PSScriptRoot,
  [string]$ReportPath
)
$ErrorActionPreference = 'Stop'
$ExtensionRoot = (Resolve-Path $ExtensionRoot).Path
$run = Join-Path $WorkRoot ('jy-a11y-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $run -Force | Out-Null
$results = [Collections.Generic.List[object]]::new()
function Write-Text($Path, $Text) {
  [IO.File]::WriteAllText($Path, $Text, [Text.UTF8Encoding]::new($false))
}
function Render-Case($Name, [string[]]$Yaml, $To = 'revealjs', $Checks = @{}) {
  $dir = Join-Path $run $Name
  New-Item -ItemType Directory -Path (Join-Path $dir '_extensions') -Force | Out-Null
  Copy-Item $ExtensionRoot (Join-Path $dir '_extensions\jy-a11y') -Recurse
  Write-Text (Join-Path $dir 'assert-unchanged.lua') "function Meta(meta) if meta.overview ~= true then error('Non-Reveal metadata changed') end return meta end"
  $lines = @('---') + $Yaml + @('---', '', '## First', '', 'First slide.', '', '## Second', '', 'Second slide.')
  $source = Join-Path $dir 'example.qmd'
  Write-Text $source ($lines -join [Environment]::NewLine)
  $log = Join-Path $dir 'render.log'
  & quarto render $source --to $To --quiet *> $log
  if ($LASTEXITCODE -ne 0) { throw "$Name render failed: $(Get-Content $log -Raw)" }
  $suffix = if ($To -eq 'docx') { 'docx' } else { 'html' }
  $output = Join-Path $dir "example.$suffix"
  if (-not (Test-Path $output)) { throw "$Name output missing" }
  if ($To -ne 'docx') {
    $html = Get-Content $output -Raw
    if ($Name -eq 'unrelated-options-preserved' -and $html.Contains('data-at-shortcutkeys')) { throw 'Reserved keys added with keyboard:false' }
    if ($To -eq 'html' -and ($html.Contains('<script id="jy-a11y"') -or $html.Contains('data-at-shortcutkeys'))) { throw 'Filter leaked into ordinary HTML' }
    foreach ($entry in $Checks.GetEnumerator()) {
      if ($html -notmatch $entry.Value) { throw "$Name assertion failed: $($entry.Key)" }
    }
  }
  $results.Add([pscustomobject]@{name=$Name; format=$To; passed=$true})
  Write-Output "PASS $Name"
}
try {
  $blocked = @{overview='(?m)^\s*overview:\s*false\s*,'; runtime='<script id="jy-a11y"'; reserved='data-at-shortcutkeys'}
  Render-Case 'baseline-unfiltered' @('format:', '  revealjs:', '    overview: true') 'revealjs' @{overview='(?m)^\s*overview:\s*true\s*,'}
  Render-Case 'default-blocked' @('format: revealjs', 'filters: [jy-a11y]') 'revealjs' $blocked
  Render-Case 'explicit-true-overridden' @('format:', '  revealjs:', '    overview: true', 'filters: [jy-a11y]') 'revealjs' $blocked
  Render-Case 'explicit-false-preserved' @('format:', '  revealjs:', '    overview: false', 'filters: [jy-a11y]') 'revealjs' $blocked
  Render-Case 'unrelated-options-preserved' @('format:', '  revealjs:', '    overview: true', '    keyboard: false', '    width: 1234', '    height: 777', 'filters: [jy-a11y]') 'revealjs' @{overview='(?m)^\s*overview:\s*false\s*,';keyboard='(?m)^\s*keyboard:\s*false\s*,';width='(?m)^\s*width:\s*1234\s*,';height='(?m)^\s*height:\s*777\s*,'}
  Render-Case 'self-contained' @('format:', '  revealjs:', '    embed-resources: true', 'filters: [jy-a11y]') 'revealjs' $blocked
  Render-Case 'ordinary-html-unchanged' @('format: html', 'overview: true', 'filters: [jy-a11y, assert-unchanged.lua]') 'html'
  Render-Case 'docx-unchanged' @('format: docx', 'overview: true', 'filters: [jy-a11y, assert-unchanged.lua]') 'docx'
  $project = Join-Path $run 'project-inherited'
  New-Item -ItemType Directory -Path (Join-Path $project '_extensions') -Force | Out-Null
  Copy-Item $ExtensionRoot (Join-Path $project '_extensions\jy-a11y') -Recurse
  Write-Text (Join-Path $project '_quarto.yml') (@('project:', '  type: default', 'format: revealjs', 'filters: [jy-a11y]') -join [Environment]::NewLine)
  Write-Text (Join-Path $project 'example.qmd') (@('---', 'format:', '  revealjs:', '    overview: true', '---', '', '## First', '', 'First slide.') -join [Environment]::NewLine)
  Push-Location $project
  try {
    & quarto render example.qmd --quiet *> (Join-Path $project 'render.log')
    if ($LASTEXITCODE -ne 0) { throw "Project render failed: $(Get-Content 'render.log' -Raw)" }
  } finally { Pop-Location }
  if ((Get-Content (Join-Path $project 'example.html') -Raw) -notmatch '(?m)^\s*overview:\s*false\s*,') { throw 'Inherited filter failed' }
  $results.Add([pscustomobject]@{name='project-inherited'; format='revealjs'; passed=$true})
  Write-Output 'PASS project-inherited'
  Write-Output ("All {0} rendering tests passed." -f $results.Count)
} finally {
  if ($ReportPath) {
    $results | ConvertTo-Json -Depth 4 | Set-Content $ReportPath -Encoding utf8
  }
  Remove-Item $run -Recurse -Force
}
