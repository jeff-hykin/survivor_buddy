#!/usr/bin/env python3

# builtins
import os
import sys
import copy
import math
from time import sleep
from statistics import median, stdev
from math import pi, tau, dist, fabs, cos
import numbers

# packages
import cv2
import geometry_msgs.msg
import moveit_commander
import numpy
import numpy as np
import rospy
import std_msgs
from std_msgs.msg import Float32MultiArray
from std_msgs.msg import String
from cv_bridge import CvBridge, CvBridgeError
from geometry_msgs.msg import TwistStamped
from moveit_msgs.msg import DisplayTrajectory
from sensor_msgs.msg import CompressedImage, Image
from blissful_basics import singleton, LazyDict, Warnings
# Warnings.disable() # uncomment if you want to disable all warnings

sys.path.append(os.path.dirname(__file__))
from project_tools import JointPositions, time_since_prev, clip_value, convert_args

# NOTE: you can edit anything, so if you don't like the structure just change it

config = LazyDict(
    send_to_rviz=True,
    video_width=640,
    video_height=480,
    
    BLAH_BLAH_BLAH_YOUR_VARIABLE_HERE="something",
    # NOTE:
    #  running python ./main/python/main.py --something 99,
)

class Robot:
    status = LazyDict(
        frame_count=0,
        has_initialized=False,
        # EDIT ME, add stuff to your robot status
        # (you dont have to, but it should be helpful)
    )
    
    def when_audio_chunk_received(chunk):
        data = numpy.array(chunk.data)
        print(f'''Audio data chunk shape is: {data.shape}''')
        # NOTE: Units are unknown (try plotting the data)
        
        # 
        # Edit me (example code)
        # 
        if True:
            print(f'''Howdy!''')
            print(f'''      config.BLAH_BLAH_BLAH_YOUR_VARIABLE_HERE = {config.BLAH_BLAH_BLAH_YOUR_VARIABLE_HERE}''')
            print(f'''      config["BLAH_BLAH_BLAH_YOUR_VARIABLE_HERE"] = {config["BLAH_BLAH_BLAH_YOUR_VARIABLE_HERE"]}''')
            print(f'''      config["example_arg"] = {config.get("example_arg",None)}''')
            print(f'''Some info:''')
            print(f'''    Robot.previous_joint_positions are:\n{Robot.previous_joint_positions}''')
            print(f'''sleeping for a moment''')
            sleep(1)
            print(f'''moving robot joints''')
            Robot.move_towards_positions(
                # Note: JointPositions is just a wrapper for these 4 values
                #       it tries to keep the numbers within-bounds, but thats about it 
                #       Example:
                #           JointPositions([0,1,2,3]).torso_joint   # returns 0
                #           JointPositions([0,1,2,3]).neck_swivel   # returns 1
                #           JointPositions([0,1,2,3]).as_list       # returns [0,1,2,3]
                JointPositions(
                    torso_joint=5, # NOTE: units = degrees
                    neck_swivel=5, # <- more negative means more to your left side (the survivor buddy's right side)
                    head_tilt=5, # idk which way is which, but tilt is the "roll" in "yaw, pitch, roll"
                    head_nod=5, # <- more negative = face the cieling
                )
            )
            Robot.tell_camera_server(dict(
                blah_blah_blah="you can send any data here, so long as it is JSON-able (e.g. dict, list, string, None, numbers (but not NaN!))"
            ))
        
    
    def when_video_chunk_received(chunk):
        numpy_image_array = cv2.imdecode(numpy.frombuffer(chunk.data, np.uint8), cv2.IMREAD_COLOR)
        # NOTE: this is not an rgb image ... its a bgr image because openCV is dumb like that
        
        # 
        # Edit me
        # 
        print(f'''numpy_image_array.shape = {numpy_image_array.shape}''')
        
        # uncomment the following to start an interactive python terminal right here
        # (good for debugging and playing with variables)
        # import code
        # code.interact(local={**globals(),**locals()})
        Robot.status.frame_count += 1
        print(f'''frame: {Robot.status.frame_count}, I got a chunk of video: {numpy_image_array.shape}''')
    
    def setup_all_the_boring_boilerplate_stuff():
        # NOTE: read this function if you want to know how ROS actually works
        rospy.init_node('main_survivor_buddy_node', anonymous=True)
        
        Robot.joint_publisher = rospy.Publisher(
            "/sb_cmd_state",
            TwistStamped,
            queue_size=20
        )
        Robot.face_publisher = rospy.Publisher(
            "/camera_server/do_something",
            std_msgs.msg.String,
            queue_size=5,
        )
        if config.send_to_rviz:
            Robot.movement_publisher = rospy.Publisher(
                "/move_group/display_planned_path",
                DisplayTrajectory,
                queue_size=20
            )
        rospy.loginfo("Node started.")

        Robot.twist_obj = TwistStamped()
        Robot.previous_joint_positions = JointPositions(
            torso_joint=0, # degrees not radians
            neck_swivel=0, # degrees not radians
            head_tilt=0, # degrees not radians
            head_nod=0, # degrees not radians
        )
        if config.send_to_rviz:
            Robot.robot = moveit_commander.RobotCommander()
            Robot.scene = moveit_commander.PlanningSceneInterface()

            Robot.group_name = "survivor_buddy_head"
            Robot.move_group = moveit_commander.MoveGroupCommander(Robot.group_name)
        
            Robot.previous_joint_positions = JointPositions(Robot.move_group.get_current_joint_values())
            Robot.display_trajectory = DisplayTrajectory()
        
        Robot.has_initialized = True
        
        # 
        # setup listeners
        # 
        if True:
            Robot.audio_subscriber = rospy.Subscriber(
                "/audio",
                Float32MultiArray,
                callback=Robot.when_audio_chunk_received,
                queue_size=1
            )
            Robot.camera_subscriber = rospy.Subscriber(
                "/camera/image/compressed",
                CompressedImage,
                callback=Robot.when_video_chunk_received,
                queue_size=1
            )
    
    def tell_camera_server(data):
        # NOTE: you probably dont want to edit me
        import json
        Robot.face_publisher.publish(
            std_msgs.msg.String(
                json.dumps(data)
            )
        )
    
    def move_towards_positions(joint_goals, *, wait=False):
        # NOTE: you probably dont want to edit me
        if not isinstance(joint_goals, JointPositions):
            raise Exception(f'''
                When calling Robot.move_towards_positions()
                    make sure the first argument is a JointPositions object
                    Ex:
                        Robot.move_towards_positions(
                            JointPositions(
                                torso_joint=5, # NOTE: units = degrees
                                neck_swivel=5, # <- more negative means more to your left side (the survivor buddy's right side)
                                head_tilt=5, # idk which way is which, but tilt is the "roll" in "yaw, pitch, roll"
                                head_nod=5, # <- more negative = face the cieling
                            )
                        )
            ''')
        
        joint_goals = JointPositions(joint_goals.as_list)
        torso_change = Robot.previous_joint_positions.torso_joint - joint_goals.torso_joint
        
        if not config.send_to_rviz:
            Robot.twist_obj.twist.linear.x  = -joint_goals.torso_joint
            Robot.twist_obj.twist.linear.y  = -joint_goals.neck_swivel
            Robot.twist_obj.twist.linear.z  =  joint_goals.head_tilt
            Robot.twist_obj.twist.angular.x = -joint_goals.head_nod
            Robot.joint_publisher.publish(Robot.twist_obj)
            Robot.previous_joint_positions = joint_goals
        else:
            joint_current = Robot.move_group.get_current_joint_values()
            
            joint_current[0] = joint_goals.torso_joint
            joint_current[1] = joint_goals.neck_swivel
            joint_current[2] = joint_goals.head_tilt
            joint_current[3] = joint_goals.head_nod
            
            joint_current = tuple(joint_current)
            # this gets rid of standing-still "jitter"
            if all(prev == current for prev, current in zip(Robot.previous_joint_positions.as_list, joint_current)):
                return
            else:
                Robot.previous_joint_positions = JointPositions(joint_current)
            
            Robot.move_group.go(joint_current, wait=wait)
            plan = Robot.move_group.plan()
            Robot.move_group.stop()
            
            if config.send_to_rviz: # its a lot faster/smoother movement when not enabling simulation
                Robot.display_trajectory = DisplayTrajectory()
                Robot.display_trajectory.trajectory_start = Robot.robot.get_current_state()
                Robot.movement_publisher.publish(Robot.display_trajectory)

            # execute plan
            Robot.move_group.execute(plan[1], wait=wait)


# 
# commandline arguments
# 
if True:
    # convert stuff like "--send_to_rviz False" into { "send_to_rviz": False }
    arg_list, cli_args_as_dict = convert_args(sys.argv)
    # make the cli args override the config
    config.update(cli_args_as_dict)

# Starting point of everything
Robot.setup_all_the_boring_boilerplate_stuff()
moveit_commander.roscpp_initialize([])
rospy.spin()