import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.61/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.61/main/run.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.6.61/main/console.js"

import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
import { project } from "../../support/js_tools/project.js"
const { projectRoot, settingsPath, certFile, keyFile, catkinFolder, serverFolder } = project

// 
// tooling
// 
    const extractEnvVarsFromShellScript = ({ scriptPath, shellExecutable="bash", debug=false })=>{
        const shellPartEscape = (arg)=>`${arg}`.replace(`'`,`'"'"'`)
        const itemInfo = FileSystem.sync.info(scriptPath)
        const endIdentifierString = `---------------end of script ${Math.random()} -----------------`
        if (!itemInfo.isFile) {
            console.warn(`Unable to extract env vars from ${JSON.stringify(scriptPath)} because it isn't a file`)
            return {}
        } else {
            const output = await run(
                shellExecutable,
                "-c"
                `
                    ${FileSystem.sync.read(scriptPath)}
                    
                    echo "${endIdentifierString}"
                    '${shellPartEscape(Deno.execPath)}' eval '${shellPartEscape(`console.log(JSON.stringify(Deno.env.toObject()))`)}'
                `,
                Stdout(returnAsString)
            )
            const pattern = new RegExp(`([^a]|[a])*${endIdentifierString}`)
            if (!output.match(pattern)) {
                if (debug) {
                    console.debug(`output is:`,JSON.stringify(output))
                    console.debug(`JSON.stringify(output) is:`,JSON.stringify(output))
                    console.debug(`endIdentifierString is:`,JSON.stringify(endIdentifierString))
                    console.debug(`there should be a JSON value after the end identifier in the output var`)
                }
                throw Error(`There was an issue trying to setup the env vars. Rerun with debug for more info\ne.g. extractEnvVarsFromShellScript({ debug: true })`)
            } else {
                return JSON.parse(output.replace(pattern,""))
            }
        }
    }

    const loadShellScript = ({ scriptPath, shellExecutable="bash", debug=false })=>{
        const envObject = extractEnvVarsFromShellScript({ scriptPath, shellExecutable, debug })
        for (const [key, value] of Object.entries(envObject)) {
            Deno.env.set(key, value)
        }
    }

    async function withPwd(tempPwd,func) {
        const originalPwd = FileSystem.pwd
        const originalPwdEnvVar = Deno.env.get("PWD")
        tempPwd = FileSystem.makeAbsolutePath(tempPwd)
        try {
            FileSystem.pwd = tempPwd
            Deno.env.set("PWD",tempPwd)
            await func(originalPwd)
        } finally {
            FileSystem.pwd = originalPwd
            Deno.env.set("PWD",originalPwdEnvVar)
        }
    }

// 
// actual script loading env vars
// 
    await withPwd("/opt/ros/noetic/", ()=>{
        loadShellScript({ scriptPath: "/opt/ros/noetic/setup.bash" })
    })
    
    if (!FileSystem.sync.info(`${catkinFolder}/devel`).isFolder) {
        console.log(`Looks like you haven't got the catkin_ws folder setup`)
        console.log(`try running the install_stuff command to get it setup`)
    } else {
        await withPwd(`${catkinFolder}/devel`, ()=>{
            loadShellScript({ scriptPath: `${FileSystem.pwd}/setup.bash` })
        })
    }

    const ldLibraryPath = Deno.env.get("LD_LIBRARY_PATH")
    // fix missing libeigenpy.so
    Deno.env.set("LD_LIBRARY_PATH", `${ldLibraryPath}:/opt/ros/noetic/lib/x86_64-linux-gnu/:/opt/ros/noetic/lib/`)