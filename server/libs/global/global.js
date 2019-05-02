/**
 * Set/Retrieve a global object
 */

 module.exports = {
     put: (key, value) => {
         global[key] = value
     },
     get: (key) => global[key]
 }