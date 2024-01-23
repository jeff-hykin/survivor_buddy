# 
# base installation
# 
    # 
    # install deno
    # 
    curl -fsSL https://deno.land/x/install/install.sh | sh
    export PATH="$HOME/.deno/bin:$PATH"
    deno install -A https://deno.land/x/denoliver/mod.ts
    # archy
    deno install -n archy -A https://deno.land/x/archaeopteryx/mod.ts # version 1.0.7

    # 
    # install stuff for a nodejs version
    # 
    sudo apt-get update && \
    sudo apt-get install -y curl && \
        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

    echo "disabling firewall"
    sudo ufw disable

    # 
    # install ROS and Moveit
    # 
    ./ros_install_noetic.sh && \
        sudo apt-get update && \
        sudo apt-get install -y \
            python3-pip \
            ros-noetic-rosbridge-suite \
            python3-rosdep \
            ros-noetic-moveit \
            ros-noetic-moveit-commander \
            ros-noetic-rosserial \
            nodejs \
            npm

    # install http-server
    npm install --global http-server


# 
# source stuff
# 
    . ./.env
# 
# catkin make if needed
# 
if ! [ -n "$(command -v "catkin_make")" ]
then
    echo "looks like there was an issue with the install because I dont see a catkin_make command"
else
    export catkin_dir="./support/catkin_ws"
    # if doesn't exist, make it
    if ! [ -d "$catkin_dir/devel" ]
    then
        builtin cd "$catkin_dir"
        catkin_make
        sudo rosdep init
        rosdep update
        
        rosdep install --from-paths src --ignore-src -r -y
        builtin cd - 1>/dev/null
    fi
fi