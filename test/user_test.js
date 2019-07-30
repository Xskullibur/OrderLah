


module.exports = {
  requestToken(request, email){
    return request.post('/requesttoken')
    .accept('text/html')
    .send({ email })
    .catch(err => console.log(err))
  },

  retrieveToken(request){
    return request.get('/debug/register/token')
    .accept('text/json')
    .catch(err => console.log(err))
  },

  registerUser(request, data) {
    return request.post('/register')
    .accept('text/html')
    .type('form')
    .send({ username: data.username })
    .send({ email: data.email })
    .send({ fname: data.fname })
    .send({ lname: data.lname })
    .send({ dob: data.dob })
    .send({ phone: data.phone })
    .send({ password: data.password })
    .send({ csrf: data.csrf })
    .send({ code: data.code})
    .catch(err => console.log(err))
  },
  login(request, email, password){
    return request.post('/login')
    .accept('text/html')
    .type('form')
    .send({email})
    .send({password})
    .catch(err => console.log(err))
  },

  updateProfile(request, data, imagePath){
    return request.post('/updateProfile')
    .accept('text/html')
    .type('multipart/form-data')
    .send({checkEmail: data.email})
    .send({checkPhone: data.phone})
    .attach('profileImage', imagePath)
    .catch(err => console.log(err))
  }

}