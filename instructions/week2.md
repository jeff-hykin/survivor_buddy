# Following a schema

## Due when?

In person by Fri Feb 16

## What needs to be done

- Run the `run/check` command
- Be ready to demonstrate any of the behaviors (below) on rviz
- Be ready to show code / code structure (parameters / schema's)
- Alternatively, submit a screen recording that
    - shows the code structure
    - demo **all** of the behaviors in Rviz

## Tasks

- Create clap detection
    - NOTE: this is different than just a loudness-threshold, it needs to only trigger on a spike
    - I recommend playing recorded audio into the mic to get consistent results
    - There should be some kind of sensitivity parameter
    - Even if your code is decent, its probably to be finnicky. You just need a ~60% success rate
- Create a code structure(s) that follows the behavioral schema
    - E.g. behavioral schema class that takes parameters as an input (ex: constructor arguments)
    - Create a perception schema that includes clapping
    - Create a motor schema for the curious action
- Create the following behavior:
    - Clapping should trigger the curious action
    - Have survivor buddy return to its original pose after `N` seconds in a naturalistic way
