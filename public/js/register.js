
function submitToken(){
    //TODO: Implement token submission
}

/**
 * Submit form
 */
function submitForm(){

    var form_data = {csrf: $('#csrf').val()};
    //Get form data as array and convert it into a json object
    $('#registerForm').serializeArray().forEach(e => {
        form_data[e.name] = e.value;
    });

    var registerMessage = $('#register-message');

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

    $.ajax({
      method: "POST",
      url: "requesttoken",
      data: {email: "182869N@mymail.nyp.edu.sg"} //to be replaced by the email user submits in the form
    })
}
