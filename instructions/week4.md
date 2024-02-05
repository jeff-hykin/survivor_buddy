# Face detection

## Due when?

Two due dates!
- Some time before Friday
    - demonstrate using the Face API
    - demonstrate using `playSound()` in the main.js 
    - It can be after class, in office hours, or in a screen recording 
- Then the typical in person demo Fri March 8st

## What needs to be done

- Demonstrate using the insight face API before Friday
- Be ready to demonstrate any of behaviors on rviz
- Get code running on the physical bot
- Run the `run/check` command

## Tasks

- Be able to use a face API
    - You can use any API you want but the `insightface` should have been installed as part of the setup instructions
    - I recommend having a dummy image file you can load (instead of trying to grab an image frame)
    - insightface doesn't have great documentation, so try searching github (all of github) for `from insightface.app import FaceAnalysis` to see examples
    - Show how to get the number of faces and the x,y coordinates of a face

- Make a talking sound on the camera browser
    - in the `main.js` file use `playSound("type sometthing", {pitch:1,}).then(()=>console.log("finished making a sound"))`
    
- Create a "look at" behavior
    - If theres one or more faces visible, pick one and have survivor buddy look towards it
    - e.g. if the face moves to one side, survivor buddy should turn its head to keep looking at it
    - if the face moves up/down survivor buddy should angle its head to keep looking at it

- Create the following behaviors (these are in order of precedence/priority, highest ones override later ones)
    - Note: either remove old behaviors or make them "play nice" with the behaviors below. (Being more creative/advanced is fine)
    - Loud noises (spike or continuous) cause the fearful behavior
    - No stimulus for some amount of time causes survivor buddy to go into a neutral state
    - Being in the neutral state, seeing a face, but the face being too close should cause the startled behavior
    - Seeing a face in a neutral state should trigger the happy expression
    - After the initial response, if one (or more) faces are still detected, survivor buddy do the "look at" behavior
    - If a face gets too close, survivor buddy should lean back
    - If a face was in the middle of survivor buddy's view, then disappears, it should trigger the curious behavior
    - If there is a moderate level of noise for some period of time, survivor buddy should start talking (and should stop when/if the noise dies down)

- Deploy behaviors to the physical robot
    1. Plug in survivor_buddy's USB cable into your laptop
    2. Make sure it is being detected by running the command `ls /dev/ttyUSB*`, you should see /dev/ttyUSB0 as the output of the previous command.
    3. In a terminal run `run/5_ros_serial`
    4. To test that the microcontroller is receiving commands, in another terminal run `. ./.env && python ./main/python/helper_scripts/physical_test.py`
    5. Now repeat the steps of running on rviz (4 terminals) BUT, this time when you run your python do:<br>`. ./.env && python ./main/python/main.py --send_to_rviz False`