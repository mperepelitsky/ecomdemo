// Product page functionality
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentQuantity = 1;

document.addEventListener("DOMContentLoaded", function () {
  initializeProductPage();
});

function initializeProductPage() {
  loadProductDetails();
  initializeQuantityControls();
  initializeAddToCartButton();
}

// Load product details from URL parameter
function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "categories.html";
    return;
  }

  currentProduct = ProductUtils.getProductById(parseInt(productId));

  if (!currentProduct) {
    alert("Product not found!");
    window.location.href = "categories.html";
    return;
  }

  displayProductDetails();
  loadRelatedProducts();
  updateBreadcrumb();

  // DataLayer: Track product detail view
  if (typeof dataLayerManager !== "undefined" && currentProduct) {
    dataLayerManager.trackViewItem(currentProduct);
  }
}

// Display product details
function displayProductDetails() {
  if (!currentProduct) return;

  // Update basic product info
  document.getElementById("productName").textContent = currentProduct.name;
  document.getElementById("productPrice").textContent =
    ProductUtils.formatPrice(currentProduct.price);
  document.getElementById("productDescription").textContent =
    currentProduct.description;

  // Update main image
  const productImage = document.getElementById("productImage");
  productImage.src = currentProduct.image;
  productImage.alt = currentProduct.name;

  // Update thumbnails
  updateProductThumbnails();

  // Update size options
  updateSizeOptions();

  // Update color options
  updateColorOptions();

  // Set document title
  document.title = `${currentProduct.name} - ClothingHub`;
}

// Update product thumbnails
function updateProductThumbnails() {
  const thumbnailsContainer = document.getElementById("productThumbnails");
  if (!thumbnailsContainer || !currentProduct.images) return;

  const images =
    currentProduct.images.length > 1
      ? currentProduct.images
      : [currentProduct.image];

  thumbnailsContainer.innerHTML = images
    .map(
      (image, index) => `
        <button onclick="changeMainImage('${image}')" class="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition duration-300">
            <img src="${image}" alt="Product thumbnail ${
        index + 1
      }" class="w-full h-20 object-cover">
        </button>
    `
    )
    .join("");
}

// Change main product image
function changeMainImage(imageSrc) {
  const productImage = document.getElementById("productImage");
  if (productImage) {
    productImage.src = imageSrc;
  }
}

// Update size options
function updateSizeOptions() {
  const sizeSection = document.getElementById("sizeSection");
  const sizeOptions = document.getElementById("sizeOptions");

  if (!currentProduct.sizes || currentProduct.sizes.length <= 1) {
    if (sizeSection) sizeSection.style.display = "none";
    return;
  }

  if (sizeSection) sizeSection.style.display = "block";

  if (sizeOptions) {
    sizeOptions.innerHTML = currentProduct.sizes
      .map(
        (size) => `
            <button onclick="selectSize('${size}')" 
                    class="size-option px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition duration-300" 
                    data-size="${size}">
                ${size}
            </button>
        `
      )
      .join("");

    // Auto-select first size
    if (currentProduct.sizes.length > 0) {
      selectSize(currentProduct.sizes[0]);
    }
  }
}

// Update color options
function updateColorOptions() {
  const colorSection = document.getElementById("colorSection");
  const colorOptions = document.getElementById("colorOptions");

  if (!currentProduct.colors || currentProduct.colors.length <= 1) {
    if (colorSection) colorSection.style.display = "none";
    return;
  }

  if (colorSection) colorSection.style.display = "block";

  if (colorOptions) {
    colorOptions.innerHTML = currentProduct.colors
      .map(
        (color) => `
            <button onclick="selectColor('${color}')" 
                    class="color-option px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition duration-300" 
                    data-color="${color}">
                <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 rounded-full border" style="background-color: ${getColorHex(
                      color
                    )}"></div>
                    <span>${color}</span>
                </div>
            </button>
        `
      )
      .join("");

    // Auto-select first color
    if (currentProduct.colors.length > 0) {
      selectColor(currentProduct.colors[0]);
    }
  }
}

// Select size
function selectSize(size) {
  selectedSize = size;

  // Update UI
  document.querySelectorAll(".size-option").forEach((btn) => {
    btn.classList.remove("border-blue-500", "bg-blue-50");
    btn.classList.add("border-gray-300");
  });

  const selectedBtn = document.querySelector(`[data-size="${size}"]`);
  if (selectedBtn) {
    selectedBtn.classList.remove("border-gray-300");
    selectedBtn.classList.add("border-blue-500", "bg-blue-50");
  }

  // Set selected size attribute for personalization resolver
  const sizeOptions = document.getElementById("sizeOptions");
  if (sizeOptions) {
    sizeOptions.setAttribute("data-selected-size", size);
  }
}

