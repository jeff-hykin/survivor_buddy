# What is this?

WARNING: this repository is not finished

This is a repo for the survivor buddy lab assignment


# What needs to be done?

The end goal is have the survivor buddy react to a handful of gesture inputs from you.

### Overview of Steps

1. Get ROS + Rviz running
- its linux-only so you'll need to dual boot or install a VM
    - unless you have a M1 mac (like me) where there's basically only two options
        - pay for [Parallels](https://www.parallels.com/)
        - find/get a not-M1 Linux PC 
        - Note: On M1 I have tried docker, I have tried virtualbox, I have tried building from source. All of combined wasted about 2 weeks of my life.
- if you have a hard time setting it up, let me know as I have a bootable flashdrive you can clone. It has everything setup on it
2. Get the lab working in Rviz
3. Meet with me in person so we can push the code to survivor buddy and see if it works on a real robot

### How to actually do it

- Initial setup:
    1. Boot up your linux machine, open the terminal app
    2. Clone and cd into this repo `git clone https://github.com/jeff-hykin/survivor_buddy.git`
    3. Run the setup script `run/install_stuff`
- Test Rviz
    0. cd into the folder `cd ~/survivor_buddy`
    1. start rviz `run/3_move_it`
    2. run `python ./main/python/helper_scripts/sb_test_joint_positions.py`
    3. type in some test commands and see if bot moves inside of Rviz
- Run Survivor Buddy Code:
    1. cd into the folder `cd ~/survivor_buddy`
    2. start the camera server `run/1_camera_server`
        - It will print out the **camera's URL**
    3. start the ros bridge server `run/2_ros_bridge_server`
    4. get a device with a camera
        - The "device" can be a phone, another labtop, or even the same laptop (the laptop that is running the server)
        - Just make sure the device is on the same wifi as the laptop running the server
        - open up a browser on the device
        - open up the **camera's URL** that was printed above
            - You're probably going to get a "WARNING" page
                - click "more details"
                - then click "explore anyways" to get to the site
            - Try switching the camera toggle
                - you'll probably see another message (right side of the screen) that says something about being unable to connect to the socket
                - Click on the URL in the log
                - You'll get the "WARNING" page again
                - Click details -> explore anyways again
                - then refresh the page
            - Now that both sites are approved, you should be able to 
        - click the "Connect to ROSbridge Server"
        - if success, toggle the camera switch to the "on" position
    5. start rviz `run/3_move_it`
    6. run the python code `python ./main/python/main.py --example_arg 'Im an example'`
    7. Hopefully when your python code performs robot actions, you can see it executed on Rviz
- Deploy to the robot
    1. the start is similar to the previous instructions:
        1. start the camera server `run/1_camera_server`
            - It will print out the **camera's URL**
        2. start the ros bridge server `run/2_ros_bridge_server`
        3. get a device with a camera
            - The "device" can be a phone, another labtop, or even the same laptop (the laptop that is running the server)
            - Just make sure the device is on the same wifi as the laptop running the server
            - open up a browser on the device
            - open up the **camera's URL** that was given above
                - TODO/FIXME: explain the websocket issue on this button
            - click the "Connect to ROSbridge Server"
            - if success, toggle the camera switch to the "on" position
    2. Plug in survivor_buddy's power cord
    3. Plug in survivor_buddy's USB cable into your laptop
    4. Make sure it is being detected by running the command `ls /dev/ttyUSB*`, you should see /dev/ttyUSB0 as the output of the previous command.
    5. To connect try `run/4_ros_serial`
    6. To test that the microcontroller is receiving commands, run `python ./main/python/helper_scripts/sb_test_joint_positions.py`
    7. Try run the python code `python ./main/python/main.py --send_to_rviz False`
    8. Record a video of your gestures and survivor_buddy's reactions