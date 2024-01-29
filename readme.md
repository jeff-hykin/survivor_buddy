# What is this?

WARNING: this repository is not finished

This is a repo for the survivor buddy lab assignment


# What needs to be done?

The end goal is have the survivor buddy react to a handful of gesture inputs from you.

### Overview of Steps

1. Get Linux (a specific-ish version)
2. Get ROS + Rviz running
3. After Linux/ROS/Rviz are installed, you can start testing your code in Rviz
4. Once your code is working, meet with me in person so we can push the code to survivor buddy and see if it works on a real robot

### How to actually do the thing

- Getting Linux
    - Note: if this step ends up being a problem for you, I have a pre-setup bootable flash drive you can clone.
    - We are using ROS noetic (e.g. ROS 1) so you're probably going to want to install Ubuntu 20.04
        - Why not 22.04?
            - Cause I'm pretty sure there isn't a way to make ROS 1 work on 22.04
        - Why not something other than Ubuntu?
            - I'm pretty sure ROS binds to specific versions of debian libraries. So yes you don't need to use Ubuntu; anything Debian/Ubuntu-based (like Pop!OS) should work, so long as its based on same version of Debian as Ubuntu 20.04.
    - Should I dual-boot or use a virtual machine? (or docker)
        - If you have a Mac M1 (like me) read the inner bullet points.
            - Bad news, we basically can't do either. The only viable options I've found so far are:
                - 1. paying for [Parallels](https://www.parallels.com/)
                - 2. find/get a not-M1 Linux PC.
        - For all other laptops:
            - Dual booting is nice for USB ports and performance. (You'll have to plug in to push code to the physical bot)
            - Virtual machines are nice if you want to keep your normal keyboard shortcuts. Its a pain to forward USB ports, but it is possible. The benefit is you can treat the virtual machine like a remote computer and use SSH tools to connect your text editor to it (which makes for a nice code-editing experience).
            - Docker would be great except for rviz. If you can get rviz to work through docker, all the power to you.
- Getting ROS/Rviz
    1. Boot up your linux machine, open the terminal app
    2. Clone and cd into this repo `git clone https://github.com/jeff-hykin/survivor_buddy.git`
    3. Run this command `run/install_stuff`
    4. Once it finishes, everything you need for lab 1 should be installed
- Test Rviz
    1. cd into the folder, `cd ~/survivor_buddy`
    2. start rviz, `run/3_move_it`
    3. run `. ./.env && python ./main/python/helper_scripts/sb_test_joint_positions.py`
    4. type in some test commands and see if bot moves inside of Rviz
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