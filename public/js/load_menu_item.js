
function generateRecommendedMenuCardItem(){
  var route = 'recommendedMenuItems';
    clearMenuItems($('#all-recommended-menu-container'));
    $.get(route, function( json ) {
        insertContentToDivContainer($('#all-recommended-menu-container'), json)
        //Do staggering animations for the items
        doStaggerAnimation();
    });
}

function generateMenuCardItem(cusine = ''){

    var route = cusine == '' ? 'menuItems/' : 'menuItems/' + cusine;
    clearMenuItems($('#all-menu-container'));
    $.get(route, function( json ) {
        insertContentToDivContainer($('#all-menu-container'), json)
        //Do staggering animations for the items
        doStaggerAnimation();
    });
}

/**
 * Clear all menu item inside div element
 */
function clearMenuItems(container){
    container.html('');
}

/**
 * Div element for putting menu items
 * @param {Jquery} container 
 * @param {json} jsonMenuItems
 */
function insertContentToDivContainer(container, jsonMenuItems){
  $(jsonMenuItems).each(index => {

    const menuItemHTML = `<div class="menu-item load-animation d-inline-block m-2" data-menu-item="${jsonMenuItems[index].id}"> 
    <div class="card" id="${container.attr('id')}-menu-item-${index}" style="width: 14rem;">
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

    var menuItemJson = jsonMenuItems[index];
    
    //Create menu item html dynamically
    container.append(menuItemHTML);

    var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
    loadContent($(`#${container.attr('id')}-menu-item-${index}`), menuItem);
});
}


/**
 * This function will be call when loading animation is done
 * if there is no loading animation, this function will be called immediately
 */
function loadingDone(){
    generateRecommendedMenuCardItem();
    //First load will fill the div container with all menu items regardless of cusine
    generateMenuCardItem();
}

function registerAllMenuItemsButtons(){
  
}