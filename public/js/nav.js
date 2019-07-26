$(document).ready(function(){
    $(window).scroll(checkScrollGrow);

    //Call one at least when loading page
    checkScrollGrow();

    //Update cart count value
    updateCartCount();
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

/**
 * Set the count of cart icon
 * @param {number} val 
 */
function setCartBadgeValue(val){
    $('#nav-cart-count').text(val)
}

/**
 * Update cart count value
 */
function updateCartCount(){
    $.ajax({
        method: "GET",
        url: "/cartItemsCount"
    }).done((count) => {
        setCartBadgeValue(count);
    })
}