<#
.SYNOPSIS
	Stops currently running Firefox processes, stops them, and starts one.
#>
[CmdletBinding()]
param (
	# Only affects Firefox developer edition (by checking whether "Developer" exists in path to the
	# process binary.
	[switch]
	$Dev
)

function main {
	$foxxos = Get-Process firefox -ErrorAction Ignore | Where-Object { $null -ne $_.Path }

	if ($Dev) {
		$foxxos = $foxxos | Where-Object { $_.Path.Contains('Developer') }
	}

	logMeh "Found $($foxxos.Count) foxxos"

	if ($foxxos.Count -eq 0) {
		kthxbai👋
	}

	$foxxo = ($foxxos | Select-Object Path -Unique).Path

	if ($foxxo.Count -eq 1) {
		logYay "Using foxxo at ``$foxxo`` :3"
	} else {
		logNay "Found $($foxxo.Count) unique foxxos; not sure which one to use :3"
		kthxbai👋
	}

	logYay 'Stopping foxxos'
	$foxxos | stoppppp😭

	logYay 'Starting Firefox'
	omghai❤️ $foxxo
}

function logYay($huh) {
	Write-Host -NoNewline -ForegroundColor Green '^_^ '
	Write-Host $huh
}

function logMeh($huh) {
	Write-Host -NoNewline -ForegroundColor Blue '-_- '
	Write-Host $huh
}

function logNay($huh) {
	Write-Host -NoNewline -ForegroundColor Red '>_< '
	Write-Host $huh
}

function stoppppp😭 {
	param(
		[Parameter(ValueFromPipeline)]
		$fox
	)

	process {
		$fox | Stop-Process
	}
}

function omghai❤️ {
	param($fox)

	& $fox
}

function kthxbai👋 {
	exit
}

main
