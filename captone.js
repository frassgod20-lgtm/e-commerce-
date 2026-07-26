
const products = [
  { id: 1, name: "Samsung TV", price: 500, image: "/images/product1.png" },
  { id: 2, name: "Pixel 4a", price: 300, image: "/images/product2.png" },
  { id: 3, name: "PS5", price: 450, image: "/images/product3.png" },
  { id: 4, name: "Macbook Air", price: 999, image: "/images/product4.png" },
  { id: 5, name: "Apple Watch", price: 250, image: "/images/product5.png" },
  { id: 6, name: "Ear Pods", price: 150, image: "/images/product6.png" },
];

// Cart holds objects shaped like { ...product, quantity }
let cart = [];

// DOM elements
const main = document.getElementById("main");
const productSection = document.getElementById("procductSec");
const cartBadge = document.getElementById("itemCounter");
const showCartBtn = document.getElementById("addtc");
const addCartPanel = document.getElementById("addCartItem");
const closeCartBtn = document.getElementById("closeCart");
const cartItemsBody = document.getElementById("cartItemsBody");
const cartTotalEl = document.getElementById("cartTotal");
const continueShopBtn = document.getElementById("tinueshop");
const checkoutBtn = document.getElementById("chckout");
const checkoutForm = document.getElementById("checkoutForm")
const summaryOverlay = document.getElementById("summary-overlay")
const summaryContainer = document.getElementById("summary-container")

summaryOverlay.addEventListener("click", (e) => {
  if (e.target === summaryOverlay) {
    summaryOverlay.classList.remove("active");
  }
});

// Render the product grid into the existing #procductSec section
function renderProducts() {
  const markup = products.map((p) => `
    <div class="itemCard-items" data-id="${p.id}">
      <div class="image-container">
        <img src="${p.image}" alt="Image of ${p.name}" />
        <div class="overlay-text">
          <h1>$${p.price}</h1>
        </div>
      </div>
      <h1>${p.name}</h1>
      <button data-id="${p.id}" class="add-btn">ADD TO CART</button>
    </div>
  `).join("");
  productSection.insertAdjacentHTML("beforeend", markup);
}

function renderCartItems() {
  const markup = cart.map((p) => `
    <div class="" data-id="${p.id}">
      <div class="">
        <img src="${p.image}" alt="Image of ${p.name}" />
        <div class="">
          <h1>$${p.price}</h1>
        </div>
      </div>
      <h1>${p.name}</h1>
    </div>
  `).join("");
  productSection.insertAdjacentHTML("beforeend", markup);
}


function formatMoney(n) {
  return n.toFixed(2);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

const publicKey = "pk_test_af53284831a3fa6cd7e3a81ebecd783edf7804dd";

function payWithPaystack(userDetails) {
  let handler = PaystackPop.setup({
    key: publicKey,
    email: userDetails.userEmail,
    amount: getCartTotal() * 100,
    currency: "GHS",
    ref: 'ref_' + Math.floor((Math.random() * 1000000000) + 1), // Generate a unique reference
    callback: function (response) {
      // alert("Payment complete!", userDetails);
      console.log("response", response)
      showSummary()
      // TODO: Verify transaction on your server
    },
    onClose: function (error) {
      alert("Payment failed. User did not complete the process");
    }
  });
  handler.openIframe();
}

// Re-render the cart table, to look tal, and badge from the current `cart` state
function renderCart(cartStore) {
  console.log("cartStore", cartStore)
  console.log("cart", cart)
  cartItemsBody.innerHTML = cartStore.map((item, index) => `
    <tr class="tableItems">
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>$${formatMoney(item.price)}</td>
      <td class="btnSpan">
        <button class="decreament" data-id="${item.id}" aria-label="Decrease quantity">-</button>
        <span class="quantitySpanBadge">${item.quantity}</span>
        <button class="increament" data-id="${item.id}" aria-label="Increase quantity">+</button>
      </td>
      <td>
        <button class="removeFromCart" data-id="${item.id}">Remove</button>
      </td>
    </tr>
  `).join("");

  cartTotalEl.textContent = `$${formatMoney(getCartTotal())}`;
  cartBadge.textContent = getCartItemCount();
}

function resetAddButtonLabel(id) {
  const btn = productSection.querySelector(`.add-btn[data-id="${id}"]`);
  if (btn) btn.textContent = "ADD TO CART";
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    cart.push({ ...product, quantity: 1 });
  }
  renderCart(cart);
}

// function removeFromCart(id) {
//   cart = cart.filter((item) => item.id !== id);
//   resetAddButtonLabel(id);
//   renderCart();
// }

function increaseQuantity(id) {
  const item = cart.find((item) => item.id === id);
  if (!item) return;
  item.quantity += 1;
  renderCart(cart);
}

function decreaseQuantity(id) {
  const item = cart.find((item) => item.id === id);
  if (!item) return;
  if (item.quantity > 1) {
    item.quantity -= 1;
    renderCart(cart);
  } else {
    alert("You cannot go below one (1). Use Remove to take this item out of your cart.");
  }
}

// Delegated click handling for the product grid: Add to cart
productSection.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");
  if (!button) return;
  const id = Number(button.dataset.id);
  const existingCartItem = cart.find((cartItem) => cartItem.id === id)
  if (!existingCartItem) {
    addToCart(id);
    button.textContent = "Remove from cart";
  }
  if (existingCartItem) {
    removeFromCart(cart, existingCartItem)
    button.textContent = "Add to cart";
  }
  return
});

const removeFromCart = (cart, cartItem) => {
  console.log("item", cartItem)
  const itemIndex = cart.findIndex((item) => item.id === cartItem.id)
  console.log("itemIndex", itemIndex)
  if (itemIndex === -1) {
    alert("Item not found in cart")
  }
  cart.splice(itemIndex, 1)
  const updatedCart = [...cart]
  renderCart(updatedCart)
}

// Delegated click handling for the cart table: increase / decrease / remove
cartItemsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);

  if (button.classList.contains("increament")) {
    increaseQuantity(id);
  } else if (button.classList.contains("decreament")) {
    decreaseQuantity(id);
  } else if (button.classList.contains("removeFromCart")) {
    removeFromCart(id);
  }
});

// Open / close the cart panel
showCartBtn.addEventListener("click", () => {
  addCartPanel.classList.toggle("show");
});

closeCartBtn.addEventListener("click", () => {
  addCartPanel.classList.remove("show");
});

continueShopBtn.addEventListener("click", () => {
  addCartPanel.classList.remove("show");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const userEmail = checkoutForm.custEmail.value
  const custName = checkoutForm.custName.value
  const custPhone = checkoutForm.custPhone.value


  console.log("event", {
    userEmail,
    custName,
    custPhone
  })

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const userDetails = {
    userEmail,
    custName,
    custPhone
  }
  // getCartTotal()
  payWithPaystack(userDetails)
});



function showSummary() {
  addCartPanel.classList.remove("show");
  summaryOverlay.classList.add("active");
  summaryContainer.innerHTML = `
    <section class="summary-content">
      <h3>Thank You, Your order has been Received</h3>
      <div>
        <img src="images/check.svg" alt="check SVG">
        <h1>Summary</h1>
      </div>
      <table>
        <thead>
          <tr class="tableHead">
            <th>S/N</th>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map((item, index) => `
            <tr class="tableItems">
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>$${formatMoney(item.price)}</td>
              <td>${item.quantity}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="summary-total">
        <h3>Total Amount: $${formatMoney(getCartTotal())}</h3>
      </div>
    </section>
  `;
}

// Init
renderProducts();
renderCart(cart);
