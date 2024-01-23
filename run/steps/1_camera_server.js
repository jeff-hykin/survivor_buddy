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

let server
const watcher = Deno.watchFs(settingsPath, { recursive: true })
const updateInfo = async ()=>{
    const settings = yaml.parse(await FileSystem.read(settingsPath)).project

    if (server) {
        try {
            server.close()
        } catch (error) {
        }
    }
    
    server = await archy({
        port: settings.cameraPortNumber,
        secure: true,
        certFile,
        keyFile,
    })

    const ipAddresses = Deno.networkInterfaces().filter((each)=>each.family=="IPv4").map((each)=>each.address)

    let ipAddress
    if (ipAddresses.length == 1) {
        ipAddress = ipAddresses[0]
    } else {
        ipAddress = await selectOne({
            message: `IDK which is your local ip address, so please pick one (guess if you have too)`,
            showList: true,
            showInfo: false,
            options: ipAddresses.map(each=>`${each}`),
            autocompleteOnSubmit: true,
        })
    }

    console.log(`updating rb_server`)
    const rbServerPath = `${projectRoot}/catkin_ws/src/sb_web/rb_server.launch`
    const launchContent = await FileSystem.read(rbServerPath)
    let newContent = launchContent
    newContent = newContent.replace(/name="port" default=".*?"/, `name="port" default=${JSON.stringify(`${settings.rosbridgePortNumber}`)}`)
    newContent = newContent.replace(/name="address" default=".*?"/, `name="port" default=${JSON.stringify(`${ipAddress}`)}`)
    newContent = newContent.replace(/<arg name="certfile" default=".*?"/, `<arg name="certfile" default=${JSON.stringify(certFile)}`)
    newContent = newContent.replace(/<arg name="keyfile" default=".*?"/, `<arg name="keyfile" default=${JSON.stringify(keyFile)}`)
    await FileSystem.write({
        data: newContent,
        path: rbServerPath,
    })

    // 
    // patch rb_server.launch (inject correct cert.pem and key.pem paths, and default host address)
    // 
    console.log(`#`)
    console.log(`# open: https://${ipAddress}:${settings.cameraPortNumber}`)
    console.log(`#`)
}
for await (const event of watcher) {
    if (event.kind === 'modify') {
        updateInfo()
    }
}