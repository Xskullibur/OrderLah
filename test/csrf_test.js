
/**
 * Get the CSRF token
 */
module.exports = {
  getCSRFToken(request) {
    return request.get('/csrf-token-debug')
    .expect(200)
    .catch(error => console.log(error))
  }
};