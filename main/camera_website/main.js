import { Elemental } from "https://deno.land/x/elementalist@0.5.35/main/deno.js?code"  // this makes writing html easy
import { fadeIn, fadeOut } from "https://deno.land/x/good_component@0.2.14/main/animations.js" // just some boilerplate
import { showToast, showErrorToast } from "https://deno.land/x/good_component@0.2.14/main/actions/show_toast.js" // helpful pop-up tools (google "toast notifiction")
import { Face } from "./helpers/face.js" // this is a more complicated custom element that has animated eyes/expressions
import { fadeAfterNoInteraction } from "./helpers/opacity_helper.js" // this is a timing-helper

// 
// 
// Summary
// 
// 
    // 0. TLDR: You'll care about the "Events" section the most
    //    but I need to go over some other things, so hold on
    //    
    // 1. Aside from adding a library, you probably won't want to edit the index.html
    //    Because, everything in <body> gets replaced. This file (the "Main Code" section near the bottom)
    //    replaces the <body>.
    //    (I'll come back to this)
    // 
    // 2. The Events section
    //    You've got access to at least 
    // 
    //    So if want to add something to the <body>, edit the "Main Code" section like this:
    //        let myThing = html`<div>Howdy Howdy Howdy</div>`
    //        
    //        document.body = html`
    //             <body>
    //                 ${myThing}
    //             </body>
    //        ` 
    //    
    //    If you want to add an html element to the body, its best to do it in that section
    // 2. You can paste html in javascript, for example:
    //         var h1Element = html`
    //             <h1 style="background: white;">
    //                 Howdy, here's a random number: ${Math.random()}
    //             </h1> 
    //         `
    //         document.body.append(h1Element)
    //         // "Howdy" will now show up in the body (if you do it at the very bottom of the file)
    // 3. The Events section at the very boddy is a list of functions.
    //    Each function will be called when a different event happens
    //    (its not magic either, you can find the code that calls those functions)
    //    

// 
// 
// Initialize Globals
// 
// 
    const parameters = {
        defaultPort: 9093,
        audioBufferSize: 2048,
        videoWidth: 640,
        videoHeight: 420,
        frameSendRate: 2000, // 200 means it sends a frame every 200ms (5fps)
                            // NOTE: if this is too fast it can overwhelm the python code!
                            //       make number smaller if python is getting overloaded 
    }
    const rosTopics = {
        audioTopic: null,
        imageTopic: null,
    }

