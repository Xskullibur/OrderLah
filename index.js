
//Hyper parameters

//Server will be listening on port 3000
const port = 3000

const express = require('express')

//Setup express
const app = express()

/**
 * Default GET '/' path
 */
app.get('/', (req, res) => {
    res.send('OrderLah')
})


app.listen(port, () => {
    console.log(`Server is listening ${port}`);
    
})