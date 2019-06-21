
function generateRecommendedMenuCardItem(){
  var route = 'recommendedMenuItems';
    clearMenuItems($('#all-recommended-menu-container'));
    $.get(route, function( json ) {
        insertContentToDivContainer($('#all-recommended-menu-container'), json)
        //Do staggering animations for the items
        doStaggerAnimation();
        registerAllMenuItemsButtons();
    });
    
}

function generateMenuCardItem(cusine = ''){

    var route = cusine == '' ? 'menuItems/' : 'menuItems/' + cusine;
    clearMenuItems($('#all-menu-container'));
    $.get(route, function( json ) {
        insertContentToDivContainer($('#all-menu-container'), json)
        //Do staggering animations for the items
        doStaggerAnimation();
        registerAllMenuItemsButtons();
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
    //<button type="button" data-menu-item="${jsonMenuItems[index].id}" class="btn mdc-fab btn-circle menu-item-btn mr-3"><i class="fas fa-plus fa-xs translate-center"></i></button>
    
    
    
    var menuItemJson = jsonMenuItems[index];
    
    const menuItemHTML = getMenuItemHTML(container.attr('id'), menuItemJson.id, index);
    console.log(menuItemHTML);
    
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
    registerAllMenuItemsButtons();
}

var cart_count = 0;
var cart_index = 0;

function registerAllMenuItemsButtons(){
    $('.menu-item').off('click');
    $('.menu-item').click(function() {
      var btn = $(this);
      var menuItemId = btn.data('menuItem');

      var csrf = $('#csrf-token').val();
      $.ajax({
        method: "POST",
        url: "addOrder",
        data: {csrf, menuItemId}
      }).done(function() {
        console.log("Added order");
        showAlert('Added order');

        //Add to order list
        cart_count++;
        cart_index++;
        setCartBadgeValue(cart_count);
        //Bottom order list
        var bottomList = $('div.container-fluid:nth-child(2) > div:nth-child(1) > div:nth-child(1)');
        bottomList.append(menuItemHTML('all-bottom-menu-container', cart_index))
        var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
        loadContent($(`#all-bottom-menu-container-menu-item-${cart_index}`), menuItem);

      }).catch(err => {
        showAlert('Error adding item', 3000, 'alert-danger');
      });
    });
}

/**
 * Get menu item card html
 * @param {number} containerId 
 * @param {number} menuItemId 
 * @param {number} index - id for index idenification of menu items when there is duplicates
 */
function getMenuItemHTML(containerId, menuItemId, index=0){
  return `<div class="menu-item load-animation d-inline-block m-2" data-menu-item="${menuItemId}" > 
    <div class="card" id="${containerId}-menu-item-${index}" style="width: 14rem;">
    <img class="card-img-top menu-item-img" alt="Card image cap" hidden>
    <photo class="card-img-top menu-item-img shine"></photo>
    <div class="text-right" style="font-size: 0.5rem;"></div>
        <div class="card-body menu-item-body py-3 px-3">
          <div>
            <lines class="card-title my-1 shine"></lines>
            <h5 class="card-title" hidden>Card title</h5>
          </div>
          <div>
            <lines class="card-text shine"></lines>
            <h5 class="card-text menu-item-price" hidden>$4.55</h5>
          </div>
          <div>
            <lines class="shine" style="width: 140px;"></lines>
            <div class="rating" hidden>
                
            </div>
          </div>
        </div>
    
    </div>
    </div>`;
}