// 
// Custom Elements
// 
    function MessageLog({ ...props }) {
        return MessageLog.element = html`
            <span
                style="padding: 1rem; position: fixed; right: 0; top: 0; height: 100vh; overflow: auto; width: 15rem; background-color: rgba(0,0,0,0.18); border-left: 2px gray solid; box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3); z-index: 998"
                >
                (message log)
            </span>
        `
    }
    MessageLog.showMessage = function (...messages) {
        if (MessageLog.element) {
            const message = messages.join(" ")
            const escapedText = new Option(message).innerHTML
            MessageLog.element.innerHTML += `<br>...<br>...<br>${escapedText.replace(/\n/g,"<br>")}`
            MessageLog.element.scrollTop = MessageLog.element.scrollHeight
        }
    }


    let height
    function CameraSwitch({ children, ...props }) {
        const switchInput = html`<input type="checkbox" value="">`
        const video = html`<video muted style="display: none" autoplay></video>`
        const canvas = html`<canvas style="display: none"></canvas>`
        
        // function that is run once scale the height of the video stream to match the configured target width
        let hasRunOnce = false
        video.addEventListener(
            "canplay",
            function (event) {
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
            // whenever the switch was clicked, run this function
            async function (event) {
                if (cameraTimer == null) {
                    // ros.connect("ws://" + window.location.hostname + ":9090");
                    RosConnecter.setupRosIfNeeded()
                    
                    if (!navigator.mediaDevices) {
                        MessageLog.showMessage(`Error: check the URL<br>Make sure it has "https" and not "http"`)
                    } else {
                        try {
                            cameraStream = await navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: true,
                            })
                            video.srcObject = cameraStream
                            video.play()
                            // whenever the media is loaded, run this function
                            video.onloadedmetadata = function (event) {
                                height = video.videoHeight / (video.videoWidth / parameters.videoWidth)
                                video.setAttribute("width", parameters.videoWidth)
                                video.setAttribute("height", height)
                                canvas.setAttribute("width", parameters.videoWidth)
                                canvas.setAttribute("height", height)
                            }
                        } catch (error) {
                            MessageLog.showMessage(`Looks like there was an issue connecting to the camera. Make sure this browser can actually connect to your camera (for example try logging into Zoom and using "Your Room" and try turning on the camera)`)
                            throw error
                        }

                        try {
                            const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                            const source   = audioCtx.createMediaStreamSource(cameraStream)
                            const recorder = audioCtx.createScriptProcessor(parameters.audioBufferSize, 1, 1)
                            
                            // whenever the switch was clicked, run this function
                            recorder.onaudioprocess = function (event) {
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
                            
                            source.connect(recorder)
                            recorder.connect(audioCtx.destination)
                        } catch (error) {
                            MessageLog.showMessage(`Looks like there was an issue connecting to the microphone. Make sure this browser can actually connect to your camera (for example try logging into Zoom and using "Your Room" and try turning on the camera)`)
                            throw error
                        }
                    }
                    cameraTimer = setInterval(
                        // call takePicture at the frameSendRate
                        function(){
                            takePicture()
                        },
                        parameters.frameSendRate,
                    )
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
                    MessageLog.showMessage("Trying to take a picture but rosTopics.imageTopic is null")
                }
            } else {
                // MessageLog.showMessage("Trying to take a picture")
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
        CameraSwitch.takePicture = takePicture
        
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
    }
    // Singleton component
    function RosConnecter() {
        try {
            const ipAddressInput = html`<input type="text" placeholder="IP Address" value=${"" + window.location.hostname} />`
            const portInput = html`<input type="text" placeholder="Port" value="${parameters.defaultPort}" />`
            const connectButton = html`
                <button class="btn-large waves-effect waves-light" style="margin-top: 1rem; z-index: 999;">
                    Connect to ROSbridge Server
                </button>
            `
            connectButton.addEventListener("click", function(event) {
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
                            MessageLog.showMessage("Success!")
                        })

                        ros.on("error", function (error) {
                            console.log("Error connecting to websocket server: ", error)
                            MessageLog.showMessage(`1. Make sure <code>roslaunch rb_server.launch</code> is running<br>2. Try opening this in a new tab:<br><a href="https://${baseValue}">https://${baseValue}</a><br>3. Click Advanced -> Accept Risk and Continue<br>4.Then re-run this test<br>`)
                            showErrorToast(`Didn't Connect to socket\nSee log ->\n\n(Click to make this go away)`, {position: 'left',})
                        })

                        ros.on("close", function () {
                            RosConnecter.rosIsSetup = false
                            console.log("Connection to websocket server closed.")
                        })
                        
                        afterRosConnected(ros)
                    } catch (error) {
                        MessageLog.showMessage(`error connecting to ROS`)
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
        } catch (error) {
            console.debug(`error is:`,error)
            throw error
        }
    }
// 
// Register custom elements
// 
    const html = Elemental({
        MessageLog,
        CameraSwitch,
        RosConnecter,
        Face,
    })
// 
// 
// Helpers
// 
// 
    // if you want to make helpers, this is a good place to put them
    
// 
// 
// Main Code
// 
// 
    let face = html`<Face height=500 width=3000 style="position: fixed; bottom: 0rem; right: calc(50vw); transform: translateX(50%);" />`
    let controls = html`
        <div
            style="display: flex; position: relative; flex-direction: column; width: 26rem; transform: scale(0.8) translate(-13%, -13%); padding: 2rem; margin: 1rem; border-radius: 12px; background: white; transition: all 0.2s ease-in-out 0s;"
            >
            <CameraSwitch></CameraSwitch>
            <RosConnecter></RosConnecter>
        </div>
    `
    document.body = html`
        <body>
            ${face}
            
            ${controls}
            
            <br />
            <MessageLog></MessageLog>
        </body>
    `

// 
// handle fading out the controls
// 
    const userInteractedWithPageFunc = fadeAfterNoInteraction({
        baseDelaySeconds: 5, 
        opacityLossPerSecond: 0.5,
        callback: function(newOpacity) {
            // reduce the opacity once a certain amount of no-interaction time
            // (newOpacity) will get smaller and smaller with each function call
            controls.style.opacity = newOpacity
            MessageLog.element.style.opacity = newOpacity
        },
    })
    document.body.addEventListener("mouseover", function (event) { userInteractedWithPageFunc() })
    document.body.addEventListener("mousemove", function (event) { userInteractedWithPageFunc() })
    document.body.addEventListener("click", function (event) { userInteractedWithPageFunc() })

// 
// 
// Events
// 
// 
    async function afterReceiveBackendMessage(data) {
        // 
        // EDIT ME
        // 
        console.debug(`data is:`,data)

        let showOnWebpage = false
        if (showOnWebpage) {
            MessageLog.showMessage(JSON.stringify(data))
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
                MessageLog.showMessage(`error parsing message json`)
            }
            afterReceiveBackendMessage(data)
        })
    }

// 
// for debugging
// 
    // (global variables so you can play with them in the browser console)
    window.face           = face
    window.showMessage    = MessageLog.showMessage
    window.showToast      = showToast
    window.showErrorToast = showErrorToast
    window.ROSLIB         = ROSLIB