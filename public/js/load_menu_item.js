function generateMenuCardItem(cusine = ''){

    var route = cusine == '' ? 'menuItems/' : 'menuItems/' + cusine;
    clearMenuItems();
    $.get(route, function( json ) {
        $(json).each(index => {

            const menuItemHTML = `<div class="menu-item load-animation d-inline-block m-2">
            <div class="card" id="menu-item-${index}" style="width: 14rem;">
            <img class="card-img-top menu-item-img" alt="Card image cap" hidden>
            <photo class="card-img-top menu-item-img shine"></photo>
            <div class="text-right" style="font-size: 0.5rem;"><button type="button" class="btn mdc-fab btn-circle menu-item-btn mr-3"><i class="fas fa-plus fa-xs translate-center"></i></button></div>
                <div class="card-body menu-item-body py-1 px-3">
                  <div>
                    <lines class="card-title my-1 shine"></lines>
                    <h5 class="card-title" hidden>Card title</h5>
                  </div>
                  <div>
                    <lines class="card-text shine"></lines>
                    <h5 class="card-text menu-item-price" hidden>$4.55</h5>
                  </div>
                  <div  style="position: absolute; bottom: -20px;">
                    <lines class="shine" style="width: 140px;"></lines>
                    <div class="rating" hidden>
                        
                    </div>
                  </div>
                </div>
            
            </div>
            </div>`;

            var menuItemJson = json[index];
            
            //Create menu item html dynamically
            $('#all-menu-container').append(menuItemHTML);

            var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
            loadContent($(`#menu-item-${index}`), menuItem);
        });
        //Do staggering animations for the items
        doStaggerAnimation();
    });
}

function clearMenuItems(){
    $('#all-menu-container').html('');
}

/**
 * This function will be call when loading animation is done
 * if there is no loading animation, this function will be called immediately
 */
function loadingDone(){
    //Do staggering animations for the items
    doStaggerAnimation();
}