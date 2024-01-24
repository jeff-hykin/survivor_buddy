import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.62/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.62/main/run.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.6.62/main/console.js"

// 
// tooling
// 
export const extractEnvVarsFromShellScript = async ({ scriptPath, shellExecutable="bash", debug=false })=>{
    const shellPartEscape = (arg)=>`${arg}`.replace(`'`,`'"'"'`)
    const itemInfo = FileSystem.sync.info(scriptPath)
    const endIdentifierString = `---------------end of script ${Math.random()} -----------------`
    if (!itemInfo.isFile) {
        console.warn(`Unable to extract env vars from ${JSON.stringify(scriptPath)} because it isn't a file`)
        return {}
    } else {
        const output = await run(
            shellExecutable,
            "-c",
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

export const loadShellScript = async ({ scriptPath, shellExecutable="bash", debug=false })=>{
    const envObject = extractEnvVarsFromShellScript({ scriptPath, shellExecutable, debug })
    for (const [key, value] of Object.entries(envObject)) {
        Deno.env.set(key, value)
    }
}

export async function withPwd(tempPwd,func) {
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