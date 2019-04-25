$(document).ready(function(){
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        console.log(scroll);
        
        if(scroll == 0){
            var items = $('.grow-scroll');
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                $(item).removeClass('grow-scroll-growed')
            }
        }else{
            var items = $('.grow-scroll');
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                $(item).addClass('grow-scroll-growed')
            }
        }
    });
});