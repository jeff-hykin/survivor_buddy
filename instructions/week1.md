# Learning the ropes

## Due when?

In person by Fri Feb 9

## What needs to be done

- Run the `run/check` command (which will ask/tell you some stuff)
- Be ready to demonstrate any of the tasks (below) to me
    - Alternatively, submit a screen recording of **all** of the tasks

## Tasks

- Show the Happy eye expression using the browser
- Demo how to debug python using the inline interactive python terminal
- Audio threshold message (demo of knowing how to receive audio)
- Create a curious / look-around action for the robot (look left and right)
- Send a message from python to the eyes/face (demo of knowing communication through ROS)

## How to do the things:

- Setup (85% of the work)
    - It takes time so either work on this early, or come to lab (EABC) Friday morning to get the process started
    - Getting Linux
        - Note: if this step ends up being a problem for you, bring a ≥32Gb (USB 3.1 or 3.2) flashdrive. I have a pre-setup bootable flash drive you can clone (takes 1hr to clone).
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
                - login to github on a web browser
                - go to your account settings
                - go to "SSH and GPG keys"
                - click "New ssh key"
                - enter any title you want
                - paste the output of the cat command into the main box
                - save
        2. Run `git clone YOUR_SSH_URL` [click here on your repo for your ssh url](https://github.com/jeff-hykin/tamu_csce_635_labs/blob/master/lab1/documentation/git_ssh_url.png) and cd into your repo
        3. Cd into lab1. E.g. `cd ~/YOUR_REPO_NAME/lab1`
        4. Run this command `run/install_stuff`
        5. Once it finishes, everything you need for lab 1 should be installed
    - Test Rviz
        1. cd into lab1, e.g. (E.g. `cd ~/YOUR_REPO_NAME/lab1`)
        2. start rviz, `run/3_move_it`
        3. run `. ./.env && python3 ./main/python/helper_scripts/rviz_test.py`
        4. type in some test positions and see if bot moves inside of Rviz
    - Run Survivor Buddy Code
        1. as always, cd into lab1, e.g. (E.g. `cd ~/YOUR_REPO_NAME/lab1`)
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
        6. In a fourth terminal run the python code. Either `run/4_python` or run `. ./.env && python3 ./main/python/main.py`
        7. The default python code should print out stuff about the incoming audio/video data
        8. If you edit the python code (the "when_video_chunk_received" and "when_audio_chunk_received" in `main/python/main.py`), you should be able to use `Robot.move_towards_positions()` to make the robot in rviz move around.
- Tasks
    - Note: for week1, you can get help from anyone on this. E.g. ask the people around you how to do these things.
    - show the Happy eye expression (e.g. just demo using the API) 
        - open the `lab1/main/camera_website/main.js` file and read the giant comment at the top
    - Inline interactive python repl (e.g. demo how to debug)
        - inside `lab1/main/python/main.py` there is a commented-out `import code` find it, play around with it, maybe read the python documentation on it
    - Audio threshold message (demo of knowing how to receive audio)
        - in the `main.py` theres a "when_audio_chunk_received" use that to print a threshold when audio is over a certain volume
        - the audio array is a bunch of amplitudes (in chronological order), and it should always have a length of 2048. Try and detect/guess the max/min value.
    - Curious / look-around action (demo of knowing how to move motors in rviz)
        - Needs to involve at least 2 motors
        - Use the `Robot.move_towards_positions` inside of main.py. 
    - Log a face communication message (demo of knowing communication through ROS)
        - Read the main.py and see if you can find how to send a message to the camera server when loud audio is detected
        - On the camera server, find the `showOnWebpage` and change it so that your message from python will show up 
