
/**
 * Setup debugging purpose
 */

const cors = require('cors')
const uuid_middleware = require('./libs/uuid_middleware')

module.exports = {
    debugSetup: (app) => {
        //Set route for debugging
        if(process.env.NODE_ENV === 'dev'){
            app.use(cors({ origin: 'localhost:3000', credentials: true}))
            /**
             * GET '/csrf' path, get CSRF token 
             */
            app.get('/csrf-token-debug', uuid_middleware.generate, uuid_middleware.debug)
        }
    }
}