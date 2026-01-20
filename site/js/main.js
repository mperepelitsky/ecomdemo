// Main JavaScript for ClothingHub
document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile menu
  initializeMobileMenu();

  // Load featured products on homepage
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/")
  ) {
    loadFeaturedProducts();
  }

  // Update user authentication state
  updateAuthState();
});

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById("mobileMenuButton");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      if (
        mobileMenu.style.display === "none" ||
        mobileMenu.style.display === ""
      ) {
        mobileMenu.style.display = "block";
        mobileMenuButton.innerHTML = '<i class="fas fa-times text-lg"></i>';
      } else {
        mobileMenu.style.display = "none";
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-lg"></i>';
      }
    });

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll("a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.style.display = "none";
        mobileMenuButton.innerHTML = '<i class="fas fa-bars text-lg"></i>';
      });
    });
  }
}

// Load featured products for homepage
function loadFeaturedProducts() {
  const featuredProductsContainer = document.getElementById("featuredProducts");

  if (!featuredProductsContainer) return;

  const featuredProducts = ProductUtils.getFeaturedProducts(4);

  featuredProductsContainer.innerHTML = featuredProducts
    .map((product) => createProductCard(product))
    .join("");
}

// Create product card HTML
function createProductCard(product) {
  return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
            <div class="relative">
                <img src="${product.image}" alt="${
    product.name
  }" class="w-full h-64 object-cover">
                <div class="absolute top-2 right-2">
                    <button class="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition duration-300">
                        <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 mb-2">${
                  product.name
                }</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${
                  product.description
                }</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-blue-600">${ProductUtils.formatPrice(
                      product.price
                    )}</span>
                    <div class="flex space-x-2">
                        <button onclick="viewProduct(${product.id})" 
                                class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-300 text-sm">
                            View
                        </button>
                        <button onclick="addToCartQuick(${product.id})" 
                                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 text-sm">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Quick add to cart (uses default options)
function addToCartQuick(productId) {
  const product = ProductUtils.getProductById(productId);
  if (!product) return;

  // Use first available size and color as defaults
  const defaultSize =
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
  const defaultColor =
    product.colors && product.colors.length > 0 ? product.colors[0] : null;

  cart.addItem(productId, 1, defaultSize, defaultColor);
}

// View product details
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Update authentication state in UI
function updateAuthState() {
  // Check if AuthSystem is available
  if (typeof AuthSystem === "undefined") {
    console.warn("AuthSystem not available");
    return;
  }

  const currentUser = AuthSystem.getCurrentUser();
  const userIcon = document.getElementById("userIcon");

  if (userIcon) {
    if (currentUser) {
      // User is logged in
      userIcon.innerHTML =
        '<i class="fas fa-user-circle text-lg text-blue-600"></i>';
      userIcon.title = `Logged in as ${currentUser.firstName}`;

      // Update user icon click behavior
      userIcon.onclick = function (e) {
        e.preventDefault();
        showUserMenu();
      };
    } else {
      // User is not logged in
      userIcon.innerHTML = '<i class="fas fa-user text-lg"></i>';
      userIcon.title = "Login / Register";

      // Reset click behavior
      userIcon.onclick = null;
    }
  }
}

// Show user menu when logged in
function showUserMenu() {
  // Check if AuthSystem is available
  if (typeof AuthSystem === "undefined") {
    console.warn("AuthSystem not available");
    return;
  }

  const currentUser = AuthSystem.getCurrentUser();
  if (!currentUser) return;

  // Create dropdown menu
  const existingMenu = document.getElementById("userDropdownMenu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement("div");
  menu.id = "userDropdownMenu";
  menu.className =
    "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border";
  menu.style.top = "100%";
  menu.style.right = "0";

  menu.innerHTML = `
        <div class="py-1">
            <div class="px-4 py-2 text-sm text-gray-700 border-b">
                <div class="font-semibold">${currentUser.firstName} ${currentUser.lastName}</div>
                <div class="text-xs text-gray-500">${currentUser.email}</div>
            </div>
            <a href="login.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="fas fa-user mr-2"></i>My Account
            </a>
            <a href="#" onclick="showOrderHistory()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="fas fa-shopping-bag mr-2"></i>Order History
            </a>
            <a href="#" onclick="showWishlist()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="fas fa-heart mr-2"></i>Wishlist
            </a>
            <div class="border-t">
                <a href="#" onclick="authSystem.logout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </a>
            </div>
        </div>
    `;

  // Position menu relative to user icon
  const userIcon = document.getElementById("userIcon");
  const iconRect = userIcon.getBoundingClientRect();

  menu.style.position = "fixed";
  menu.style.top = `${iconRect.bottom + 5}px`;
  menu.style.right = `${window.innerWidth - iconRect.right}px`;

  document.body.appendChild(menu);

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target) && !userIcon.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 100);
}

// Placeholder functions for user menu items
function showOrderHistory() {
  alert("Order History feature coming soon! This is a demo site.");
  document.getElementById("userDropdownMenu")?.remove();
}

function showWishlist() {
  alert("Wishlist feature coming soon! This is a demo site.");
  document.getElementById("userDropdownMenu")?.remove();
}

// Smooth scrolling for anchor links
document.addEventListener("click", function (e) {
  if (
    e.target.tagName === "A" &&
    e.target.getAttribute("href")?.startsWith("#")
  ) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
});

// Search functionality (if search input exists)
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", performSearch);
  }
}

function performSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const query = searchInput.value.trim();
  if (query) {
    window.location.href = `categories.html?search=${encodeURIComponent(
      query
    )}`;
  }
}

// Initialize search if elements exist
document.addEventListener("DOMContentLoaded", initializeSearch);

// Back to top button functionality
function initializeBackToTop() {
  const backToTopBtn = document.createElement("button");
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.className =
    "fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-300 opacity-0 pointer-events-none z-40";
  backToTopBtn.id = "backToTop";

  document.body.appendChild(backToTopBtn);

  // Show/hide based on scroll position
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.opacity = "1";
      backToTopBtn.style.pointerEvents = "auto";
    } else {
      backToTopBtn.style.opacity = "0";
      backToTopBtn.style.pointerEvents = "none";
    }
  });

  // Scroll to top when clicked
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Initialize back to top button
document.addEventListener("DOMContentLoaded", initializeBackToTop);
