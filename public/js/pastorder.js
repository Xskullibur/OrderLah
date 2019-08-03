$(document).ready(function() {
    $('.live-clickable').css('cursor', 'pointer');
    $('.live-clickable').click(function(){
        var pubOrderId = $(this).data('orderId');
        window.location.href = '/orderStatus/' + pubOrderId;
    });


});