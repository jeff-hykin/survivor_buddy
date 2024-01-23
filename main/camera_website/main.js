import { Elemental } from "https://deno.land/x/elementalist@0.5.35/main/deno.js?code"
import { fadeIn, fadeOut } from "https://deno.land/x/good_component@0.2.12/main/animations.js"

// 
// 
// Summary
// 
// 
    // 0. You'll probably care about the "Events" section the most
    //    but I need to go over some other things, so hold on
    // 1. This javascript file replaces everything in the UI (the html body) at the very bottom of the file
    //    If you want to add an html element to the body, do it at the bottom of this file
    // 2. You can create html in javascript, for example:
    //         var h1Element = html`
    //             <h1 style="background: white;">
    //                 Howdy, here's a random number: ${Math.random()}
    //             </h1> 
    //         `
    //         document.body.append(h1Element)
    //         // "Howdy" will now show up in the body (if you do it at the very bottom of the file)

// 
// 
// Initialize Globals
// 
// 
    const parameters = {
        defaultPort: 9093,
        audioBufferSize: 2048,
        frameSendRate: 200, // 200 means it sends a frame every 200ms (5fps)
                            // NOTE: if this is too fast it can overwhelm the python code!
                            //       make number smaller if python is getting overloaded 
    }
    const rosTopics = {
        audioTopic: null,
        imageTopic: null,
    }

// 
// 
// Events
// 
// 
    async function afterReceiveBackendMessage(data) {
        // EDIT ME
        console.debug(`data is:`,data)

        let showOnWebpage = false
        if (showOnWebpage) {
            showMessage(JSON.stringify(data))
        }
    }
    
    // the function below gets run after the UI button is pressed AND ros is actually able to connect
    async function afterRosConnected(ros) {
        // NOTE: you probably dont need to edit this function
        //       read it if you want to know how ros works

        // 
        // setup topics
        // 
        rosTopics.audioTopic = new ROSLIB.Topic({
            ros: ros,
            name: "/audio",
            messageType: "std_msgs/Float32MultiArray",
        })
        
        rosTopics.imageTopic = new ROSLIB.Topic({
            ros: ros,
            name: "/camera/image/compressed",
            messageType: "sensor_msgs/CompressedImage",
        })
        
        // 
        // listen for incoming data
        // 
        new ROSLIB.Topic({
            ros : ros,
            name : '/camera_server/do_something', // NOTE: this needs to be the same as the string in the python code
            messageType : 'std_msgs/String'
        }).subscribe((message) => {
            let data 
            try {
                data = JSON.parse(message.data)
            } catch (error) {
                showMessage(`error parsing message json`)
            }
            afterReceiveBackendMessage(data)
        })
    }

