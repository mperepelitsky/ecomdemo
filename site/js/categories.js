// Categories page functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeCategoryPage();
});

function initializeCategoryPage() {
  loadCategoryProducts();
  initializeFilters();
  initializeSorting();
  updateCategoryHeader();
}

// Load products based on category and filters
function loadCategoryProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "all";
  const searchQuery = urlParams.get("search");

  let products;

  if (searchQuery) {
    // Search products
    products = ProductUtils.searchProducts(searchQuery);
  } else {
    // Get products by category
    products = ProductUtils.getProductsByCategory(category);
  }

  // Apply current sort
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    products = ProductUtils.sortProducts(products, sortSelect.value);
  }

  displayProducts(products);
  updateActiveFilter(category);

  // DataLayer: Track category or search view
  if (typeof dataLayerManager !== "undefined") {
    if (searchQuery) {
      dataLayerManager.trackSearch(searchQuery, products.length);
      dataLayerManager.trackViewItemList(products, `Search: ${searchQuery}`);
    } else {
      const listName =
        category === "all" ? "All Products" : getCategoryDisplayName(category);
      dataLayerManager.trackViewItemList(products, listName);
    }
  }
}

// Display products in grid
function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  const noProducts = document.getElementById("noProducts");

  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML = "";
    if (noProducts) noProducts.classList.remove("hidden");
    return;
  }

  if (noProducts) noProducts.classList.add("hidden");

  productsGrid.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
}

// Create product card for categories page
function createProductCard(product) {
  return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
            <div class="relative group">
                <img src="${product.image}" alt="${
    product.name
  }" class="w-full h-64 object-cover group-hover:scale-105 transition duration-300">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
                <div class="absolute top-2 right-2">
                    <button onclick="toggleWishlist(${
                      product.id
                    })" class="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                    </button>
                </div>
                <div class="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    <span class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">${getCategoryDisplayName(
                      product.category
                    )}</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer" onclick="viewProduct(${
                  product.id
                })">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${
                  product.description
                }</p>
                
                <!-- Size and Color options -->
                <div class="mb-3 space-y-2">
                    ${
                      product.sizes && product.sizes.length > 1
                        ? `
                        <div class="flex flex-wrap gap-1">
                            <span class="text-xs text-gray-500">Sizes:</span>
                            ${product.sizes
                              .slice(0, 4)
                              .map(
                                (size) =>
                                  `<span class="text-xs bg-gray-100 px-2 py-1 rounded">${size}</span>`
                              )
                              .join("")}
                            ${
                              product.sizes.length > 4
                                ? `<span class="text-xs text-gray-500">+${
                                    product.sizes.length - 4
                                  }</span>`
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      product.colors && product.colors.length > 1
                        ? `
                        <div class="flex items-center gap-1">
                            <span class="text-xs text-gray-500">Colors:</span>
                            ${product.colors
                              .slice(0, 3)
                              .map(
                                (color) =>
                                  `<div class="w-4 h-4 rounded-full border" style="background-color: ${getColorHex(
                                    color
                                  )}" title="${color}"></div>`
                              )
                              .join("")}
                            ${
                              product.colors.length > 3
                                ? `<span class="text-xs text-gray-500">+${
                                    product.colors.length - 3
                                  }</span>`
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-blue-600">${ProductUtils.formatPrice(
                      product.price
                    )}</span>
                    <div class="flex space-x-2">
                        <button onclick="viewProduct(${product.id})" 
                                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 text-sm font-medium">
                            View Details
                        </button>
                        <button onclick="showQuickAdd(${product.id})" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-sm font-medium">
                            <i class="fas fa-cart-plus mr-1"></i>Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get category display name
function getCategoryDisplayName(category) {
  const categoryNames = {
    men: "Men's",
    women: "Women's",
    accessories: "Accessories",
  };
  return categoryNames[category] || category;
}

// Get hex color for color names (simplified)
function getColorHex(colorName) {
  const colors = {
    white: "#ffffff",
    black: "#000000",
    gray: "#808080",
    grey: "#808080",
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#10b981",
    yellow: "#f59e0b",
    pink: "#ec4899",
    purple: "#8b5cf6",
    brown: "#a3542f",
    tan: "#d2b48c",
    navy: "#1e3a8a",
    cream: "#f5f5dc",
    burgundy: "#800020",
    olive: "#808000",
    khaki: "#f0e68c",
  };

  const normalizedColor = colorName.toLowerCase().split(" ")[0];
  return colors[normalizedColor] || "#d1d5db";
}

