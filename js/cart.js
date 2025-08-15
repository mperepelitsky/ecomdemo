// Shopping Cart functionality
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.initializeEventListeners();
    this.updateCartDisplay();
  }

  // Load cart from localStorage
  loadCart() {
    const saved = localStorage.getItem("clothingHubCart");
    return saved ? JSON.parse(saved) : [];
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem("clothingHubCart", JSON.stringify(this.items));
  }

  // Add item to cart
  addItem(productId, quantity = 1, size = null, color = null) {
    const product = ProductUtils.getProductById(productId);
    if (!product) return false;

    // Check if item with same attributes already exists
    const existingItemIndex = this.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      this.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.items.push({
        productId,
        quantity,
        size,
        color,
        price: product.price,
        addedAt: new Date().toISOString(),
      });
    }

    this.saveCart();
    this.updateCartDisplay();
    this.showAddToCartFeedback(product.name);

    // Track add to cart in DataLayer
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
    // Get product info before removing for DataLayer tracking
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

    // Track remove from cart in DataLayer
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
      return Number(total + item.price * item.quantity);
    }, 0);
  }

  // Get cart item count
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Update cart display
  updateCartDisplay() {
    this.updateCartCount();
    this.updateCartModal();
  }

  // Update cart count badge
  updateCartCount() {
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
      cartCountElement.textContent = this.getItemCount();
    }
  }

  // Update cart modal content
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
      cartItemsElement.innerHTML = this.items
        .map((item) => {
          const product = ProductUtils.getProductById(item.productId);
          if (!product) return "";

          return `
                    <div class="flex items-center space-x-4 py-4 border-b last:border-b-0">
                        <img src="${product.image}" alt="${
            product.name
          }" class="w-16 h-16 object-cover rounded">
                        <div class="flex-1">
                            <h4 class="font-semibold text-sm">${
                              product.name
                            }</h4>
                            <p class="text-xs text-gray-500">
                                ${item.size ? `Size: ${item.size}` : ""} 
                                ${item.color ? `Color: ${item.color}` : ""}
                            </p>
                            <div class="flex items-center space-x-2 mt-1">
                                <button onclick="cart.updateQuantity(${
                                  item.productId
                                }, ${item.quantity - 1}, '${item.size}', '${
            item.color
          }')" 
                                        class="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300">-</button>
                                <span class="text-sm">${item.quantity}</span>
                                <button onclick="cart.updateQuantity(${
                                  item.productId
                                }, ${item.quantity + 1}, '${item.size}', '${
            item.color
          }')" 
                                        class="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300">+</button>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">${ProductUtils.formatPrice(
                              item.price * item.quantity
                            )}</p>
                            <button onclick="cart.removeItem(${
                              item.productId
                            }, '${item.size}', '${item.color}')" 
                                    class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    cartTotalElement.textContent = this.getTotal().toFixed(2);
  }

  // Show feedback when item is added to cart
  showAddToCartFeedback(productName) {
    // Create temporary notification
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

    // Slide in
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    // Slide out and remove
    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Cart icon click
    document.addEventListener("click", (e) => {
      if (e.target.closest("#cartIcon")) {
        this.toggleCartModal();
      }

      if (e.target.closest("#closeCart")) {
        this.hideCartModal();
      }

      if (e.target.closest("#clearCart")) {
        if (confirm("Are you sure you want to clear your cart?")) {
          this.clearCart();
        }
      }

      if (e.target.closest("#checkout")) {
        cart.checkout();
      }
    });

    // Close modal when clicking outside
    document.addEventListener("click", (e) => {
      const modal = document.getElementById("cartModal");
      if (modal && e.target === modal) {
        this.hideCartModal();
      }
    });
  }

  // Toggle cart modal
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

  // Show cart modal
  showCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";

      // Track view cart in DataLayer
      if (typeof dataLayerManager !== "undefined") {
        dataLayerManager.trackViewCart(this.items, this.getTotal());
      }
    }
  }

  // Hide cart modal
  hideCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  // Simulate checkout process
  checkout() {
    if (this.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Check if user is logged in
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
      alert("Please log in to complete your purchase.");
      window.location.href = "login.html";
      return;
    }

    // Track begin checkout event
    const total = this.getTotal();
    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackBeginCheckout(this.items, total);
    }

    // Simulate payment process
    const itemCount = this.getItemCount();

    // Show loading state
    const checkoutBtn = document.getElementById("checkout");
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    checkoutBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
      // Track purchase in DataLayer
      if (typeof dataLayerManager !== "undefined") {
        dataLayerManager.trackPurchase(
          this.items,
          total,
          `ORDER_${Date.now()}`
        );
      }

      // Simulate successful payment
      alert(
        `Payment successful! Total: ${ProductUtils.formatPrice(
          total
        )} for ${itemCount} item(s). Order confirmation will be sent to ${
          currentUser.email
        }.`
      );

      // Clear cart after successful checkout
      this.clearCart();
      this.hideCartModal();

      // Reset button
      checkoutBtn.innerHTML = originalText;
      checkoutBtn.disabled = false;
    }, 2000);
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
