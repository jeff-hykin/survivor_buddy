#!/usr/bin/env -S deno run --allow-all
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, } from "https://deno.land/x/quickr@0.6.61/main/run.js"
import "../../support/js_tools/env_vars.js"
import { project } from "../../support/js_tools/project.js"
const { projectRoot, settingsPath, certFile, keyFile, catkinFolder, serverFolder } = project

await run("roslaunch", "sb_moveit_config", "demo.launch", Cwd(catkinFolder))