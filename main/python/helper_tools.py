import sys
import os
from os.path import isabs, isfile, isdir, join, dirname, basename, exists, splitext
from os import remove, getcwd, makedirs, listdir, rename, rmdir
from shutil import move
import glob
import random
import math
import time


logging = False

# 
# basics
# 
if True:
    def clip_value(value, minimum, maximum):
        if value < minimum:
            value = minimum
        if value > maximum:
            value = maximum
        return value
    
    prev_time = time.time()
    def time_since_prev():
        """
        Example:
            time_since_prev()
            sleep(0.5) # seconds
            print(time_since_prev()) # prints 0.5 (approximately)
        """
        global prev_time
        now = time.time()
        output = now - prev_time
        prev_time = now
        return output

# 
# joints
# 
class JointPositions:
    """
        Note:
            Everything is in degrees
    """
    torso_joint_max = 40 
    torso_joint_min = -40 
    neck_swivel_max = 40 
    neck_swivel_min = -40 
    head_tilt_max = 40 
    head_tilt_min = -40
    head_nod_max = 40 
    head_nod_min = -40
    
    def __init__(self, list_input=None, *, torso_joint=None, neck_swivel=None, head_tilt=None, head_nod=None,):
        if isinstance(list_input, type(None)):
            self.torso_joint = torso_joint
            self.neck_swivel = neck_swivel
            self.head_tilt   = head_tilt
            self.head_nod    = head_nod
        else:
            self.torso_joint = list_input[0]
            self.neck_swivel = list_input[1]
            self.head_tilt   = list_input[2]
            self.head_nod    = list_input[3]
        
        # ensure within acceptable ranges   
        self.clip_values()
    
    def clip_values(self):
        self.torso_joint  = clip_value(self.torso_joint, minimum=self.torso_joint_min, maximum=self.torso_joint_max)
        self.neck_swivel  = clip_value(self.neck_swivel, minimum=self.neck_swivel_min, maximum=self.neck_swivel_max)
        self.head_tilt    = clip_value(self.head_tilt  , minimum=self.head_tilt_min  , maximum=self.head_tilt_max  )
        self.head_nod     = clip_value(self.head_nod   , minimum=self.head_nod_min   , maximum=self.head_nod_max   )
        return self
    
    @property
    def as_list(self):
        self.clip_values()
        return [
            self.torso_joint,
            self.neck_swivel,
            self.head_tilt,
            self.head_nod,
        ]
    
    def __repr__(self):
        return f"[ torso_joint={self.torso_joint:.0f}°, neck_swivel={self.neck_swivel:.0f}°, head_tilt={self.head_tilt:.0f}°, head_nod={self.head_nod:.0f}°,  ]"


# 
# cli tool
# 
def convert_args(raw_args):
    """
    Example:
        convert_args(["arg1","-f", "--something", "10"])
        # returns:
        ["arg1"], { "f":True, "something": 10 }
    
    Summary:
        takes sys.argv as an argument
        for example something like `python main.py arg1 -f --something 10`
        and turns it into ["arg1"], { "f":True, "something": 10 }
        
        Single dash means a boolean flag
        Double dash means its a key-value pair
    
    Details:
        Returns a list and a dictionary with positional and keyword arguments.

        -This function assumes flags must start with a "-" and and cannot be a 
            number (but can include them).
        
        -Flags should either be followed by the value they want to be associated 
            with (i.e. -p 5) or will be assigned a value of True in the dictionary.

    """
    from collections import defaultdict
    def str_is_float(string):
        try:
            float(string)
            return True
        except ValueError:
            return False
    
    def str_is_int(string):
        return string.lstrip('+-').isdigit()
    
    
    args = []
    kwargs = defaultdict(lambda *args: None)
    count = 0
    
    raw_args = list(raw_args)
    while len(raw_args) > 0:
        next_raw_argument = raw_args.pop(0)
        # If the current argument starts with "-", then it's a key
        if next_raw_argument.startswith('--'):
            if len(raw_args) == 0:
                raise Exception(f'''
                    
                    This argument: {next_raw_argument}
                    expects a value after it (-key value), however it was the last argument
                    Maybe you meant: -{next_raw_argument}
                    (which is just a flag, e.g. no value)
                    
                ''')
            
            next_arg_is_possibly_negative_number = False
            try:
                float(raw_args[0])
                next_arg_is_possibly_negative_number = True
            except Exception as error: pass
            
            if raw_args[0].startswith('-') and not next_arg_is_possibly_negative_number:
                raise Exception(f'''
                    
                    This argument: {next_raw_argument}
                    expects a value after it (-key value)
                    However it was follow by another key/flag (--key {raw_args[0]})
                    Maybe this would be valid: -{next_raw_argument} {raw_args[0]}
                    (which is just a flag, e.g. no value)
                    
                ''')
            # consume the next element as the value
            kwargs[next_raw_argument] = raw_args.pop(0)
        # its a flag
        elif next_raw_argument.startswith("-") and not str_is_float(next_raw_argument):
            kwargs[next_raw_argument] = True
        # Else, it's a positional argument without flags
        else:
            args.append(next_raw_argument)
    
    # 
    # convert number arguments to be numbers
    # 
    for each_index, each_value in enumerate(list(args)):
        if str_is_int(each_value):
            args[each_index] = int(each_value)
        if str_is_float(each_value):
            args[each_index] = float(each_value)
        if each_value.lower() == "false":
            args[each_index] = False
        if each_value.lower() == "true":
            args[each_index] = True
        if each_value.lower() == "none":
            args[each_index] = None
    for each_key, each_value in kwargs.items():
        if isinstance(each_value, str):
            if str_is_int(each_value):
                kwargs[each_key] = int(each_value)
            if str_is_float(each_value):
                kwargs[each_key] = float(each_value)
            if each_value.lower() == "false":
                kwargs[each_key] = False
            if each_value.lower() == "true":
                kwargs[each_key] = True
            if each_value.lower() == "none":
                kwargs[each_key] = None
    
    # 
    # make the -name vs -name irrelevent 
    # 
    for each_key, each_value in list(kwargs.items()):
        if isinstance(each_key, str):
            if each_key.startswith("--"):
                del kwargs[each_key]
                kwargs[each_key[2:]] = each_value
            elif each_key.startswith("-"):
                del kwargs[each_key]
                kwargs[each_key[1:]] = each_value
            else:
                kwargs[each_key] = each_value
    
    return args, kwargs