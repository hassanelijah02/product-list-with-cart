const productCartContent = document.querySelector('.product-cart-content');
const cart = getCartFromLocalStorage();
renderCart();


async function fetchDesert(params) {
  const res = await fetch('./data.json');
  const data = await res.json();

  displayDesert(data)
  return data;
}

function displayDesert(result) {
  const productEL = document.querySelector('.product-lists-grid');

  result.forEach((item) => {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('product-lists-item');
  itemDiv.innerHTML = `
      <div class="product-image">
        <img class= "item-image" src="${item.image.desktop}" alt="">
      </div>
      <!-- buttons -->
      <button class="add-to-cart">
        <img src="./assets/images/icon-add-to-cart.svg" alt="">
        Add to Cart
      </button>
      <div class="quantity-selector">
        <button class="decrement">
          <div class="icon-rounded"><i class="fas fa-minus"></i></div>
        </button>
        <div class="quantity-display"></div>
        <button class="increment">
          <div class="icon-rounded"><i class="fas fa-plus"></i></div>
        </button>
      </div>
      <!-- product name -->
      <div class="product-content">
        <span class="product-name">
          ${item.name}
        </span>
        <h5 class="product-category">
          ${item.category}
        </h5>
        <span class="product-price">
          $${item.price.toFixed(2)}
        </span>
      </div>`
  //select quantity logic
  const addToCartButton = itemDiv.querySelector('.add-to-cart');
  const quantitySelector = itemDiv.querySelector('.quantity-selector')
  const quantityDisplay = itemDiv.querySelector('.quantity-display');
  const incrementButton = itemDiv.querySelector('.increment');
  const decrementButton =itemDiv.querySelector('.decrement');

  const savedItem = cart.find(c => c.name === item.name)
  let quantity = savedItem ? savedItem.quantity : 1;

  function updateQuantityDisplay () {
    quantityDisplay.textContent =   quantity;
  }
  incrementButton.addEventListener('click', () => {
    quantity++;
    quantityDisplay.textContent =   quantity;
    updateCart(item, quantity);
  });
  decrementButton.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      quantityDisplay.textContent =   quantity;
      updateCart(item, quantity);
    }
  })

  //add to cart 
  addToCartButton.addEventListener('click', () => {
  addToCartButton.style.display = 'none';
  const ItemImage = itemDiv.querySelector('.item-image');
  ItemImage.classList.add('active')  
  quantitySelector.style.display = 'flex';
  
  quantity = 1;
  updateQuantityDisplay()
  updateCart(item, quantity)
  })
  productEL.appendChild(itemDiv);          
  });
}

function updateCart(item, quantity) {
  const existing = cart.find(cartItem => cartItem.name === item.name);
  if (existing) {
    existing.quantity = quantity;
  } else {
    cart.push({ ...item, quantity})
  }
  SaveCartToLocalStorage(cart)
  renderCart();
}

function SaveCartToLocalStorage(cart) {
  localStorage.setItem('cart', JSON.stringify(cart))
}

function getCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cart');
   return JSON.parse(storedCart) ?? [];
}



