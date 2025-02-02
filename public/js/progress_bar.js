
$(document).ready(function() {
});


/**
 * Animate stepping of register
 */
function setProgressBarValue(progress_bar, step, max_step){
    $.Velocity.animate(progress_bar, {
        width: (step-1) / (max_step-1) * 100 + "%"
    },  { duration: 1000 }).then(() => {
        //Change circle color
        for (var i = 0; i <= step; i++) {
            $.Velocity.animate($('.progress-bar-' + i), {stroke: '#D80416'});
        }
        for (var i = step+1; i <= 3; i++) {
            $.Velocity.animate($('.progress-bar-' + i), {stroke: '#F2B8B3'});
        }
    });
}

/**
 * Animate the changing of carousel height
 * @param {boostrap carousel element} carsousel 
 * @param {height of the new carousel item} height 
 */
function animateCarouselHeight(carsousel, height) {
    
    $.Velocity.animate(carsousel, {
        height
    },  { duration: 1000 });
}

/**
 * Slide to specific slide
 * @param {index of the side to slide to} number 
 */
function stepToSlide(number){
    $('#register_carousel').carousel(number-1);

    animateCarouselHeight($('#register_carousel'), $('#register-'+number).height());

    $('#register_carousel').carousel('pause');
    setProgressBarValue($('#progress-bar'), number, 3);
}