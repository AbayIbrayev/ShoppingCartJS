const cartBtn = document.querySelector('.cart-btn'),
  closeCartBtn = document.querySelector('.close-cart'),
  clearCartBtn = document.querySelector('.clear-cart'),
  cartDOM = document.querySelector('.cart'),
  cartOverlay = document.querySelector('.cart-overlay'),
  cartItems = document.querySelector('.cart-items'),
  cartTotal = document.querySelector('.cart-total'),
  cartContent = document.querySelector('.cart-content'),
  productsDOM = document.querySelector('.products-center');

let cart = [],
  buttonsDOM = [];

/* ---------------------------- getting products ---------------------------- */
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json'),
        data = await result.json(),
        products = data.items;

      products = products.map(item => {
        const {
          title,
          price
        } = item.fields, {
            id
          } = item.sys,
          image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

/* ---------------------------- display products ---------------------------- */
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
        <article class="product">
          <div class="img-container">
            <img src="${product.image}" alt="product" class="product-img">
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Add To Cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id,
        inCart = cart.find(item => item.id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener('click', (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        let cartItem = {
          ...Storage.getProduct(id),
          amount: 1
        };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in a local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart items
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
        clearCartBtn.innerText = "Clear Cart";
      });

    });
  }
  setCartValues(cart) {
    let tempTotal = 0,
      itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" alt="product">
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id="${item.id}">remove</span>
      </div>

      <div>
        <i class="fas fa-chevron-up" data-id="${item.id}"></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id="${item.id}"></i>
      </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
    document.body.style.overflow = "hidden";
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
    document.body.style.overflow = "";
  }
  cartLogic() {
    cartOverlay.addEventListener('click', (event) => {
      if (event.target == cartOverlay) {
        this.hideCart();
      }
    });
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target,
          id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target,
          id = addAmount.dataset.id,
          tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target,
          id = lowerAmount.dataset.id,
          tempItem = cart.find(item => item.id === id);

        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    clearCartBtn.innerText = "Add Products";
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

/* ------------------------------ local storage ----------------------------- */
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI(),
    products = new Products();

  ui.setupApp();

  /* ------------------------------ get products ------------------------------ */
  products.getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    })
    .catch((err) => {

    });
});