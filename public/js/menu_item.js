
$(document).ready(function() {
    
});

function doStaggerAnimation(){
    var menu_items = $('.menu-item');
    //Do stagger animation
    menu_items.each(index => {
        var menu_item = $(menu_items[index]);
        setTimeout(() => {
            menu_item.addClass('anim')
            loadContent(menu_item, new MenuItem('https://dummyimage.com/170x150/000/fff', 'Hello ' + index, 5, '$4.5'))
        }, 220 * index);
    });
}

function MenuItem(imgSrc, foodTitle, rating, price){
    this.imgSrc = imgSrc;
    this.foodTitle = foodTitle;
    this.rating = rating;
    this.price = price;
}


function loadContent(menuItemDoc, menuItem){
    //Get elements
    var img = $(menuItemDoc.find('img')[0]);
    var title = $(menuItemDoc.find('h5')[0]);
    var price = $(menuItemDoc.find('h5')[1]);

    //Set all values
    img.attr('src', menuItem.imgSrc);
    title.text(menuItem.foodTitle);
    price.text(menuItem.price);

    //Once the img finished loading we show the element
    img.on('load', function(){
        //Hide all shine
        menuItemDoc.find('.shine').each(function(index) {
            $(this).attr('hidden', '');
        });

        //Show all elements
        img.removeAttr('hidden');
        title.removeAttr('hidden');
        price.removeAttr('hidden')

    });

    

}