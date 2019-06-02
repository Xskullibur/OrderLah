function generateMenuCardItem(){
    var content = $.get( "menuItems", function( data ) {
        var json = JSON.parse(data);
        $(json).each(index => {
            var menuItemJson = json[index]
            var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
            loadContent($(`#menu-item-${index}`), menuItem);
        });
    });
}