
const mathjs = require('mathjs')

/**
 * This class implements the singular-value decomposition type of factorization
 * The factorization matrix P & Q is not computed by finding the eigenvalues and eigenvectors,
 * but using stochastic gradient descent to find the minimum weights
 * yet also alson pls test this thanks. dont have to know what I wrote
 * @param {*} R 
 * @param {*} K 
 * @param {*} alpha 
 * @param {*} iterations 
 */
function SVD_Optimizer(R, K, alpha, iterations){
    this.R = R
    this.K = K
    this.alpha = alpha
    this.iterations = iterations

    this.num_users = R.length
    this.num_items = R[0].length

    this.train = function(){
        //Normal distribution random
        this.P = []
        this.Q = []

        let scale = 1.0/this.K

        //Generate a Users x K matrix
        for (let i = 0; i < this.num_users; i++) {
            this.P[i] = []
            for (let j = 0; j < this.K; j++) {
                this.P[i][j] = randn(1.0/this.K)
            }
        }

        //Generate a Items x K matrix
        for (let i = 0; i < this.num_items; i++) {
            this.Q[i] = []
            for (let j = 0; j < this.K; j++) {
                this.Q[i][j] = randn(1.0/this.K)
            }
        }

        //Get list of training data
        this.training_data = []
        for (let i = 0; i < this.num_users; i++) {
            for (let j = 0; j < this.num_items; j++) {
                if(this.R[i][j] > 0)this.training_data.push({i, j, rating: this.R[i][j]})
            }
        }

        //SGD
       let training_process = []
       for (let i = 0; i < this.iterations; i++) {
           shuffle(this.training_data)
           this.sgd()
           let mse = this.mse()
           training_process.push({i, mse})
           console.log(`Iteration ${i+1}, MSE: ${mse}`);
           
       }


    }

    this.mse = function(){
        let pR = this.getRatingMatrix()
        let sumError = 0
        for (let i = 0; i < this.num_users; i++) {
            for (let j = 0; j < this.num_items; j++) {
                if(this.R[i][j] > 0)sumError += Math.pow(this.R[i][j] - pR[i][j], 2)
            }
        }
        return Math.sqrt(sumError)
    }

    this.sgd = function(){
        for (let iterCount = 0; iterCount < this.training_data.length; iterCount++) {
            let {i, j, rating} = this.training_data[iterCount]
            let prediction = this.getRating(i, j)
            let error = rating - prediction

            for (let l = 0; l < this.P[i].length; l++) {
                this.P[i][l] += this.alpha * this.Q[j][l] * (error - this.P[i][l] * this.Q[j][l])
            }
            for (let l = 0; l < this.Q[i].length; l++) {
                this.Q[j][l] += this.alpha * this.P[i][l] *(error - this.P[i][l] * this.Q[j][l])
            }
            
            
        }
    }

    this.getRating = function(i, j){
        let prediction = mathjs.dot(this.P[i], mathjs.transpose(this.Q[j]))
        return prediction
    }

    this.getRatingMatrix = function(){
        let pR = []
        for (let i = 0; i < this.num_users; i++) {
            pR[i] = []
            for (let j = 0; j < this.num_items; j++) {
                pR[i][j] = this.getRating(i, j)
            }
        }
        return pR
    }

}

function shuffle(arr) {
    var currentIndex = arr.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }
  
    return arr;
  }

//Box-Muller transformation for getting normal distributed randoms
function randn(scale = 1) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) * scale;
}


module.exports = SVD_Optimizer