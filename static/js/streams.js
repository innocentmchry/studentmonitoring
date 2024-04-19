const APP_ID = '67cfc50c50834b7293ed8598993d29bd'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))

let RESULT
let NAME = sessionStorage.getItem('name')
let EMAIL = sessionStorage.getItem('email')

// object or interface for providing the local client with basic funcs for voice and video calls such as joining stream and publishing tracks or subscrbing to other users tracks
const client = AgoraRTC.createClient({mode: 'rtc', codec:'vp8'})

let videoTrack = []
let audioTrack = []
let remoteUsers = {}
let ADMIN = false

let joinAndDisplayLocalStream = async() => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch(e) {
        console.error(e)
        window.open('/', '_self')
    }

    //Custom Video Track

    // var constraints = window.constraints = { audio: true, video: true};    
    // await navigator.mediaDevices.getUserMedia(constraints)
    //     .then(function(stream) {
    //         // Get all the available video tracks.
    //         var videoTracks = stream.getVideoTracks();
    //         // console.log('Using video device: ' + videoTracks[0].label);

           
    //         videoTrack = AgoraRTC.createCustomVideoTrack({
    //             mediaStreamTrack: videoTracks[0],
    //         });

    //     })
    //     .catch(function(error) {
    //     console.log(error);
    //     });




    videoTrack = await AgoraRTC.createCameraVideoTrack()

    audioTrack = await AgoraRTC.createMicrophoneAudioTrack()

    let member = await createMember()

    let player = `<div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
    <video class="video-player" id="user-${UID}" autoplay ></video>
    </div>`
    
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    const videoContainers = document.querySelectorAll('.video-container')
    numberOfElements = videoContainers.length
    var videoStream = document.getElementById('video-streams')
    
    if (numberOfElements > 9) {
        columns = 4
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`            
    } else if (numberOfElements > 4) {
        columns = 3
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    } else if (numberOfElements > 1){
        columns = 2
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    }
 
    if (member.role == "admin"){
        ADMIN = true
        
        let empty = 1 // let it be empty, empty = 1 (true)

        $.ajax({
            type:'GET',
            url: '/check_empty/',
            success: (response) => {
                empty = response.empty
                if (empty == 0) {
                    var userConfirmed = window.confirm("Would you like to clear the previous meeting data?");
                    if (userConfirmed) {
                        clearData()
                    } else {
                        alert("Clear Data canceled, The previous meeting data will mix up with new meeting data");
                    }
                } 
            },
            error: async(response) => {
                alert("check Empty Error");
            }
        })
        console.log('value of empty is: ' + empty)

      
    } else {
        document.getElementById('side-panel').style.width = '0%';
        document.getElementById('main-panel').style.width = '100%';
    }

    // if instructor then this

    // if (member.role == "admin"){
    //     ADMIN = true
    //     await loadModels(`user-${UID}`, `user-container-${UID}`)
    // }
    // else {
    //     videoTrack.play(`user-${UID}`, {fit : "cover"})
    // }

    // videoTrack.play(`user-${UID}`, {fit : "cover"})
    videoTrack.play(`user-${UID}`)


    setInterval(async () => {

        // ImageData
        const image = videoTrack.getCurrentFrameData();

        // Blob Data
        blob_data = await ImageDataToBlob(image)

        let result = await sendData(blob_data)
        
        if (ADMIN){
            updateEmotion()
        }

        RESULT = result.result
        document.getElementById('result-name').innerText = RESULT
        // console.log(result.result)

    }, 7500)

    // this gonna publish for other users to see
    await client.publish([audioTrack, videoTrack])  
}

let updateEmotion = () => {
    $.ajax({
        type:'GET',
        url: '/get_emotions/',
        success: async (response) => {
            var tableBody = $('#dynamic-table tbody');
            tableBody.empty();
            for (var key in response.users){
                var temp = "<tr><td>"+response.users[key].name+"</td><td>"+response.users[key].curious+"</td><td>"+response.users[key].confusion+"</td><td>"+response.users[key].boredom+"</td><td>"+response.users[key].hopefullness+"</td><td>"+response.users[key].neutral+"</td></tr>"
                tableBody.append(temp)
            }
        },
        error: async(response) => {
            alert("No Data Found");
        }
    })
}






const ImageDataToBlob = function(imageData){
    let w = imageData.width;
    let h = imageData.height;
    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);        // synchronous
  
    return new Promise((resolve) => {
          canvas.toBlob(resolve); // implied image/png format
    });

}

let sendData = async (blob) => {

    // console.log("uid is ", UID)
    let fd = new FormData();
    fd.append("uid", UID);
    fd.append("image", blob);

    let response = await fetch('/predict_member/', {
        method: 'POST',
        body: fd,
        cache: 'no-cache',
        credentials: 'same-origin',
    })
    let result = await response.json()
    return result
}

// let loadModels = async (userId, containerId) => {

//     await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
//         faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
//         faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
//         faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
//     ]);

//     videoTrack.play(userId, {fit : "cover"})
//     imageProcessing(userId, containerId)
// }


// let imageProcessing = (userId, containerId) => {
//     console.log("testt image processing called")
//     const video = document.getElementById(userId)
    
//     const container = document.getElementById(containerId)
//     const canvas = faceapi.createCanvas(video)
//     container.appendChild(canvas)
    
//     // Set the position of the canvas to absolute
//     canvas.style.position = 'absolute';
           
//     // Adjust the top and left properties to overlay the canvas on top of the video
//     canvas.style.top = '0';
//     canvas.style.left = '0';
    
//     let dynamicVideoWidth, dynamicVideoHeight, dynamicDisplaySize

//     setInterval(async () => {
//         const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//         dynamicVideoWidth = video.clientWidth;
//         dynamicVideoHeight = video.clientHeight;
//         canvas.width = dynamicVideoWidth;
//         canvas.height = dynamicVideoHeight;
//         dynamicDisplaySize = { width: dynamicVideoWidth, height: dynamicVideoHeight}
//         faceapi.matchDimensions(canvas, dynamicDisplaySize)
//         //const resizedDetections = faceapi.resizeResults(detections, displaySize)
//         const resizedDetections = faceapi.resizeResults(detections, dynamicDisplaySize)
//         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//         faceapi.draw.drawDetections(canvas, resizedDetections)
//         //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
//         faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
//     }, 300)
// }


let handleUserJoined = async (user, mediaType) => {
    //add the user to remote users
    remoteUsers[user.uid] = user

    // local client object subscribes to the existing users
    await client.subscribe(user, mediaType)


    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)

        // if user already exist
        if(player != null){
            player.remove()
        }

        let member = await getMember(user)

        player = `<div class="video-container" id="user-container-${user.uid}">
        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
        <video class="video-player" id="user-${user.uid}" autoplay></video>
        </div>`




        
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)

        // if (ADMIN){
        //     imageProcessing(`user-${user.uid}`,`user-container-${user.uid}`)
        // }

        const videoContainers = document.querySelectorAll('.video-container')
        numberOfElements = videoContainers.length
        var videoStream = document.getElementById('video-streams')
        
        if (numberOfElements > 9) {
            columns = 4
            videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`            
        } else if (numberOfElements > 4) {
            columns = 3
            videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
        } else if (numberOfElements > 1){
            columns = 2
            videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
        }
    
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }


}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

    const videoContainers = document.querySelectorAll('.video-container')
    numberOfElements = videoContainers.length
    var videoStream = document.getElementById('video-streams')

    if (numberOfElements < 2){
        columns = 1
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    }
    else if (numberOfElements < 5) {
        columns = 2
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    } else if (numberOfElements < 10){
        columns = 3
        videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    }
}

