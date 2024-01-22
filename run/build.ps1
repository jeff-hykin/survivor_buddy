#!/usr/bin/env sh
echo --% >/dev/null;: ' | out-null
<#'

#
# for not-Windows operating systems
#
deno run -A npm:vite build

exit #>

#
# for windows (powershell)
#
deno run -A npm:vite build