// Select color
function selectColor(color) {
  selectedColor = color;

  // Update UI
  document.querySelectorAll(".color-option").forEach((btn) => {
    btn.classList.remove("border-blue-500", "bg-blue-50");
    btn.classList.add("border-gray-300");
  });

  const selectedBtn = document.querySelector(`[data-color="${color}"]`);
  if (selectedBtn) {
    selectedBtn.classList.remove("border-gray-300");
    selectedBtn.classList.add("border-blue-500", "bg-blue-50");
  }

  // Set selected color attribute for personalization resolver
  const colorOptions = document.getElementById("colorOptions");
  if (colorOptions) {
    colorOptions.setAttribute("data-selected-color", color);
  }
}

// Get hex color for color names
function getColorHex(colorName) {
  const colors = {
    white: "#ffffff",
    black: "#000000",
    gray: "#808080",
    grey: "#808080",
    blue: "#3b82f6",
    "light blue": "#93c5fd",
    "dark blue": "#1e40af",
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
    gold: "#ffd700",
  };

  const normalizedColor = colorName.toLowerCase();
  return colors[normalizedColor] || "#d1d5db";
}

// Initialize quantity controls
function initializeQuantityControls() {
  const decreaseBtn = document.getElementById("decreaseQty");
  const increaseBtn = document.getElementById("increaseQty");

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => changeQuantity(-1));
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => changeQuantity(1));
  }
}

// Change quantity
function changeQuantity(change) {
  currentQuantity = Math.max(1, currentQuantity + change);
  document.getElementById("quantity").textContent = currentQuantity;
}

// Initialize add to cart button
function initializeAddToCartButton() {
  const addToCartBtn = document.getElementById("addToCartBtn");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addToCart);
  }
}

// Add product to cart
function addToCart() {
  if (!currentProduct) return;

  // Validate required selections
  if (
    currentProduct.sizes &&
    currentProduct.sizes.length > 1 &&
    !selectedSize
  ) {
    alert("Please select a size.");
    return;
  }

  if (
    currentProduct.colors &&
    currentProduct.colors.length > 1 &&
    !selectedColor
  ) {
    alert("Please select a color.");
    return;
  }

  // Add to cart
  const success = cart.addItem(
    currentProduct.id,
    currentQuantity,
    selectedSize,
    selectedColor
  );

  if (success) {
    // Show visual feedback
    const addToCartBtn = document.getElementById("addToCartBtn");
    const originalText = addToCartBtn.innerHTML;

    addToCartBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Added!';
    addToCartBtn.classList.add("bg-green-600");
    addToCartBtn.classList.remove("bg-blue-600");

    setTimeout(() => {
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.classList.remove("bg-green-600");
      addToCartBtn.classList.add("bg-blue-600");
    }, 2000);
  }
}

// Load related products
function loadRelatedProducts() {
  if (!currentProduct) return;

  const relatedProducts = ProductUtils.getRelatedProducts(currentProduct.id, 4);
  const relatedContainer = document.getElementById("relatedProducts");

  if (!relatedContainer) return;

  if (relatedProducts.length === 0) {
    relatedContainer.parentElement.style.display = "none";
    return;
  }

  relatedContainer.innerHTML = relatedProducts
    .map((product) => createRelatedProductCard(product))
    .join("");
}

// Create related product card
function createRelatedProductCard(product) {
  return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
            <div class="relative">
                <img src="${product.image}" alt="${
    product.name
  }" class="w-full h-48 object-cover">
                <div class="absolute top-2 right-2">
                    <button class="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h4 class="font-semibold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer" onclick="viewProduct(${
                  product.id
                })">${product.name}</h4>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${
                  product.description
                }</p>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-blue-600">${ProductUtils.formatPrice(
                      product.price
                    )}</span>
                    <button onclick="viewProduct(${product.id})" 
                            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 text-sm">
                        View
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update breadcrumb
function updateBreadcrumb() {
  if (!currentProduct) return;

  const breadcrumbCategory = document.getElementById("breadcrumbCategory");
  const breadcrumbProduct = document.getElementById("breadcrumbProduct");

  if (breadcrumbCategory) {
    const categoryNames = {
      men: "Men's Clothing",
      women: "Women's Clothing",
      accessories: "Accessories",
    };
    breadcrumbCategory.textContent =
      categoryNames[currentProduct.category] || currentProduct.category;

    // Make category clickable
    breadcrumbCategory.onclick = () => {
      window.location.href = `categories.html?category=${currentProduct.category}`;
    };
    breadcrumbCategory.style.cursor = "pointer";
    breadcrumbCategory.classList.add("hover:text-blue-800");
  }

  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = currentProduct.name;
  }
}

// View product (for related products)
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}
