import math
import rospy
from geometry_msgs.msg import TwistStamped
from moveit_msgs.msg import ExecuteTrajectoryActionGoal

goal_pos = []
twist = TwistStamped()

def goal_callback(msg):
    goal_pos = msg.goal.trajectory.joint_trajectory.points[-1].positions
    # take all the values in goal_pos and turn them from rads to degrees
    goal_pos = [math.degrees(x) for x in goal_pos]
    print(goal_pos)
    twist.twist.linear.x = -goal_pos[0]
    twist.twist.linear.y = -goal_pos[1]
    twist.twist.linear.z = goal_pos[2]
    twist.twist.angular.x = -goal_pos[3]

def main():
    rospy.Subscriber('/execute_trajectory/goal', ExecuteTrajectoryActionGoal, goal_callback)
    pub = rospy.Publisher('/sb_cmd_state', TwistStamped, queue_size=10)
    rospy.init_node('send_sb', anonymous=True)
    rate = rospy.Rate(10) # 10hz
    while not rospy.is_shutdown():
        pub.publish(twist)
        rate.sleep()


if __name__ == '__main__':
    try:
        main()
    except rospy.ROSInterruptException:
        pass