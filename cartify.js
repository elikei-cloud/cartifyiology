"use strict";

/* Product Catalog */

const products = {
    cardigan: {
        id: "cardigan",
        name: "Everyday Cardigan",
        category: "Clothing",
        price: 599,
        image: "cardigan.jpg"
    },

    dress: {
        id: "dress",
        name: "Classic Dress",
        category: "Clothing",
        price: 999,
        image: "dress.jpg"
    },

    bag: {
        id: "bag",
        name: "Everyday Bag",
        category: "Accessories",
        price: 1199,
        image: "bag.jpg"
    },

    shoes: {
        id: "shoes",
        name: "Everyday Shoes",
        category: "Footwear",
        price: 899,
        image: "shoes.jpg"
    }
};

/* Application State */

let customer = null;
let cart = {};
let toastTimer;

/* Elements */

const welcomeScreen = document.getElementById("welcomeScreen");
const store = document.getElementById("store");
const customerForm = document.getElementById("customerForm");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const drawerCartCount = document.getElementById("drawerCartCount");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartButton = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartSummary = document.getElementById("cartSummary");
const cartSubtotal = document.getElementById("cartSubtotal");

const continueShoppingButton = document.getElementById("continueShopping");

const checkoutButton = document.getElementById("checkoutButton");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutButton = document.getElementById("closeCheckout");

const checkoutCustomer = document.getElementById("checkoutCustomer");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");

const confirmOrderButton = document.getElementById("confirmOrder");

const successModal = document.getElementById("successModal");
const successName = document.getElementById("successName");
const orderReference = document.getElementById("orderReference");
const finishOrderButton = document.getElementById("finishOrder");

const toast = document.getElementById("toast");

/* Utilities */

function formatPrice(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    }).format(amount);
}

function getCartQuantity() {
    return Object.values(cart).reduce((total, quantity) => {
        return total + quantity;
    }, 0);
}

function getCartTotal() {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
        return total + products[id].price * quantity;
    }, 0);
}

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function updateBodyScroll() {
    const cartOpen = cartDrawer.classList.contains("open");
    const modalOpen =
        !checkoutModal.classList.contains("hidden") ||
        !successModal.classList.contains("hidden");

    document.body.classList.toggle("no-scroll", cartOpen || modalOpen);
}

/* Customer Information Form */

customerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const age = Number(document.getElementById("customerAge").value);
    const email = document.getElementById("customerEmail").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (!name || !email || !phone || !address) {
        showToast("Please complete all required fields.");
        return;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
        showToast("Please enter a valid age.");
        return;
    }

    if (!customerForm.reportValidity()) {
        return;
    }

    customer = {
        name,
        age,
        email,
        phone,
        address
    };

    welcomeScreen.classList.add("hidden");
    store.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showToast(`Welcome to Cartify, ${name}!`);
});

/* Show Store */

function showStore() {
    if (!customer) {
        welcomeScreen.classList.remove("hidden");
        store.classList.add("hidden");
        return;
    }

    welcomeScreen.classList.add("hidden");
    store.classList.remove("hidden");

    closeCart();
    closeCheckout();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* Product Buttons */

document.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", function () {
        const productId = this.dataset.add;
        addToCart(productId);
    });
});

/* Add Product */

function addToCart(productId) {
    if (!customer) {
        showToast("Please enter your information first.");
        return;
    }

    if (!products[productId]) {
        showToast("This product is unavailable.");
        return;
    }

    cart[productId] = (cart[productId] || 0) + 1;

    renderCart();

    showToast(`${products[productId].name} added to your cart.`);
}

/* Change Quantity */

function changeQuantity(productId, amount) {
    if (!cart[productId]) {
        return;
    }

    cart[productId] += amount;

    if (cart[productId] <= 0) {
        delete cart[productId];
    }

    renderCart();
}

/* Remove Product */

function removeFromCart(productId) {
    if (!cart[productId]) {
        return;
    }

    const productName = products[productId].name;

    delete cart[productId];

    renderCart();

    showToast(`${productName} removed from your cart.`);
}

/* Render Shopping Cart */

