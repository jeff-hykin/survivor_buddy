# What is this?

WARNING: while the setup instructions are complete, the assignment & submission details are in-progress/missing. Just FYI 

This is a repo for the survivor buddy lab assignment


# What needs to be done?

The end goal is have the survivor buddy react to a handful of gesture inputs from you.

### Overview of Steps

1. Make a github repo
2. Get Linux (a specific-ish version)
3. Get ROS + Rviz running
4. After Linux/ROS/Rviz are installed, you can start testing your code in Rviz
5. Once your code is working, meet with me in person so we can push the code to survivor buddy and see if it works on a real robot

## How to actually do the thing

- Make a github repo
    1. Click the green "Use Template" button in the top-right-ish of this screen
    2. MAKE IT PRIVATE [tutorial](https://stackoverflow.com/questions/57836411/how-can-i-switch-a-public-repo-to-private-and-vice-versa-on-github)
    3. Copy down the url of your repo for a later step (ex: my url is https://github.com/jeff-hykin/survivor_buddy)
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
    2. Login to your github
        - You can do this with keys pretty quickly
            - run `ssh-keygen -t rsa` (press enter 3 times, ignore the output unless its an error)
            - run `cat ~/.ssh/id_rsa.pub`
            - copy the output of the cat command
            - login to github online
            - go to your account settings
            - go to "SSH and GPG keys"
            - click "New ssh key"
            - enter any title you want
            - paste the output of the cat command into the main box
            - save
    2. Clone and cd into your repo `git clone YOUR_REPO_URL_HERE`
    3. Run this command `run/install_stuff`
    4. Once it finishes, everything you need for lab 1 should be installed
- Test Rviz
    1. cd into the folder, `cd ~/survivor_buddy`
    2. start rviz, `run/3_move_it`
    3. run `. ./.env && python ./main/python/helper_scripts/rviz_test.py`
    4. type in some test positions and see if bot moves inside of Rviz
- Run Survivor Buddy Code:
    1. cd into the folder `cd ~/survivor_buddy`
    2. In your first terminal start the camera server `run/1_camera_server`
        - It will print out the **camera's URL**
    3. In a second terminal start the ros bridge server `run/2_ros_bridge_server` (images will get sent to the bridge)
    4. get a device with a camera
        - The "device" can be a phone, another labtop, or even the same laptop (the laptop that is running the camera server and bridge)
        - Just make sure the device is on the same wifi as the laptop running the server
        - on the device, open up that **camera's URL** from step 2
            - You're probably going to get a "WARNING" page that looks [like this](https://github.com/jeff-hykin/survivor_buddy/blob/master/documentation/first_error.jpg)
                - click "more details" (it should look [like this](https://github.com/jeff-hykin/survivor_buddy/blob/master/documentation/first_error_bypass.jpg))
                - then click "explore anyways" to get to the site
            - The view should now look something [like this](https://github.com/jeff-hykin/survivor_buddy/blob/master/documentation/intial_screen.png)
            - Try switching the camera toggle, and follow the instructions in the log
            - Now that both sites are approved, you should be able to click the "Connect to ROSbridge Server"
    5. In a third terminal start rviz `run/3_move_it`
    6. In a fourth terminal run the python code. Either `run/4_python` or run `. ./.env && python ./main/python/main.py`
    7. The default python code should print out stuff about the incoming audio/video data
    8. If you edit the python code (the "when_video_chunk_received" and "when_audio_chunk_received" in `main/python/main.py`), you should be able to use `Robot.move_towards_positions()` to make the robot in rviz move around.
- Deploy to the physical robot
    1. Plug in survivor_buddy's USB cable into your laptop
    2. Make sure it is being detected by running the command `ls /dev/ttyUSB*`, you should see /dev/ttyUSB0 as the output of the previous command.
    3. In a terminal run `run/5_ros_serial`
    4. To test that the microcontroller is receiving commands, in another terminal run `. ./.env && python ./main/python/helper_scripts/physical_test.py`
    5. Now repeat the steps of running on rviz (4 terminals) BUT, this time when you run your python do:<br>`. ./.env && python ./main/python/main.py --send_to_rviz False`
    7. Record a video of your interactions with survivor buddy