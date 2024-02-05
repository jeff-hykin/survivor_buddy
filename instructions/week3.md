# Multi behavior

## Due when?

In person Fri Feb 23

## What needs to be done

- Run the `run/check` command
- Getting the code running on the physical bot may be a requirement; check in on this the week of the lab. (run `run/pull_changes` to update/refresh the instructions)
- Be ready to demonstrate any of the behaviors on on rviz
- Be ready to show code / code structure
- Alternatively, submit a screen recording that
    - shows the code structure (e.g. parameters/schema)
    - demo **all** of the behaviors in Rviz

## Tasks

- create two more actions (also involving >=2 degrees of freedom):
    1. fearful
        - involve the face expressions
    2. startled
        - have an intensity parameter, higher intensity causes a stronger reaction
   
- follow the behavioral schema again with the following characteristics
    - Have survivor buddy return to its original pose after time time of no sound stimulus
    - Have survivor buddy "fall asleep" after lots of time with no stimulus
    - Continuous loud noise at any time causes fearful
    - Clapping when awake triggers curious
    - Clapping when asleep triggers startled (louder the clap, the greater the reaction)

- (Pending) Deploy to the physical robot. Which you'll get help with, but heres the general steps
    1. Plug in survivor_buddy's USB cable into your laptop
    2. Make sure it is being detected by running the command `ls /dev/ttyUSB*`, you should see /dev/ttyUSB0 as the output of the previous command.
    3. In a terminal run `run/5_ros_serial`
    4. To test that the microcontroller is receiving commands, in another terminal run `. ./.env && python ./main/python/helper_scripts/physical_test.py`
    5. Now repeat the steps of running on rviz (4 terminals) BUT, this time when you run your python do:<br>`. ./.env && python ./main/python/main.py --send_to_rviz False`