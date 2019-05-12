
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