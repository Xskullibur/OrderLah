
import QrScanner from "./vendor/qrscanner/qr-scanner.min.js";
QrScanner.WORKER_PATH = '../js/vendor/qrscanner/qr-scanner-worker.min.js';

const video = document.getElementById('qr-video');
video.addEventListener('leavepictureinpicture', function(){
    stopScanning()
})

video.onloadeddata = function(){
    requestPIP()
    console.log("close")
}

function setResult(result) {
    alert(result)
}

// ####### Web Cam Scanning #######
//Causing error
// QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);

const scanner = new QrScanner(video, result => setResult(result));
scanner.start()

let isScanning = false;

function startScanning(){
    isScanning = true;
    scanner.setInversionMode('both');
    scanner.start();
}

function stopScanning(){
    isScanning = false;
    scanner.stop();
    if(document.pictureInPictureEnabled){document.exitPictureInPicture();}
}

async function requestPIP(){
    if(document.pictureInPictureEnabled){
        //PIP is enabled
        //Request 
        await video.requestPictureInPicture()
    }
    else{
        video.removeAttribute('hidden')
        
    }
}

function toggleScanning(){
    if(isScanning){
        stopScanning();
    }else{
        startScanning();
    }
}

window.toggleScanning = toggleScanning
window.startScanning = startScanning
window.requestPIP = requestPIP

export {toggleScanning}