let leaveAndRemoveLocalStream = async () => {
    audioTrack.stop()
    audioTrack.close()
    videoTrack.stop()
    videoTrack.close()

    await client.leave()

    deleteMember()

    if(ADMIN){       
        await calculateSummary()
    }
    else{
        window.open('/summary','_self')
    }

}

let calculateSummary = async () => {
        $.ajax({
            type: 'GET',
            url: '/calculate_summary/',
            success: async (response) => {
                window.open('/summary/', '_self')
            },
            error: async(response) => {
                alert("No Data Found");
            }
    
        })
}

let toggleCamera = async (e) => {
    if(videoTrack.muted){
        await videoTrack.setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else {
        await videoTrack.setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async (e) => {
    if(audioTrack.muted){
        await audioTrack.setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else {
        await audioTrack.setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID': UID, 'email': EMAIL})
    })
    let member = await response.json()
    return member
}

let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID': UID})
    })
    let member = await response.json()

}

let clearData = async () => {  
    let EMAIL = sessionStorage.getItem('email')
    let response = await fetch('/check_admin_clear_data/', {
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({'email': EMAIL})
    })
    let member = await response.json()
    if (member.deleted == 1) {
      alert('Clear Data Successfull!')
    }else {
      alert('Permission Denied, Only Admins can delete')
    }
    
  }



joinAndDisplayLocalStream()

const videoContainers = document.querySelectorAll('.video-container')
numberOfElements = videoContainers.length
var videoStream = document.getElementById('video-streams')

if (numberOfElements > 9) {
    columns = 4
    videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`            
} else if (numberOfElements > 4) {
    columns = 3
    videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
} else if (numberOfElements > 1){
    columns = 2
    videoStream.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
}


// if member closes instead of leave button
// window.addEventListener('beforeunload', deleteMember)

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)