// Show quick add modal
function showQuickAdd(productId) {
  const product = ProductUtils.getProductById(productId);
  if (!product) return;

  // Create modal
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.id = "quickAddModal";

  modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Add to Cart</h3>
                    <button onclick="closeQuickAdd()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="flex space-x-4 mb-4">
                    <img src="${product.image}" alt="${
    product.name
  }" class="w-20 h-20 object-cover rounded">
                    <div>
                        <h4 class="font-semibold">${product.name}</h4>
                        <p class="text-blue-600 font-bold">${ProductUtils.formatPrice(
                          product.price
                        )}</p>
                    </div>
                </div>
                
                ${
                  product.sizes && product.sizes.length > 1
                    ? `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <select id="quickAddSize" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            ${product.sizes
                              .map(
                                (size) =>
                                  `<option value="${size}">${size}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                `
                    : ""
                }
                
                ${
                  product.colors && product.colors.length > 1
                    ? `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <select id="quickAddColor" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            ${product.colors
                              .map(
                                (color) =>
                                  `<option value="${color}">${color}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                `
                    : ""
                }
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div class="flex items-center space-x-3">
                        <button onclick="changeQuickAddQuantity(-1)" class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">-</button>
                        <span id="quickAddQuantity" class="font-semibold">1</span>
                        <button onclick="changeQuickAddQuantity(1)" class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">+</button>
                    </div>
                </div>
                
                <button onclick="addToCartFromQuickAdd(${productId})" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
}

// Close quick add modal
function closeQuickAdd() {
  const modal = document.getElementById("quickAddModal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
}

// Change quantity in quick add modal
function changeQuickAddQuantity(change) {
  const quantityElement = document.getElementById("quickAddQuantity");
  if (!quantityElement) return;

  let quantity = parseInt(quantityElement.textContent);
  quantity = Math.max(1, quantity + change);
  quantityElement.textContent = quantity;
}

// Add to cart from quick add modal
function addToCartFromQuickAdd(productId) {
  const sizeSelect = document.getElementById("quickAddSize");
  const colorSelect = document.getElementById("quickAddColor");
  const quantityElement = document.getElementById("quickAddQuantity");

  const size = sizeSelect ? sizeSelect.value : null;
  const color = colorSelect ? colorSelect.value : null;
  const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;

  cart.addItem(productId, quantity, size, color);
  closeQuickAdd();
}

// Initialize filter buttons
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".category-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.dataset.category;
      updateURL({ category: category === "all" ? null : category });
      loadCategoryProducts();
    });
  });
}

// Initialize sorting
function initializeSorting() {
  const sortSelect = document.getElementById("sortSelect");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      loadCategoryProducts();
    });
  }
}

// Update active filter button
function updateActiveFilter(category) {
  const filterButtons = document.querySelectorAll(".category-filter");

  filterButtons.forEach((button) => {
    if (
      button.dataset.category === category ||
      (category === "all" && button.dataset.category === "all")
    ) {
      button.classList.remove("bg-gray-200", "text-gray-700");
      button.classList.add("bg-blue-600", "text-white", "active");
    } else {
      button.classList.remove("bg-blue-600", "text-white", "active");
      button.classList.add("bg-gray-200", "text-gray-700");
    }
  });
}

// Update category header
function updateCategoryHeader() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const searchQuery = urlParams.get("search");

  const categoryTitle = document.getElementById("categoryTitle");
  const categoryDescription = document.getElementById("categoryDescription");

  if (!categoryTitle) return;

  if (searchQuery) {
    categoryTitle.textContent = `Search Results`;
    if (categoryDescription) {
      categoryDescription.textContent = `Results for "${searchQuery}"`;
    }
  } else if (category) {
    const categoryInfo = {
      men: {
        title: "Men's Clothing",
        description: "Discover our collection of men's fashion essentials",
      },
      women: {
        title: "Women's Clothing",
        description: "Explore our stylish women's fashion collection",
      },
      accessories: {
        title: "Accessories",
        description: "Complete your look with our premium accessories",
      },
    };

    const info = categoryInfo[category];
    if (info) {
      categoryTitle.textContent = info.title;
      if (categoryDescription) {
        categoryDescription.textContent = info.description;
      }
    }
  } else {
    categoryTitle.textContent = "All Categories";
    if (categoryDescription) {
      categoryDescription.textContent =
        "Discover our complete collection of fashion items";
    }
  }
}

// Update URL without page reload
function updateURL(params) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, params[key]);
    }
  });

  window.history.replaceState({}, "", url);
}

// View product details
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Toggle wishlist (placeholder)
function toggleWishlist(productId) {
  // Placeholder for wishlist functionality
  alert("Wishlist feature coming soon! This is a demo site.");
}
