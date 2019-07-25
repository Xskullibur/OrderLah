
function submitToken(){
  //TODO: Implement token submission
  var mail = $('#registerForm input[name=email]').val();
  
  $.ajax({
    method: "POST",
    url: "requesttoken",
    data: {email: mail} //to be replaced by the email user submits in the form
  })
}

/*function checkToken(){
  var code = $('#registerForm2 input[name=code]').val();

  $.ajax({
    method: "POST",
    url: "checktoken",
    data: {code: code} 
  })
}*/

/**
 * Submit form
 */
function submitForm(){
  var form_data = {csrf: $('#csrf-token').val()};
  //Get form data as array and convert it into a json object
  $('#registerForm').serializeArray().forEach(e => {
      form_data[e.name] = e.value;
  });

  var registerMessage = $('#register-message');

  form_data.code = $('#registerForm2 input[name=code]').val();

  /*$.ajax({
    method: "POST",
    url: "register",
    data: {code: code} 
  })*/

  $.ajax({
    method: "POST",
    url: "register",
    data: form_data
  }).done(function() {
    registerMessage.removeClass('text-danger');
    registerMessage.addClass('text-success');
    registerMessage.text('Account is created!');
    stepToSlide(3);
  }).catch(err => {
    registerMessage.removeClass('text-success')
    registerMessage.addClass('text-danger');
    registerMessage.text('Failed to create user account!');
    stepToSlide(3);
  });
}
