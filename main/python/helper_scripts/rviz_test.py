import math

import rospy
import moveit_commander
from moveit_msgs.msg import DisplayTrajectory

group_name = "survivor_buddy_head"
publisher_path = "/move_group/display_planned_path"

# 
# boilerplate
# 
movement_publisher = rospy.Publisher(
    publisher_path,
    DisplayTrajectory,
    queue_size=20
)
robot = moveit_commander.RobotCommander()
scene = moveit_commander.PlanningSceneInterface()
move_group = moveit_commander.MoveGroupCommander(group_name)
previous_joint_positions = move_group.get_current_joint_values()
display_trajectory = DisplayTrajectory()

# 
# helpers
# 
def get_current_joints():
    return [ math.degrees(each_in_radians) for each_in_radians in move_group.get_current_joint_values() ]

def go_to_positions(positions):
    move_group.go(tuple(math.radians(each) for each in positions), wait=False)    

# 
# cli loop 
# 
print(f'''Type q [Enter] to quit''')
while 1:
    joint_current = get_current_joints()
    response = input("\nEnter joint positions. Units=degrees. (space or comma separated)\n")
    if response.lower() == 'q' or response.lower() == 'quit' or response.lower() == 'exit':
        break
    
    chunks = [""]
    for each in response:
        is_valid = each == "." or each == "-" or each.isdigit()
        if not is_valid:
            chunks.append("")
        if is_valid:
            chunks[-1]+=each
    
    if len(chunks[-1]) == 0:
        chunks.pop()
    
    new_joints = [ float(each) for each in chunks ]
    new_joints = new_joints[0:4]
    for index, each in enumerate(new_joints):
        if each == each:
            joint_current[index] = each
    
    new_joints = joint_current
    go_to_positions(new_joints)