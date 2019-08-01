
function submitToken(){
  if(document.getElementById('registerForm').reportValidity()){
    stepToSlide(2);
    var mail = $('#registerForm input[name=email]').val();
  
    $.ajax({
      method: "POST",
      url: "requesttoken",
      data: {email: mail} //to be replaced by the email user submits in the form
    })
  }
}
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


  $.ajax({
    method: "POST",
    url: "register",
    data: form_data,
    dataType: 'text',
    success: function(html, status, response) {
      registerMessage.removeClass('text-danger');
      registerMessage.addClass('text-success');
      registerMessage.text('Account is created!');
      stepToSlide(3);
    },
    error: function(err){
      registerMessage.removeClass('text-success')
      registerMessage.addClass('text-danger');
      registerMessage.text(err.responseText);
      stepToSlide(3);
    }
  });
}
