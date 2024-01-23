#!/usr/bin/env -S deno run --allow-all
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.61/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.61/main/run.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.6.61/main/console.js"

import archy from "https://deno.land/x/archaeopteryx@1.0.7/mod.ts"
import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
import { selectOne } from "../../support/js_tools/input_tools.js"

const projectRoot = FileSystem.makeAbsolutePath(await FileSystem.walkUpUntil("deno.lock"))

const settingsPath = `${projectRoot}/settings.yaml`
const certFile = FileSystem.makeAbsolutePath(`${projectRoot}/support/cert.pem`)
const keyFile = FileSystem.makeAbsolutePath(`${projectRoot}/support/key.pem`)
const serverFolder = FileSystem.makeAbsolutePath(`${projectRoot}/support/catkin_ws/src/sb_web`)

let server
const watcher = Deno.watchFs([
    `.env`,
    `${serverFolder}/rb_server.launch`,
])

let process = run("roslaunch", "rb_server.launch", Cwd(serverFolder))
const updateInfo = async ()=>{
    const settings = yaml.parse(await FileSystem.read(settingsPath)).project

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
for await (const event of watcher) {
    if (event.kind === 'modify') {
        updateInfo()
    }
}
