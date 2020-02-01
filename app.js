const cartBtn = document.querySelector('.cart-btn'),
  closeCartBtn = document.querySelector('.close-cart'),
  clearCartBtn = document.querySelector('.clear-cart'),
  cartDOM = document.querySelector('.cart'),
  cartOverlay = document.querySelector('.cart-overlay'),
  cartItems = document.querySelector('.cart-items'),
  cartTotal = document.querySelector('.cart-total'),
  cartContent = document.querySelector('.cart-content'),
  productsDOM = document.querySelector('.products-center');

let cart = [];

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
}

/* ------------------------------ local storage ----------------------------- */
class Storage {

}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI(),
    products = new Products();

  /* ------------------------------ get products ------------------------------ */
  products.getProducts().then(products => {
    ui.displayProducts(products);
  }).catch((err) => {

  });
});