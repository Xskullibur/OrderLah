


module.exports = {
  registerUser(request, data) {
    return request.post('/register')
    .accept('text/html')
    .expect(200)
    .type('form')
    .send({ username: data.username })
    .send({ email: data.email })
    .send({ fname: data.fname })
    .send({ lname: data.lname })
    .send({ dob: data.dob })
    .send({ phone: data.phone })
    .send({ password: data.password })
    .send({ csrf: data.csrf })
    .catch(err => console.log(err))
  },
  login(request, email, password){
    return request.post('/login')
    .accept('text/html')
    .expect(200)
    .type('form')
    .send({email})
    .send({password})
    .catch(err => console.log(err))
  }
}