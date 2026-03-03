// Shopping Cart functionality
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.initializeEventListeners();
    this.updateCartDisplay();
  }

  // Load cart from localStorage
  loadCart() {
    const saved = localStorage.getItem("vibeThreadCart");
    return saved ? JSON.parse(saved) : [];
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem("vibeThreadCart", JSON.stringify(this.items));
  }

  // Add item to cart
  addItem(productId, quantity = 1, size = null, color = null) {
    const product = ProductUtils.getProductById(productId);
    if (!product) return false;

    const existingItemIndex = this.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
    } else {
      this.items.push({
        productId,
        quantity,
        size,
        color,
        unitPrice: product.price,
        addedAt: new Date().toISOString(),
      });
    }

    this.saveCart();
    this.updateCartDisplay();
    this.showAddToCartFeedback(product.name);

    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackAddToCart(
        product,
        quantity,
        size,
        color,
        this.getTotal()
      );
    }

    return true;
  }

  // Remove item from cart
  removeItem(productId, size = null, color = null) {
    const product = ProductUtils.getProductById(productId);

    this.items = this.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.size === size &&
          item.color === color
        )
    );

    this.saveCart();
    this.updateCartDisplay();

    if (typeof dataLayerManager !== "undefined" && product) {
      dataLayerManager.trackRemoveFromCart(
        product,
        size,
        color,
        this.getTotal()
      );
    }
  }

  // Update item quantity
  updateQuantity(productId, newQuantity, size = null, color = null) {
    const itemIndex = this.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      if (newQuantity <= 0) {
        this.removeItem(productId, size, color);
      } else {
        this.items[itemIndex].quantity = newQuantity;
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  // Clear entire cart
  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartDisplay();
  }

  // Get cart total
  getTotal() {
    return this.items.reduce((total, item) => {
      const product = ProductUtils.getProductById(item.productId);
      const unitPrice =
        typeof item.unitPrice === "number"
          ? item.unitPrice
          : product
            ? product.price
            : 0;
      return total + unitPrice * item.quantity;
    }, 0);
  }

  // Get cart item count
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Update all cart views
  updateCartDisplay() {
    this.updateCartCount();
    this.updateCartModal();
    this.updateCartPage();
    this.updateCheckoutPage();
  }

  // Update cart count badge
  updateCartCount() {
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
      cartCountElement.textContent = this.getItemCount();
    }
  }

  // Build reusable cart rows markup
  buildCartItemsMarkup(compact = false) {
    return this.items
      .map((item) => {
        const product = ProductUtils.getProductById(item.productId);
        if (!product) return "";

        const sizeArg = JSON.stringify(item.size);
        const colorArg = JSON.stringify(item.color);
        const imageClass = compact ? "w-16 h-16" : "w-20 h-20";
        const itemNameClass = compact ? "font-semibold text-sm" : "font-semibold";
        const unitPrice =
          typeof item.unitPrice === "number"
            ? item.unitPrice
            : product.price;

        return `
          <div class="flex items-center space-x-4 py-4 border-b last:border-b-0">
            <img src="${product.image}" alt="${product.name}" class="${imageClass} object-cover rounded">
            <div class="flex-1">
              <h4 class="${itemNameClass}">${product.name}</h4>
              <p class="text-xs text-gray-500">
                ${item.size ? `Size: ${item.size}` : ""}
                ${item.color ? `Color: ${item.color}` : ""}
              </p>
              <div class="flex items-center space-x-2 mt-1">
                <button onclick="cart.updateQuantity(${item.productId}, ${
          item.quantity - 1
        }, ${sizeArg}, ${colorArg})"
                  class="w-7 h-7 bg-gray-200 rounded text-xs hover:bg-gray-300">-</button>
                <span class="text-sm">${item.quantity}</span>
                <button onclick="cart.updateQuantity(${item.productId}, ${
          item.quantity + 1
        }, ${sizeArg}, ${colorArg})"
                  class="w-7 h-7 bg-gray-200 rounded text-xs hover:bg-gray-300">+</button>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold">${ProductUtils.formatPrice(
                unitPrice * item.quantity
              )}</p>
              <button onclick="cart.removeItem(${item.productId}, ${sizeArg}, ${colorArg})"
                class="text-red-500 hover:text-red-700 text-xs">Remove</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Keep modal support if modal exists in older pages
  updateCartModal() {
    const cartItemsElement = document.getElementById("cartItems");
    const cartTotalElement = document.getElementById("cartTotal");
    if (!cartItemsElement || !cartTotalElement) return;

    if (this.items.length === 0) {
      cartItemsElement.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Your cart is empty</p>
        </div>
      `;
    } else {
      cartItemsElement.innerHTML = this.buildCartItemsMarkup(true);
    }

    cartTotalElement.textContent = this.getTotal().toFixed(2);
  }

  // Render full cart page content
  updateCartPage() {
    const cartPageItems = document.getElementById("cartPageItems");
    if (!cartPageItems) return;

    const subtotal = this.getTotal();
    const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 7.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (this.items.length === 0) {
      cartPageItems.innerHTML = `
        <div class="text-center py-12 bg-white rounded-lg border border-gray-200">
          <i class="fas fa-shopping-cart text-5xl text-gray-300 mb-4"></i>
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p class="text-gray-500 mb-6">Looks like you have not added anything yet.</p>
          <a href="categories.html" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
            Continue Shopping
          </a>
        </div>
      `;
    } else {
      cartPageItems.innerHTML = this.buildCartItemsMarkup(false);
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("cartPageSubtotal", ProductUtils.formatPrice(subtotal));
    setText("cartPageShipping", ProductUtils.formatPrice(shipping));
    setText("cartPageTax", ProductUtils.formatPrice(tax));
    setText("cartPageTotal", ProductUtils.formatPrice(total));

    const checkoutBtn = document.getElementById("goToCheckout");
    if (checkoutBtn) {
      checkoutBtn.disabled = this.items.length === 0;
      checkoutBtn.classList.toggle("opacity-50", this.items.length === 0);
      checkoutBtn.classList.toggle("cursor-not-allowed", this.items.length === 0);
    }
  }

  // Render checkout page content
  updateCheckoutPage() {
    const checkoutItems = document.getElementById("checkoutItems");
    if (!checkoutItems) return;

    const subtotal = this.getTotal();
    const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 7.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (this.items.length === 0) {
      checkoutItems.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">Your cart is empty.</p>
          <a href="cart.html" class="text-blue-600 hover:text-blue-800">Return to cart</a>
        </div>
      `;
    } else {
      checkoutItems.innerHTML = this.buildCartItemsMarkup(true);
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("checkoutSubtotal", ProductUtils.formatPrice(subtotal));
    setText("checkoutShipping", ProductUtils.formatPrice(shipping));
    setText("checkoutTax", ProductUtils.formatPrice(tax));
    setText("checkoutTotal", ProductUtils.formatPrice(total));
  }

  // Show feedback when item is added to cart
  showAddToCartFeedback(productName) {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-check-circle"></i>
        <span>${productName} added to cart!</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Initialize event listeners
  initializeEventListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#cartIcon")) {
        window.location.href = "cart.html";
      }

      if (e.target.closest("#closeCart")) {
        this.hideCartModal();
      }

      if (e.target.closest("#clearCart") || e.target.closest("#clearCartPage")) {
        if (confirm("Are you sure you want to clear your cart?")) {
          this.clearCart();
        }
      }

      if (e.target.closest("#checkout") || e.target.closest("#goToCheckout")) {
        this.beginCheckout();
      }

      if (e.target.closest("#facePayBtn")) {
        this.checkout();
      }
    });

    document.addEventListener("click", (e) => {
      const modal = document.getElementById("cartModal");
      if (modal && e.target === modal) {
        this.hideCartModal();
      }
    });
  }

  // Keep modal methods for backward compatibility
  toggleCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      if (modal.classList.contains("hidden")) {
        this.showCartModal();
      } else {
        this.hideCartModal();
      }
    }
  }

  showCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";

      if (typeof dataLayerManager !== "undefined") {
        dataLayerManager.trackViewCart(this.items, this.getTotal());
      }
    }
  }

  hideCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  // Move from cart to checkout page
  beginCheckout() {
    if (this.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
      alert("Please log in to continue to checkout.");
      window.location.href = "login.html";
      return;
    }

    const total = this.getTotal();
    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackBeginCheckout(this.items, total);
    }

    window.location.href = "checkout.html";
  }

  // Run automatic Face Payment and complete order
  checkout() {
    if (this.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
      alert("Please log in to complete your purchase.");
      window.location.href = "login.html";
      return;
    }

    const facePayBtn = document.getElementById("facePayBtn");
    const fallbackBtn = document.getElementById("checkout");
    const actionBtn = facePayBtn || fallbackBtn;
    const originalText = actionBtn ? actionBtn.innerHTML : "";

    if (actionBtn) {
      actionBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Scanning Face ID...';
      actionBtn.disabled = true;
    }

    const total = this.getTotal();
    const itemCount = this.getItemCount();

    setTimeout(() => {
      const order = this.createOrderRecord(currentUser, total);
      this.persistOrderForUser(currentUser, order);

      if (typeof dataLayerManager !== "undefined") {
        dataLayerManager.trackPurchase(order.items, order.total, order.id);
      }

      localStorage.setItem("vibeThreadLastOrder", JSON.stringify(order));

      this.clearCart();

      if (actionBtn) {
        actionBtn.innerHTML = originalText;
        actionBtn.disabled = false;
      }

      alert(
        `Face Payment approved. ${itemCount} item(s) purchased for ${ProductUtils.formatPrice(
          total
        )}.`
      );

      window.location.href = `thank-you.html?order=${encodeURIComponent(
        order.id
      )}`;
    }, 2000);
  }

  // Generic 4-digit order number for demo usage
  generateOrderId() {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
  }

  createOrderRecord(currentUser, total) {
    return {
      id: this.generateOrderId(),
      items: [...this.items],
      total: Number(total),
      date: new Date().toISOString(),
      customer: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      },
      payment: {
        method: "face_payment_auto",
        status: "approved",
      },
    };
  }

  persistOrderForUser(currentUser, order) {
    let users = JSON.parse(localStorage.getItem("vibeThreadUsers")) || [];
    const userIndex = users.findIndex((u) => u.email === currentUser.email);
    if (userIndex > -1) {
      users[userIndex].orders = users[userIndex].orders || [];
      users[userIndex].orders.push(order);
      localStorage.setItem("vibeThreadUsers", JSON.stringify(users));

      const updatedUser = { ...users[userIndex] };
      localStorage.setItem("vibeThreadUser", JSON.stringify(updatedUser));
    }
  }

  // Get cart items with product details
  getCartWithProductDetails() {
    return this.items.map((item) => ({
      ...item,
      product: ProductUtils.getProductById(item.productId),
    }));
  }
}

// Initialize cart globally
const cart = new ShoppingCart();

// Make cart available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShoppingCart;
} else {
  window.ShoppingCart = ShoppingCart;
  window.cart = cart;
}
