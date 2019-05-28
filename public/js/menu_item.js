
$(document).ready(function() {
    
});

function doStaggerAnimation(){
    var menu_items = $('.menu-item');
    //Do stagger animation
    menu_items.each(index => {
        var menu_item = $(menu_items[index]);
        setTimeout(() => {
            menu_item.addClass('anim')
        }, 220 * index);
    });
}

function MenuItem(imgSrc, foodTitle, rating){
    this.imgSrc = imgSrc;
    this.foodTitle = foodTitle;
    this.rating = rating;
}


function loadContent(menuItemDoc, menuItem){
    //Get elements
    var img = $(menuItemDoc.find('img')[0]);
    var title = $(menuItemDoc.find('h5')[0]);

    //Set all values
    img.attr('src', 'https://dummyimage.com/170x150/000/fff');
    title.text('test');

    //Once the img finished loading we show the element
    img.on('load', function(){
        //Hide all shine
        menuItemDoc.find('.shine').each(function(index) {
            $(this).attr('hidden', '');
        });

        //Show all elements
        img.removeAttr('hidden');
        title.removeAttr('hidden');


    });

    

}