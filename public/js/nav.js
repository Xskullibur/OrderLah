$(document).ready(function(){
    $(window).scroll(checkScrollGrow);

    //Call one at least when loading page
    checkScrollGrow();
});

/**
 * Add class 'grow-scroll-growed' if windows scroll top is 0
 */
function checkScrollGrow(){
    var scroll = $(window).scrollTop();
    
    if(scroll == 0){
        var items = $('.grow-scroll');
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            $(item).addClass('grow-scroll-growed')
        }
    }else{
        var items = $('.grow-scroll');
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            $(item).removeClass('grow-scroll-growed')
        }
        
    }
}