// 
// Register Custom Elements
// 
    const html = Elemental({
        // NOTE: this is a singleton component
        MessageLog({ children, ...props }) {
            const element = html`
                <span id="messageLog"
                    style="padding: 1rem; position: fixed; right: 0; top: 0; height: 100vh; overflow: auto; width: 15rem; background-color: rgba(0,0,0,0.18); border-left: 2px gray solid; box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3); z-index: 998"
                    >
                    (message log)
                </span>
            `
            MessageLog.element = element
            return element
        },
        // NOTE: this is a singleton component
        CameraSwitch({ children, ...props }) {
            const switchInput = html`<input type="checkbox" value="">`
            const video = html`<video muted style="display: none" autoplay></video>`
            const canvas = html`<canvas style="display: none"></canvas>`
            
            // function that is run once scale the height of the video stream to match the configured target width
            let hasRunOnce = false
            video.addEventListener(
                "canplay",
                (event) => {
                    if (!hasRunOnce) {
                        height = video.videoHeight / (video.videoWidth / parameters.videoWidth)
                        video.setAttribute("width", parameters.videoWidth)
                        video.setAttribute("height", height)
                        canvas.setAttribute("width", parameters.videoWidth)
                        canvas.setAttribute("height", height)
                        hasRunOnce = true
                    }
                },
                false
            )
            
            let cameraTimer = null
            let cameraStream = null
            switchInput.addEventListener(
                "click",
                async (event) => {
                    if (cameraTimer == null) {
                        // ros.connect("ws://" + window.location.hostname + ":9090");
                        RosConnecter.setupRosIfNeeded()
                        
                        if (!navigator.mediaDevices) {
                            showMessage(`Error: check the URL<br>Make sure it has "https" and not "http"`)
                        } else {
                            try {
                                cameraStream = await navigator.mediaDevices.getUserMedia({
                                    video: true,
                                    audio: true,
                                })
                                video.srcObject = cameraStream
                                video.play()
                                video.onloadedmetadata = (event) => {
                                    height = video.videoHeight / (video.videoWidth / parameters.videoWidth)
                                    video.setAttribute("width", parameters.videoWidth)
                                    video.setAttribute("height", height)
                                    canvas.setAttribute("width", parameters.videoWidth)
                                    canvas.setAttribute("height", height)
                                }
                            } catch (error) {
                                showMessage(`Looks like there was an issue connecting to the camera. Make sure this browser can actually connect to your camera (for example try logging into Zoom and using "Your Room" and try turning on the camera)`)
                                throw error
                            }

                            try {
                                const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                                const source   = audioCtx.createMediaStreamSource(cameraStream)
                                const recorder = audioCtx.createScriptProcessor(parameters.audioBufferSize, 1, 1)
                                
                                recorder.onaudioprocess = (event) => {
                                    rosTopics.audioTopic.publish(
                                        new ROSLIB.Message({
                                            data: Array.from(
                                                new Float32Array(
                                                    event.inputBuffer.getChannelData(0)
                                                )
                                            ),
                                        })
                                    )
                                }
                                
                                // source.connect(recorder)
                                // recorder.connect(audioCtx.destination)
                            } catch (error) {
                                showMessage(`Looks like there was an issue connecting to the microphone. Make sure this browser can actually connect to your camera (for example try logging into Zoom and using "Your Room" and try turning on the camera)`)
                                throw error
                            }
                        }
                        cameraTimer = setInterval(() => takePicture(), parameters.frameSendRate)
                    } else {
                        ros.close()
                        cameraStream.stop()
                        hasRunOnce = false
                        takePicture() // blank the screen to prevent last image from staying
                        clearInterval(cameraTimer)
                        cameraTimer = null
                    }
                },
                false
            )
            
            // function that is run by trigger several times a second
            // takes snapshot of video to canvas, encodes the images as base 64 and sends it to the ROS topic
            function takePicture() {
                if (!rosTopics.imageTopic) {
                    if (RosConnecter.rosIsSetup) {
                        showMessage("Trying to take a picture but rosTopics.imageTopic is null")
                    }
                } else {
                    // showMessage("Trying to take a picture")
                    canvas.width = parameters.videoWidth
                    canvas.height = height

                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)

                    var data = canvas.toDataURL("image/jpeg")
                    var a = document.createElement("a")
                    a.href = data
                    var imageMessage = new ROSLIB.Message({
                        format: "jpeg",
                        data: data.replace("data:image/jpeg;base64,", ""),
                    })

                    rosTopics.imageTopic.publish(imageMessage)
                }
            }
            
            return html`
                <div class="switch"
                    style="margin-bottom: 2rem; width: 100%; display: flex; justify-content: space-between; align-items: center;">
                    <h5>
                        Activate Camera
                    </h5>
                    ${video}
                    <label>
                        ${switchInput}
                        <span class="lever"></span>
                    </label>
                </div>
            `
        },
        // Singleton component
        RosConnecter() {
            const ipAddressInput = html`<input type="text" placeholder="IP Address" value=${"" + window.location.hostname} />`
            const portInput = html`<input type="text" placeholder="Port" value="${parameters.defaultPort}" />`
            const connectButton = html`
                <button class="btn-large waves-effect waves-light" style="margin-top: 1rem; z-index: 999;">
                    Connect to ROSbridge Server
                </button>
            `
            connectButton.addEventListener("click", (event) => {
                RosConnecter.setupRosIfNeeded()
            })
            
            RosConnecter.setupRosIfNeeded = function () {
                if (!RosConnecter.rosIsSetup) {
                    // 
                    // create websocket URL
                    // 
                    let ipAddress = ipAddressInput.value
                    let port      = portInput.value
                    
                    // 
                    // check ipAddress
                    // 
                    if (ipAddress == "") {
                        // default to localhost if no ip address is provided
                        ipAddress = window.location.hostname
                        if (ipAddress == "localhost") {
                            ipAddress = "127.0.0.1"
                        }
                        if (ipAddress == "127.0.0.1") {
                            window.alert(`Note: your connection should be something other than localhost (aka 127.0.0.1).\n\nI'll still let you try with localhost but just note that the public facing address should be used instead.`)
                        }
                    }
                    
                    const baseValue = `${ipAddress}:${port}`
                    const url = `wss://${ipAddress}:${port}`
                    console.log(`Attempting to connect to: ${url}`)
                    
                    // 
                    // connect
                    // 
                    try {
                        const ros = new ROSLIB.Ros({
                            url: url,
                        })
                        
                        ros.on("connection", function () {
                            console.log("Connected to websocket server.")
                            RosConnecter.rosIsSetup = true
                            showMessage("Success!")
                        })

                        ros.on("error", function (error) {
                            console.log("Error connecting to websocket server: ", error)
                            showMessage(`1. Make sure <code>roslaunch rb_server.launch</code> is running<br>2. Try opening this in a new tab:<br><a href="https://${baseValue}">https://${baseValue}</a><br>3. Click Advanced -> Accept Risk and Continue<br>4.Then re-run this test<br>`)
                        })

                        ros.on("close", function () {
                            RosConnecter.rosIsSetup = false
                            console.log("Connection to websocket server closed.")
                        })
                        
                        afterRosConnected(ros)
                    } catch (error) {
                        showMessage(`error connecting to ROS`)
                        console.error(`The error below is probably because of a url issue\nThe url given to ROS was: ${url}`)
                        console.error(error)
                    }
                    
                }
            }
            return html`
                <div>
                    <label for="ip">IP Address</label>
                    ${ipAddressInput}

                    <label for="port">Port</label>
                    ${portInput}

                    ${connectButton}
                </div>
            `
        },
    })
// 
// 
// Helpers
// 
// 
    function showMessage(message) {
        if (MessageLog.element) {
            MessageLog.element.innerHTML += `<br>...<br>...<br>${message}`
            MessageLog.element.scrollTop = MessageLog.element.scrollHeight
        }
    }
    
// 
// 
// Main Code
// 
// 
    document.body = html`
        <body>
            <div
                style="display: flex; position: relative; flex-direction: column; width: 26rem; transform: scale(0.8) translate(-13%, -13%); padding: 2rem; margin: 1rem; border-radius: 12px;"
                >
                <CameraSwitch></CameraSwitch>
                <RosConnecter></RosConnecter>
            </div>
            
            <br />
            <MessageLog></MessageLog>
        </body>
    `