import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.62/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.62/main/run.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.6.62/main/console.js"
import { loadShellScript, withPwd } from "./generic/shell_help.js"

import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
import { project } from "../../support/js_tools/project.js"
const { projectRoot, settingsPath, certFile, keyFile, catkinFolder, serverFolder } = project

if (FileSystem.sync.info("/opt/ros/noetic/").isFolder) {
    await withPwd("/opt/ros/noetic/", async ()=>{
        Deno.env.set("CATKIN_SHELL", "bash")
        await loadShellScript({ scriptPath: "/opt/ros/noetic/setup.sh" })
    })
}

if (!FileSystem.sync.info(`${catkinFolder}/devel`).isFolder) {
    console.log(`Looks like you haven't got the catkin_ws folder setup`)
    console.log(`try running the ${cyan`run/install_stuff`} command to get it setup`)
    console.log(`\nIf you have issue let me know.`)
    if (!confirm(yellow`\nIgnore that and continue the command anyways?`)) {
        Deno.exit(1)
    }
    console.log("\n\n\n\n")
} else {
    await withPwd(`${catkinFolder}/devel`, async ()=>{
        await loadShellScript({ scriptPath: `${FileSystem.pwd}/setup.bash` })
    })
}

const ldLibraryPath = Deno.env.get("LD_LIBRARY_PATH")
// fix missing libeigenpy.so
Deno.env.set("LD_LIBRARY_PATH", `${ldLibraryPath}:/opt/ros/noetic/lib/x86_64-linux-gnu/:/opt/ros/noetic/lib/`)