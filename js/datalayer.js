// DataLayer utility for Google Analytics Enhanced Ecommerce tracking
class DataLayerManager {
  constructor() {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    console.log("DataLayer Manager initialized");
  }

  // Push data to dataLayer
  push(data) {
    window.dataLayer.push(data);
    console.log("DataLayer push:", data);
  }

  // Track user login
  trackUserLogin(user) {
    this.push({
      event: "login",
      user_id: user.id,
      user_properties: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        member_since: user.memberSince,
        login_method: "email",
      },
    });
  }

  // Track user registration
  trackUserRegistration(user) {
    this.push({
      event: "sign_up",
      user_id: user.id,
      user_properties: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        member_since: user.memberSince,
        sign_up_method: "email",
      },
    });
  }

  // Track user logout
  trackUserLogout() {
    this.push({
      event: "logout",
    });
  }

  // Track add to cart
  trackAddToCart(product, quantity, size, color, cartValue) {
    this.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "USD",
        value: product.price * quantity,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_category: this.getCategoryName(product.category),
            item_variant: this.getVariant(size, color),
            quantity: quantity,
            price: product.price,
          },
        ],
      },
      cart_total_value: cartValue,
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track remove from cart
  trackRemoveFromCart(product, size, color, cartValue) {
    this.push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "USD",
        value: product.price,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_category: this.getCategoryName(product.category),
            item_variant: this.getVariant(size, color),
            quantity: 1,
            price: product.price,
          },
        ],
      },
      cart_total_value: cartValue,
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track view cart
  trackViewCart(cartItems, cartValue) {
    const items = cartItems.map((item) => {
      const product = ProductUtils.getProductById(item.productId);
      return {
        item_id: item.productId.toString(),
        item_name: product.name,
        item_category: this.getCategoryName(product.category),
        item_variant: this.getVariant(item.size, item.color),
        quantity: item.quantity,
        price: item.price,
      };
    });

    this.push({
      event: "view_cart",
      ecommerce: {
        currency: "USD",
        value: cartValue,
        items: items,
      },
      cart_total_value: cartValue,
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track begin checkout
  trackBeginCheckout(cartItems, cartValue) {
    const items = cartItems.map((item) => {
      const product = ProductUtils.getProductById(item.productId);
      return {
        item_id: item.productId.toString(),
        item_name: product.name,
        item_category: this.getCategoryName(product.category),
        item_variant: this.getVariant(item.size, item.color),
        quantity: item.quantity,
        price: item.price,
      };
    });

    this.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "USD",
        value: cartValue,
        items: items,
      },
      cart_total_value: cartValue,
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track purchase completion
  trackPurchase(cartItems, cartValue, transactionId) {
    const items = cartItems.map((item) => {
      const product = ProductUtils.getProductById(item.productId);
      return {
        item_id: item.productId.toString(),
        item_name: product.name,
        item_category: this.getCategoryName(product.category),
        item_variant: this.getVariant(item.size, item.color),
        quantity: item.quantity,
        price: item.price,
      };
    });

    this.push({
      event: "purchase",
      ecommerce: {
        transaction_id: transactionId,
        currency: "USD",
        value: cartValue,
        items: items,
      },
    });
  }

  // Track product view (flat structure)
  trackViewItem(product) {
    this.push({
      event: "view_item",
      ecommerce: {
        currency: "USD",
        product_id: product.id.toString(),
        product_name: product.name,
        product_category: this.getCategoryName(product.category),
        price: product.price,
      },
    });
  }

  // Track product list view (flat structure, one event per product)
  trackViewItemList(products, listName) {
    products.forEach((product) => {
      this.push({
        event: "view_item_list",
        ecommerce: {
          currency: "USD",
          product_id: product.id.toString(),
          product_name: product.name,
          product_category: this.getCategoryName(product.category),
          price: product.price,
          item_list_name: listName,
        },
      });
    });
  }

  // Track search
  trackSearch(searchTerm, resultsCount) {
    this.push({
      event: "search",
      search_term: searchTerm,
      search_results_count: resultsCount,
    });
  }

  // Set user properties (for when user is already logged in)
  setUserProperties(user) {
    this.push({
      user_id: user.id,
      user_properties: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        member_since: user.memberSince,
        customer_lifetime_value: 0, // Could be calculated based on order history
        is_logged_in: true,
      },
    });
  }

  // Clear user properties (on logout)
  clearUserProperties() {
    this.push({
      user_id: null,
      user_properties: {
        is_logged_in: false,
      },
    });
  }

  // Helper function to get category display name
  getCategoryName(category) {
    const categoryNames = {
      men: "Men's Clothing",
      women: "Women's Clothing",
      accessories: "Accessories",
    };
    return categoryNames[category] || category;
  }

  // Helper function to create variant string
  getVariant(size, color) {
    const parts = [];
    if (size) parts.push(size);
    if (color) parts.push(color);
    return parts.length > 0 ? parts.join(" / ") : null;
  }

  // Helper function to get current cart item count
  getCartItemCount() {
    if (typeof cart !== "undefined") {
      return cart.getItemCount();
    }
    return 0;
  }

  // Track page view
  trackPageView(pageName, pageTitle) {
    this.push({
      event: "page_view",
      page_title: pageTitle,
      page_location: window.location.href,
      page_name: pageName,
    });
  }

  // Get current cart state for tracking
  getCartState() {
    if (typeof cart === "undefined") return { items: [], value: 0 };

    return {
      items: cart.items,
      value: cart.getTotal(),
      item_count: cart.getItemCount(),
    };
  }
}

// Initialize DataLayer Manager globally
const dataLayerManager = new DataLayerManager();

// Make it available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = DataLayerManager;
} else {
  window.DataLayerManager = DataLayerManager;
  window.dataLayerManager = dataLayerManager;
}
