'use strict';

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

function environment() {
    let clientId = 'AazJKzsDqoiA6ApXquTum5zTKDC4QmPlbzZXG8YCwmnoQyzPviV8q-2-JBrXbhh-VXS_Nutq8sp4ybGc'
    let clientSecret = 'EBQDifpjwCyCCB3LNgKqSexOA3cigW6GJ1Kuf-FiDuOmMZeHEgPyYtzXrK2kKyf7LyxIF72AKJQEeMOL'

    return new checkoutNodeJssdk.core.SandboxEnvironment(
        clientId, clientSecret
    )
}

async function prettyPrint(jsonData, pre=""){
    let pretty = "";
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    for (let key in jsonData){
        if (jsonData.hasOwnProperty(key)){
            if (isNaN(key))
                pretty += pre + capitalize(key) + ": ";
            else
                pretty += pre + (parseInt(key) + 1) + ": ";
            if (typeof jsonData[key] === "object"){
                pretty += "\n";
                pretty += await prettyPrint(jsonData[key], pre + "    ");
            }
            else {
                pretty += jsonData[key] + "\n";
            }
        }
    }
    return pretty;
}

module.exports = {client: client, prettyPrint:prettyPrint};