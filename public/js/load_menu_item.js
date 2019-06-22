
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


var cart_count = 0;

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
      }).done(function(orderlineJson) {
        console.log("Added order");
        showAlert('Added order');
        var orderline_id = orderlineJson.orderLineId;

        $.ajax({
          method: "GET",
          url: "menuItemId/" + menuItemId
        }).done((menuItemJson) => {
          //Add to order list
          cart_count++;
          setCartBadgeValue(cart_count);
          //Bottom order list
          var bottomList = $('div.container-fluid:nth-child(3) > div:nth-child(1) > div:nth-child(1)');
          const menuItemHTML = getMenuItemHTML('all-bottom-menu-container', menuItemId, orderline_id, true, true);
          bottomList.append(menuItemHTML);
          var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
          loadContent($(`#all-bottom-menu-container-menu-item-${orderline_id}`), menuItem);
        })

      }).catch(err => {
        showAlert('Error adding item', 3000, 'alert-danger');
      });
    });
}


function generateCartItems(){
  var bottomList = $('div.container-fluid:nth-child(3) > div:nth-child(1) > div:nth-child(1)');
  $.ajax({
    method: "GET",
    url: "/cartItems"
  }).done((orderlinesJson) => {
    cart_count = orderlinesJson.length
    setCartBadgeValue(cart_count)
    $(orderlinesJson).each(index => {
      var menuItemId = orderlinesJson[index].itemId;

      $.ajax({
        method: 'GET',
        url: "menuItemId/" + menuItemId
      }).done(menuItemJson =>{
          const menuItemHTML = getMenuItemHTML('all-bottom-menu-container', menuItemId, orderlinesJson[index].orderLineId, true, true);
          bottomList.append(menuItemHTML);
          var menuItem = new MenuItem('/img/uploads/menu-item-1.jpg', menuItemJson.itemName, 4, '$'+ menuItemJson.price)
          loadContent($(`#all-bottom-menu-container-menu-item-${orderlinesJson[index].orderLineId}`), menuItem);
      })
      
    })
  })
}

/**
 * Clear all menu items inside div element
 */
function clearMenuItems(container){
    container.html('');
}

/**
 * Div element for putting menu items
 * @param {Jquery} container - element for appending the menuitems
 * @param {json} jsonMenuItems - all the menuitems in json
 */
function insertContentToDivContainer(container, jsonMenuItems, no_animation=false){
  $(jsonMenuItems).each(index => {
    
    var menuItemJson = jsonMenuItems[index];
    
    const menuItemHTML = getMenuItemHTML(container.attr('id'), menuItemJson.id, index, no_animation);
    
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
    generateCartItems();
    generateRecommendedMenuCardItem();
    //First load will fill the div container with all menu items regardless of cusine
    generateMenuCardItem();
    registerAllMenuItemsButtons();
}




/**
 * Get menu item card html
 * @param {number} containerId 
 * @param {number} menuItemId 
 * @param {number} index - id for index idenification of menu items when there is duplicates
 */
function getMenuItemHTML(containerId, menuItemId, index=0, no_animation=false, horizontialScrollable=false){
  return `<div class="menu-item ${horizontialScrollable? 'scroll-content' : ''} ${no_animation? '' : 'load-animation'} d-inline-block m-2" data-menu-item="${menuItemId}" > 
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