function renderCart() {
    const quantity = getCartQuantity();
    const total = getCartTotal();

    cartCount.textContent = quantity;
    drawerCartCount.textContent = `(${quantity})`;

    cartItems.replaceChildren();

    const isEmpty = quantity === 0;

    emptyCart.classList.toggle("hidden", !isEmpty);
    cartSummary.classList.toggle("hidden", isEmpty);

    if (isEmpty) {
        cartSubtotal.textContent = formatPrice(0);
        return;
    }

    Object.entries(cart).forEach(([productId, productQuantity]) => {
        const product = products[productId];

        if (!product) {
            return;
        }

        const item = document.createElement("article");
        item.className = "cart-item";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;

        const details = document.createElement("div");
        details.className = "cart-item-details";

        const category = document.createElement("p");
        category.textContent = product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(product.price * productQuantity);

        const quantityControl = document.createElement("div");
        quantityControl.className = "quantity-control";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
            "aria-label",
            `Decrease quantity of ${product.name}`
        );

        decreaseButton.addEventListener("click", () => {
            changeQuantity(productId, -1);
        });

        const quantityText = document.createElement("span");
        quantityText.textContent = productQuantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
            "aria-label",
            `Increase quantity of ${product.name}`
        );

        increaseButton.addEventListener("click", () => {
            changeQuantity(productId, 1);
        });

        quantityControl.append(
            decreaseButton,
            quantityText,
            increaseButton
        );

        details.append(category, name, price, quantityControl);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            removeFromCart(productId);
        });

        item.append(image, details, removeButton);

        cartItems.appendChild(item);
    });

    cartSubtotal.textContent = formatPrice(total);
}

/* Cart Drawer */

function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("active");

    cartDrawer.setAttribute("aria-modal", "true");

    updateBodyScroll();
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("active");

    cartDrawer.removeAttribute("aria-modal");

    updateBodyScroll();
}

cartButton.addEventListener("click", openCart);

closeCartButton.addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);

continueShoppingButton.addEventListener("click", () => {
    closeCart();

    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
});

/* Checkout */

function openCheckout() {
    if (!customer) {
        showToast("Please provide your customer information first.");
        return;
    }

    if (getCartQuantity() === 0) {
        showToast("Your cart is empty.");
        return;
    }

    renderCheckout();

    closeCart();

    checkoutModal.classList.remove("hidden");

    updateBodyScroll();
}

function closeCheckout() {
    checkoutModal.classList.add("hidden");

    updateBodyScroll();
}

function renderCheckout() {
    checkoutCustomer.replaceChildren();

    const customerName = document.createElement("strong");
    customerName.textContent = customer.name;

    const customerEmail = document.createElement("span");
    customerEmail.textContent = customer.email;

    const customerPhone = document.createElement("span");
    customerPhone.textContent = customer.phone;

    const customerAddress = document.createElement("span");
    customerAddress.textContent = customer.address;

    checkoutCustomer.append(
        customerName,
        customerEmail,
        customerPhone,
        customerAddress
    );

    checkoutItems.replaceChildren();

    Object.entries(cart).forEach(([productId, quantity]) => {
        const product = products[productId];

        if (!product) {
            return;
        }

        const row = document.createElement("div");
        row.className = "checkout-order-item";

        const itemName = document.createElement("span");
        itemName.textContent = `${product.name} × ${quantity}`;

        const itemPrice = document.createElement("strong");
        itemPrice.textContent = formatPrice(product.price * quantity);

        row.append(itemName, itemPrice);

        checkoutItems.appendChild(row);
    });

    checkoutTotal.textContent = formatPrice(getCartTotal());
}

checkoutButton.addEventListener("click", openCheckout);

closeCheckoutButton.addEventListener("click", closeCheckout);

/* Confirm Demo Order */

confirmOrderButton.addEventListener("click", function () {
    if (!customer || getCartQuantity() === 0) {
        closeCheckout();
        showToast("Please check your customer information and cart.");
        return;
    }

    const reference = "CRT-" +
        Date.now().toString().slice(-8);

    successName.textContent = customer.name;
    orderReference.textContent = reference;

    cart = {};

    renderCart();
    closeCheckout();

    successModal.classList.remove("hidden");

    updateBodyScroll();
});

/* Finish Order */

finishOrderButton.addEventListener("click", function () {
    successModal.classList.add("hidden");

    updateBodyScroll();

    showToast("Thank you for visiting Cartify!");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* Keyboard Controls */

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
        return;
    }

    if (!successModal.classList.contains("hidden")) {
        successModal.classList.add("hidden");
        updateBodyScroll();
        return;
    }

    if (!checkoutModal.classList.contains("hidden")) {
        closeCheckout();
        return;
    }

    if (cartDrawer.classList.contains("open")) {
        closeCart();
    }
});

/* Footer Year */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

/* Initialize */

renderCart();