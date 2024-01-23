# What is this?

A repo for the survivor buddy lab assignment


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
- Every time:
    1. cd into the folder `cd ~/survivor_buddy`
    2. start the camera server `run/1_camera_server`
        - It will print out the **camera's URL**
    3. start the ros bridge server `run/2_ros_bridge_server`
    4. get a device with a camera 
        - The "device" can be phone, other labtop, or even the same laptop (the laptop that is running the server)
        - Make sure the device is on the same wifi as your laptop
        - open up a browser on the device
        - open up **camera's URL** that was given above
        - click the "Connect to ROSbridge Server"
        - if success, toggle the camera switch to the "on" position
    5. run the survivor buddy code `python ./main/python/main.py --example_arg 'Im an example'`
    