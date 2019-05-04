var step_count = 1;

/**
 * Animate stepping of register
 */
function setProgressBarValue(progress_bar, step, max_step){
    $.Velocity.animate(progress_bar, {
        width: (step-1) / (max_step-1) * 100 + "%"
    },  { duration: 1000 }).then(() => {
        //Change circle color
        $.Velocity.animate($('.progress-bar-' + step), {stroke: '#D80416'})
    });
}