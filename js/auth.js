// Authentication System for ClothingHub Demo
class AuthSystem {
  constructor() {
    console.log("AuthSystem initializing...");
    this.currentUser = AuthSystem.getCurrentUser();
    this.initializeEventListeners();
    this.updateUIForCurrentUser();
    console.log("AuthSystem initialized");
  }

  // Get current user from localStorage
  static getCurrentUser() {
    const saved = localStorage.getItem("chezMikePHubUser");
    return saved ? JSON.parse(saved) : null;
  }

  // Save user to localStorage
  saveUser(user) {
    localStorage.setItem("chezMikePHubUser", JSON.stringify(user));
    this.currentUser = user;
    this.updateUIForCurrentUser();
  }

  // Remove user from localStorage
  logout() {
    localStorage.removeItem("chezMikePHubUser");
    this.currentUser = null;
    this.updateUIForCurrentUser();

    // Show logout message
    this.showMessage("You have been logged out successfully.", "success");

    // Redirect to home page if on login page
    if (window.location.pathname.includes("login.html")) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    return password.length >= 8;
  }

  // Register new user
  register(firstName, lastName, email, password, confirmPassword) {
    console.log("Register method called with:", { firstName, lastName, email });

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      this.showMessage("Please fill in all required fields.", "error");
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return false;
    }

    if (!this.validatePassword(password)) {
      this.showMessage("Password must be at least 8 characters long.", "error");
      return false;
    }

    if (password !== confirmPassword) {
      this.showMessage("Passwords do not match.", "error");
      return false;
    }

    // Check if user already exists (in real app, this would be server-side)
    const existingUsers = this.getAllUsers();
    if (existingUsers.find((user) => user.email === email)) {
      this.showMessage("An account with this email already exists.", "error");
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now(), // Simple ID generation for demo
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      memberSince: new Date().toISOString(),
      loginHistory: [],
      orders: [], // Initialize with empty orders array
    };

    console.log("Creating new user:", newUser);

    // Save user to "database" (localStorage for demo)
    this.addUserToDatabase(newUser);

    // Save as current user
    this.saveUser(newUser);

