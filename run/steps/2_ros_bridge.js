#!/usr/bin/env -S deno run --allow-all
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.61/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.61/main/run.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.6.61/main/console.js"

import archy from "https://deno.land/x/archaeopteryx@1.0.7/mod.ts"
import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
import { selectOne } from "../../support/js_tools/generic/input_tools.js"
import "../../support/js_tools/env_vars.js"
import { project } from "../../support/js_tools/project.js"

const { projectRoot, settingsPath, certFile, keyFile, catkinFolder, serverFolder } = project

let server
const watcher = Deno.watchFs([
    `${serverFolder}/rb_server.launch`,
])

let process = run("roslaunch", "rb_server.launch", Cwd(serverFolder))
const updateInfo = async ()=>{
    const settings = project.settings

    process.sendSignal("SIGINT")
    // wait a second
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    // force kill
    process.sendSignal("SIGKILL")
    // wait another second
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    // restart process
    process = run("roslaunch", "rb_server.launch", Cwd(serverFolder))
}
updateInfo()
for await (const event of watcher) {
    if (event.kind === 'modify') {
        updateInfo()
    }
}