function renderCart() {
  const cartEmptyEL = document.querySelector('.cart-empty-image');
  const orderWrapperEL = document.querySelector('.order-wrapper');
  const quantityTotalEL = document.querySelector('.quantity-total');
  const productCartContentEL = document.querySelector('.product-cart-content');
  const productCartListEL = document.querySelector('.product-cart-list')
  
  productCartListEL.innerHTML = '';
  let orderTotal = 0;
  let quantityTotal = 0;

  if (cart.length === 0) {
    cartEmptyEL.style.display = 'flex';  
    orderWrapperEL.style.display = 'none' 
  } else {
    cartEmptyEL.style.display = 'none';
    orderWrapperEL.style.display = 'block'  
  }
  
  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('product-cart-list');
    const itemTotal = item.price * item.quantity;
    orderTotal += itemTotal;
    const itemQuantity = item.quantity
    quantityTotal += itemQuantity

    div.innerHTML = `
    <div class="cart-item">
      <div class="cart-content">
        <h5 class="cart-category">
         ${item.category}
        </h5>
        <span class="quantity-and-prices">
          <span class="quantity">${item.quantity}x</span>
          <span class="prices">@ $${item.price.toFixed(2)}</span>
          <span class="quantity-price-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </span>
      </div>
      <button class="button-remove">
        <i class="fas fa-times"></i>
      </button>
    </div>`

  productCartListEL.appendChild(div); 
  });
  
  quantityTotalEL.innerHTML = `<h2>Your Cart (${quantityTotal})</h2>`
  orderWrapperEL.innerHTML = `
  <div class="order-total">
    <span class="order-title">Order Total</span>
    <span class="order-total-price">$${orderTotal.toFixed(2)}</span>
  </div>
  <div class="delivery">
    <img src="./assets/images/icon-carbon-neutral.svg" alt="">
    <span>This is a <strong>carbon-neutral </strong>delivery</span>
  </div>
  <button type="submit" class="cart-button">
    Confirm Order
  </button>`                  
              
  const cartButton = document.querySelector('.cart-button')  
  cartButton.addEventListener('click', confirmOrder) 
}

function removeItem(e) {
  const removeBtn = e.target.closest('.button-remove')
  if (removeBtn) {
    const cartItemEL =  e.target.closest('.cart-item');
    const nameEL = cartItemEL.querySelector('.cart-category')
    console.log(nameEL);
    if (!nameEL) return;

    const itemName = nameEL.textContent.trim()
    console.log(itemName);
    const index = cart.findIndex(item => item.category === itemName);
    if (index !== -1) {
      const removedItem = cart[index]
      cart.splice(index, 1);
    
      const productCartList = document.querySelectorAll('.product-lists-item');
      productCartList.forEach(item => {
      const nameText = item.querySelector('.product-category')?.textContent.trim();
      if (removedItem.category === nameText) {
        item.querySelector('.quantity-selector').style.display = 'none';
        item.querySelector('.item-image').classList.remove('active')
        item.querySelector('.add-to-cart').style.display = 'flex';
        }
      })
      renderCart()
      SaveCartToLocalStorage(cart)
    }
  }

}

function confirmOrder() {
  const confirmTotal = document.querySelector('.confirm-total');
  const confirmModal = document.querySelector('.confirm-modal');
  const newOrderButton = confirmModal.querySelector('.new-order');
  const confirmLists = document.querySelector('.confirm-lists');

  confirmModal.style.display = 'block';
  confirmLists.innerHTML = '';

  let orderTotal = 0;
  let quantityPrice = 0;

  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('confirm-lists-item');
    quantityPrice = item.price * item.quantity;
    orderTotal += quantityPrice;

    div.innerHTML =`
    <div class="confirm-item-content">
      <img src="${item.image.thumbnail}" alt="">
      <div>
        <h5>${item.category}</h5>
        <span class="confirm-quantity">${item.quantity}x</span>
        <span class="confirm-price">@ $${item.price.toFixed(2)}</span>
      </div>
    </div>
    <span class="confirm-quantity-price">$${quantityPrice.toFixed(2)}</span>`

    confirmLists.appendChild(div);  
  });
  
  confirmTotal.innerHTML = `
    <span class="confirm-order-title">Order Total</span>
    <span class="confirm-order-total">$${orderTotal.toFixed(2)}</span>`
  
  newOrderButton.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    cart.length = 0;
    localStorage.removeItem('cart');

    const productCartList = document.querySelectorAll('.product-lists-item');
    productCartList.forEach(item => {
      item.querySelector('.quantity-selector').style.display = 'none';
      item.querySelector('.add-to-cart').style.display = 'flex';
      item.querySelector('.item-image').classList.remove('active');
    })
    renderCart();
  })
}


productCartContent.addEventListener('click', removeItem)
document.addEventListener('DOMContentLoaded', fetchDesert);