    // Track user registration in DataLayer
    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackUserRegistration({
        user_id: newUser.email,
        signUpMethod: "email",
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        memberSince: newUser.memberSince,
      });
    }

    this.showMessage(`Welcome to chezMikeP, ${firstName}!`, "success");
    console.log("User registration successful");
    return true;
  }

  // Login user
  login(email, password) {
    if (!email.trim() || !password.trim()) {
      this.showMessage("Please enter both email and password.", "error");
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return false;
    }

    // For demo purposes, we'll accept any valid email/password combination
    // In a real app, this would verify against a secure backend
    const existingUsers = this.getAllUsers();
    const user = existingUsers.find(
      (u) => u.email === email.toLowerCase().trim()
    );

    if (!user) {
      // For demo, create user if they don't exist
      const newUser = {
        id: Date.now(),
        firstName: "Demo",
        lastName: "User",
        email: email.toLowerCase().trim(),
        memberSince: new Date().toISOString(),
        loginHistory: [],
      };
      this.addUserToDatabase(newUser);
      this.saveUser(newUser);

      // Track user registration in DataLayer
      if (typeof dataLayerManager !== "undefined") {
        dataLayerManager.trackUserRegistration({
          user_id: newUser.email,
          signUpMethod: "email",
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          memberSince: newUser.memberSince,
        });
      }
    } else {
      // Update login history
      user.loginHistory.push(new Date().toISOString());
      this.updateUserInDatabase(user);
      this.saveUser(user);
    }

    // Track user login in DataLayer
    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackUserLogin({
        user_id: email.toLowerCase().trim(),
        method: "email",
      });
    }

    this.showMessage("Login successful!", "success");
    return true;
  }

  // Get all users from localStorage (demo database)
  getAllUsers() {
    const saved = localStorage.getItem("chezMikePHubUsers");
    return saved ? JSON.parse(saved) : [];
  }

  // Add user to localStorage database
  addUserToDatabase(user) {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem("chezMikePHubUsers", JSON.stringify(users));
  }

  // Update user in localStorage database
  updateUserInDatabase(updatedUser) {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === updatedUser.id);
    if (index > -1) {
      users[index] = updatedUser;
      localStorage.setItem("chezMikePHubUsers", JSON.stringify(users));
    }
  }

  // Show message to user
  showMessage(message, type = "info") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".auth-message");
    existingMessages.forEach((msg) => msg.remove());

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `auth-message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;

    switch (type) {
      case "success":
        messageDiv.classList.add("bg-green-500", "text-white");
        break;
      case "error":
        messageDiv.classList.add("bg-red-500", "text-white");
        break;
      default:
        messageDiv.classList.add("bg-blue-500", "text-white");
    }

    messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-circle"
                    : "info-circle"
                }"></i>
                <span>${message}</span>
            </div>
        `;

    document.body.appendChild(messageDiv);

    // Slide in
    setTimeout(() => {
      messageDiv.classList.remove("translate-x-full");
    }, 100);

    // Slide out and remove
    setTimeout(() => {
      messageDiv.classList.add("translate-x-full");
      setTimeout(() => {
        if (messageDiv.parentNode) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }, 4000);
  }

  // Update UI based on current user
  updateUIForCurrentUser() {
    // Update user icon and navigation
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
      if (this.currentUser) {
        userIcon.innerHTML = `<i class="fas fa-user-circle text-lg text-blue-600"></i>`;
        userIcon.title = `Logged in as ${this.currentUser.firstName}`;
      } else {
        userIcon.innerHTML = `<i class="fas fa-user text-lg"></i>`;
        userIcon.title = "Login / Register";
      }
    }

    // Update login page if we're on it
    if (window.location.pathname.includes("login.html")) {
      this.updateLoginPage();
    }
  }

  // Update login page based on authentication state
  updateLoginPage() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const userDashboard = document.getElementById("userDashboard");

    if (this.currentUser) {
      // Show dashboard
      if (loginForm) loginForm.classList.add("hidden");
      if (registerForm) registerForm.classList.add("hidden");
      if (userDashboard) {
        userDashboard.classList.remove("hidden");
        this.updateDashboard();
      }
      // Render order History (with toggle)
      const user = AuthSystem.getCurrentUser();
      const orders = user.orders || [];
      const orderHistoryDiv = document.getElementById("orderHistory");
      const orderHistorySection = document.getElementById(
        "orderHistorySection"
      );
      if (orderHistoryDiv) {
        orderHistoryDiv.innerHTML =
          orders.length === 0
            ? "<p>No orders found.</p>"
            : orders
                .map(
                  (order) => `
          <div class="border-b py-2">
              <p class="font-semibold">Order ID: ${order.id}</p>
              <p>Total: ${ProductUtils.formatPrice(order.total)}</p>
              <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
              <h4 class="text-sm font-semibold mt-2">Items:</h4>
              <ul class="list-disc pl-5">
                  ${order.items
                    .map((item) => {
                      const product = ProductUtils.getProductById(
                        item.productId
                      );
                      return `
                        <li>
                          ${product ? product.name : item.productId}
                          (x${item.quantity})
                          ${item.size ? `- Size: ${item.size}` : ""}
                          ${item.color ? `- Color: ${item.color}` : ""}
                          - ${ProductUtils.formatPrice(
                            item.price * item.quantity
                          )}
                        </li>
                      `;
                    })
                    .join("")}
              </ul>
          </div>
      `
                )
                .join("");
      }
      // Add toggle logic for order history
      const toggleBtn = document.getElementById("toggleOrderHistoryBtn");
      if (toggleBtn && orderHistorySection) {
        toggleBtn.onclick = function () {
          if (orderHistorySection.style.display === "none") {
            orderHistorySection.style.display = "block";
          } else {
            orderHistorySection.style.display = "none";
          }
        };
      }
    } else {
      // Show login form
      if (loginForm) loginForm.classList.remove("hidden");
      if (registerForm) registerForm.classList.add("hidden");
      if (userDashboard) userDashboard.classList.add("hidden");
    }
  }

  // Update user dashboard
  updateDashboard() {
    if (!this.currentUser) return;

    const userWelcome = document.getElementById("userWelcome");
    const displayName = document.getElementById("displayName");
    const displayEmail = document.getElementById("displayEmail");
    const memberSince = document.getElementById("memberSince");

    if (userWelcome) {
      userWelcome.textContent = `Hello, ${this.currentUser.firstName}!`;
    }

    if (displayName) {
      displayName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    if (displayEmail) {
      displayEmail.textContent = this.currentUser.email;
    }

    if (memberSince && this.currentUser.memberSince) {
      const date = new Date(this.currentUser.memberSince);
      memberSince.textContent = date.toLocaleDateString();
    }
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Use a function that works both during and after DOM loading
    const setupEventListeners = () => {
      // Login form submission
      const loginForm = document.querySelector("#loginForm form");
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const email = document.getElementById("loginEmail").value;
          const password = document.getElementById("loginPassword").value;

          if (this.login(email, password)) {
            setTimeout(() => {
              this.updateLoginPage();
            }, 1000);
          }
        });
      }

      // Register form submission
      const registerForm = document.querySelector("#registerForm form");
      if (registerForm) {
        console.log("Register form found, adding event listener");
        registerForm.addEventListener("submit", (e) => {
          console.log("Register form submitted");
          e.preventDefault();
          const firstName = document.getElementById("firstName").value;
          const lastName = document.getElementById("lastName").value;
          const email = document.getElementById("registerEmail").value;
          const password = document.getElementById("registerPassword").value;
          const confirmPassword =
            document.getElementById("confirmPassword").value;

          console.log("Form values:", { firstName, lastName, email });

          if (
            this.register(firstName, lastName, email, password, confirmPassword)
          ) {
            setTimeout(() => {
              this.updateLoginPage();
            }, 1000);
          }
        });
      } else {
        console.log("Register form not found");
      }

      // Form toggle buttons
      const showRegisterBtn = document.getElementById("showRegister");
      const showLoginBtn = document.getElementById("showLogin");
      const logoutBtn = document.getElementById("logoutBtn");

      if (showRegisterBtn) {
        showRegisterBtn.addEventListener("click", () => {
          document.getElementById("loginForm").classList.add("hidden");
          document.getElementById("registerForm").classList.remove("hidden");
        });
      }

      if (showLoginBtn) {
        showLoginBtn.addEventListener("click", () => {
          document.getElementById("registerForm").classList.add("hidden");
          document.getElementById("loginForm").classList.remove("hidden");
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          this.logout();
        });
      }
    };

    // Setup listeners now if DOM is ready, or wait for it
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupEventListeners);
    } else {
      setupEventListeners();
    }
  }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Make auth system available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthSystem;
} else {
  window.AuthSystem = AuthSystem;
  window.authSystem = authSystem;
}
