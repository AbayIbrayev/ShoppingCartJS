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
              Add To Bag
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
    })
    .catch((err) => {

    });
});