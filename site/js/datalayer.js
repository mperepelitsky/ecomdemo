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

  getCurrentUser() {
    if (typeof AuthSystem !== "undefined" && typeof AuthSystem.getCurrentUser === "function") {
      return AuthSystem.getCurrentUser();
    }
    return null;
  }

  getUserProperties(user) {
    if (!user) {
      return {
        is_logged_in: false,
      };
    }

    return {
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      email: user.email || null,
      member_since: user.memberSince || null,
      is_logged_in: true,
    };
  }

  getCustomerData(user) {
    if (!user) return null;

    return {
      id: user.id || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      email: user.email || null,
      member_since: user.memberSince || null,
    };
  }

  formatMoney(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return Number(numericValue.toFixed(2));
  }

  buildEcommerceItems(cartItems) {
    return cartItems
      .map((item) => {
        const product = ProductUtils.getProductById(item.productId);
        if (!product) return null;

        const unitPrice = this.getItemUnitPrice(item, product);
        return {
          item_id: item.productId.toString(),
          item_name: product.name,
          item_category: this.getCategoryName(product.category),
          item_variant: this.getVariant(item.size, item.color),
          quantity: item.quantity,
          price: this.formatMoney(unitPrice),
        };
      })
      .filter(Boolean);
  }

  getCartSummary(cartItems, cartValue) {
    return {
      cart_total_value: this.formatMoney(cartValue),
      cart_total_items: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  }

  buildUserContext(user) {
    return {
      user_id: user ? user.id : null,
      user_properties: this.getUserProperties(user),
      customer: this.getCustomerData(user),
    };
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
        value: this.formatMoney(product.price * quantity),
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_category: this.getCategoryName(product.category),
            item_variant: this.getVariant(size, color),
            quantity: quantity,
            price: this.formatMoney(product.price),
          },
        ],
      },
      cart_total_value: this.formatMoney(cartValue),
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track remove from cart
  trackRemoveFromCart(product, size, color, cartValue) {
    this.push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "USD",
        value: this.formatMoney(product.price),
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_category: this.getCategoryName(product.category),
            item_variant: this.getVariant(size, color),
            quantity: 1,
            price: this.formatMoney(product.price),
          },
        ],
      },
      cart_total_value: this.formatMoney(cartValue),
      cart_total_items: this.getCartItemCount(),
    });
  }

  // Track view cart
  trackViewCart(cartItems, cartValue) {
    const user = this.getCurrentUser();
    const items = this.buildEcommerceItems(cartItems);
    const cartSummary = this.getCartSummary(cartItems, cartValue);

    this.push({
      event: "view_cart",
      ecommerce: {
        currency: "USD",
        value: this.formatMoney(cartValue),
        items: items,
      },
      ...cartSummary,
      ...this.buildUserContext(user),
    });
  }

  trackCartPageView(cartItems, cartValue) {
    const user = this.getCurrentUser();
    const items = this.buildEcommerceItems(cartItems);
    const cartSummary = this.getCartSummary(cartItems, cartValue);

    this.push({
      event: "cart_page_view",
      page_type: "cart",
      ecommerce: {
        currency: "USD",
        value: this.formatMoney(cartValue),
        items: items,
      },
      ...cartSummary,
      ...this.buildUserContext(user),
    });
  }

  // Track begin checkout
  trackBeginCheckout(cartItems, cartValue) {
    const user = this.getCurrentUser();
    const items = this.buildEcommerceItems(cartItems);
    const cartSummary = this.getCartSummary(cartItems, cartValue);

    this.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "USD",
        value: this.formatMoney(cartValue),
        items: items,
      },
      ...cartSummary,
      ...this.buildUserContext(user),
    });
  }

  trackCheckoutPageView(cartItems, cartValue) {
    const user = this.getCurrentUser();
    const items = this.buildEcommerceItems(cartItems);
    const cartSummary = this.getCartSummary(cartItems, cartValue);

    this.push({
      event: "checkout_page_view",
      page_type: "checkout",
      ecommerce: {
        currency: "USD",
        value: this.formatMoney(cartValue),
        items: items,
      },
      ...cartSummary,
      ...this.buildUserContext(user),
    });
  }

  // Track purchase completion
  trackPurchase(order) {
    const items = this.buildEcommerceItems(order.items || []);
    const orderValue = this.formatMoney(order.total);
    const cartSummary = this.getCartSummary(order.items || [], orderValue);

    this.push({
      event: "purchase",
      ecommerce: {
        transaction_id: order.id,
        currency: "USD",
        value: orderValue,
        items: items,
      },
      ...cartSummary,
      ...this.buildUserContext(order.customer || null),
      order: {
        order_id: order.id,
        order_date: order.date || null,
        payment_method: order.payment?.method || null,
        payment_status: order.payment?.status || null,
        currency: "USD",
        value: orderValue,
        item_count: cartSummary.cart_total_items,
        items: items,
      },
    });
  }

  trackOrderConfirmationView(order) {
    const items = this.buildEcommerceItems(order.items || []);
    const orderValue = this.formatMoney(order.total);
    const cartSummary = this.getCartSummary(order.items || [], orderValue);

    this.push({
      event: "order_confirmation_view",
      page_type: "purchase",
      ...this.buildUserContext(order.customer || null),
      order: {
        order_id: order.id,
        order_date: order.date || null,
        payment_method: order.payment?.method || null,
        payment_status: order.payment?.status || null,
        currency: "USD",
        value: orderValue,
        item_count: cartSummary.cart_total_items,
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
        price: this.formatMoney(product.price),
      },
    });
  }

  // Track product list view (consolidated into one event)
  trackViewItemList(products, listName) {
    const items = products.map((product, index) => ({
      item_id: product.id.toString(),
      item_name: product.name,
      item_category: this.getCategoryName(product.category),
      price: this.formatMoney(product.price),
      index: index + 1, // Position of the item in the list
    }));

    this.push({
      event: "view_item_list",
      ecommerce: {
        item_list_name: listName,
        items: items,
      },
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
        customer_lifetime_value: this.formatMoney(0), // Could be calculated based on order history
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

  getItemUnitPrice(item, product) {
    if (typeof item.unitPrice === "number") return item.unitPrice;
    if (typeof item.price === "number") return item.price;
    return product ? product.price : 0;
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
      value: this.formatMoney(cart.getTotal()),
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
