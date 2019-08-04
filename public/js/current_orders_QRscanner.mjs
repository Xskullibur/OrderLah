import QrScanner from "./vendor/qrscanner/qr-scanner.min.js";
QrScanner.WORKER_PATH = '../js/vendor/qrscanner/qr-scanner-worker.min.js';


let isScanning = false;
let scanner = null

        
const video = document.getElementById('qr-video');
video.addEventListener('leavepictureinpicture', function(){
    stopScanning()
})

video.onloadeddata = function(){
    requestPIP()
    console.log("close")
}

const initQRScanner = function(setResult){

    // ####### Web Cam Scanning #######
    //Causing error
    // QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);

    scanner = new QrScanner(video, result => {
        if (resultSent != result) {
            resultSent = result
            setResult(result)
        }
    });
    //scanner.start()

}

function requestPIP(){
    if(document.pictureInPictureEnabled){
        //PIP is enabled
        //Request 
        video.requestPictureInPicture().then(_ => {}).catch(err=>{})
    }
    else{
        video.removeAttribute('hidden')
    }
}

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

function toggleScanning(){
    if(isScanning){
        stopScanning();
    }else{
        startScanning();
    }
}

export {toggleScanning, initQRScanner}