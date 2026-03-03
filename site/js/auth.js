// Authentication System for VibeThread Demo
class AuthSystem {
  constructor() {
    this.currentUser = AuthSystem.getCurrentUser();
    this.currentUser = this.ensureCurrentUserDefaults();
    this.initializeEventListeners();
    this.updateUIForCurrentUser();
  }

  // Get current user from localStorage
  static getCurrentUser() {
    const saved = localStorage.getItem("vibeThreadUser");
    return saved ? JSON.parse(saved) : null;
  }

  // Normalize user shape so older records continue to work.
  static normalizeUserRecord(user) {
    if (!user) return null;

    return {
      ...user,
      id: user.id || Date.now(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: (user.email || "").toLowerCase().trim(),
      memberSince: user.memberSince || new Date().toISOString(),
      loginHistory: Array.isArray(user.loginHistory) ? user.loginHistory : [],
      orders: Array.isArray(user.orders) ? user.orders : [],
      addresses: Array.isArray(user.addresses) ? user.addresses : [],
      wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],
      preferences: {
        marketingEmail: Boolean(user.preferences?.marketingEmail),
        smsUpdates: Boolean(user.preferences?.smsUpdates),
        orderUpdates: user.preferences?.orderUpdates !== false,
      },
    };
  }

  saveUser(user) {
    const normalized = AuthSystem.normalizeUserRecord(user);
    localStorage.setItem("vibeThreadUser", JSON.stringify(normalized));
    this.currentUser = normalized;
    this.updateUIForCurrentUser();
  }

  ensureCurrentUserDefaults() {
    if (!this.currentUser) return null;
    const normalized = AuthSystem.normalizeUserRecord(this.currentUser);
    this.persistUser(normalized);
    return normalized;
  }

  persistUser(updatedUser) {
    const normalized = AuthSystem.normalizeUserRecord(updatedUser);

    localStorage.setItem("vibeThreadUser", JSON.stringify(normalized));

    const users = this.getAllUsers();
    const index = users.findIndex(
      (u) =>
        u.id === normalized.id ||
        (u.email || "").toLowerCase().trim() === normalized.email
    );

    if (index > -1) {
      users[index] = { ...users[index], ...normalized };
    } else {
      users.push(normalized);
    }
    localStorage.setItem("vibeThreadUsers", JSON.stringify(users));

    this.currentUser = normalized;
    return normalized;
  }

  logout() {
    localStorage.removeItem("vibeThreadUser");
    this.currentUser = null;
    this.updateUIForCurrentUser();
    this.showMessage("You have been logged out successfully.", "success");

    const pageSlug =
      typeof window.getPageSlug === "function" ? window.getPageSlug() : "";
    if (pageSlug === "account" || pageSlug === "login") {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    }

    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackUserLogout();
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password.length >= 8;
  }

  register(firstName, lastName, email, password, confirmPassword) {
    const normalizedEmail = email.toLowerCase().trim();

    if (!firstName.trim() || !lastName.trim()) {
      this.showMessage("Please fill in all required fields.", "error");
      return false;
    }

    if (!this.validateEmail(normalizedEmail)) {
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

    const existingUsers = this.getAllUsers();
    if (
      existingUsers.find(
        (user) => (user.email || "").toLowerCase().trim() === normalizedEmail
      )
    ) {
      this.showMessage("An account with this email already exists.", "error");
      return false;
    }

    const newUser = AuthSystem.normalizeUserRecord({
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      memberSince: new Date().toISOString(),
      loginHistory: [],
      orders: [],
      addresses: [],
      wishlist: [],
      preferences: {
        marketingEmail: false,
        smsUpdates: false,
        orderUpdates: true,
      },
    });

    this.addUserToDatabase(newUser);
    this.saveUser(newUser);

    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackUserRegistration(newUser);
    }

    this.showMessage(`Welcome to VibeThread, ${newUser.firstName}!`, "success");

    setTimeout(() => {
      window.location.href = "account.html";
    }, 500);

    return true;
  }

  login(email, password) {
    if (!email.trim() || !password.trim()) {
      this.showMessage("Please enter both email and password.", "error");
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUsers = this.getAllUsers();

    const index = existingUsers.findIndex(
      (u) => (u.email || "").toLowerCase().trim() === normalizedEmail
    );

    if (index === -1) {
      this.showMessage(
        "No account found with this email. Please register first.",
        "error"
      );
      return false;
    }

    const user = AuthSystem.normalizeUserRecord(existingUsers[index]);
    user.loginHistory.push(new Date().toISOString());

    existingUsers[index] = user;
    localStorage.setItem("vibeThreadUsers", JSON.stringify(existingUsers));

    this.saveUser(user);

    if (typeof dataLayerManager !== "undefined") {
      dataLayerManager.trackUserLogin(user);
    }

    this.showMessage("Login successful!", "success");

    setTimeout(() => {
      window.location.href = "account.html";
    }, 500);

    return true;
  }

  switchUserByEmail(email) {
    const existingUsers = this.getAllUsers();
    const user = existingUsers.find(
      (u) => (u.email || "").toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!user) {
      this.showMessage("No user found with this email.", "error");
      return false;
    }

    const normalized = AuthSystem.normalizeUserRecord(user);
    normalized.loginHistory.push(new Date().toISOString());
    this.updateUserInDatabase(normalized);
    this.saveUser(normalized);
    this.showMessage(`Switched to user: ${normalized.email}`, "success");
    return true;
  }

  getAllUsers() {
    const saved = localStorage.getItem("vibeThreadUsers");
    return saved ? JSON.parse(saved) : [];
  }

  addUserToDatabase(user) {
    const users = this.getAllUsers();
    users.push(AuthSystem.normalizeUserRecord(user));
    localStorage.setItem("vibeThreadUsers", JSON.stringify(users));
  }

  updateUserInDatabase(updatedUser) {
    const normalized = AuthSystem.normalizeUserRecord(updatedUser);
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === normalized.id);
    if (index > -1) {
      users[index] = normalized;
      localStorage.setItem("vibeThreadUsers", JSON.stringify(users));
    }
  }

  showMessage(message, type = "info") {
    const existingMessages = document.querySelectorAll(".auth-message");
    existingMessages.forEach((msg) => msg.remove());

    const messageDiv = document.createElement("div");
    messageDiv.className =
      "auth-message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";

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

    setTimeout(() => {
      messageDiv.classList.remove("translate-x-full");
    }, 100);

    setTimeout(() => {
      messageDiv.classList.add("translate-x-full");
      setTimeout(() => {
        if (messageDiv.parentNode) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }, 3500);
  }

  updateUIForCurrentUser() {
    const userIcon = document.getElementById("userIcon");
    if (!userIcon) return;

    if (this.currentUser) {
      userIcon.innerHTML = '<i class="fas fa-user-circle text-lg text-blue-600"></i>';
      userIcon.title = `Logged in as ${this.currentUser.firstName}`;
      userIcon.setAttribute("href", "account.html");
    } else {
      userIcon.innerHTML = '<i class="fas fa-user text-lg"></i>';
      userIcon.title = "Login / Register";
      userIcon.setAttribute("href", "login.html");
    }
  }

  switchToForm(mode) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const signinTab = document.getElementById("signinTab");
    const signupTab = document.getElementById("signupTab");

    if (!loginForm || !registerForm) return;

    const showSignIn = mode === "signin";

    loginForm.classList.toggle("hidden", !showSignIn);
    registerForm.classList.toggle("hidden", showSignIn);

    if (signinTab && signupTab) {
      signinTab.classList.toggle("bg-white", showSignIn);
      signinTab.classList.toggle("text-gray-900", showSignIn);
      signinTab.classList.toggle("text-gray-600", !showSignIn);

      signupTab.classList.toggle("bg-white", !showSignIn);
      signupTab.classList.toggle("text-gray-900", !showSignIn);
      signupTab.classList.toggle("text-gray-600", showSignIn);
    }
  }

  initializeEventListeners() {
    const setupEventListeners = () => {
      const loginForm = document.getElementById("loginFormForm");
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const email = document.getElementById("loginEmail")?.value || "";
          const password = document.getElementById("loginPassword")?.value || "";
          this.login(email, password);
        });
      }

      const registerForm = document.getElementById("registerFormForm");
      if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const firstName = document.getElementById("firstName")?.value || "";
          const lastName = document.getElementById("lastName")?.value || "";
          const email = document.getElementById("registerEmail")?.value || "";
          const password =
            document.getElementById("registerPassword")?.value || "";
          const confirmPassword =
            document.getElementById("confirmPassword")?.value || "";

          this.register(firstName, lastName, email, password, confirmPassword);
        });
      }

      const signinTab = document.getElementById("signinTab");
      const signupTab = document.getElementById("signupTab");

      if (signinTab) {
        signinTab.addEventListener("click", () => this.switchToForm("signin"));
      }
      if (signupTab) {
        signupTab.addEventListener("click", () => this.switchToForm("signup"));
      }

      const showRegisterBtn = document.getElementById("showRegister");
      const showLoginBtn = document.getElementById("showLogin");

      if (showRegisterBtn) {
        showRegisterBtn.addEventListener("click", () => this.switchToForm("signup"));
      }
      if (showLoginBtn) {
        showLoginBtn.addEventListener("click", () => this.switchToForm("signin"));
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupEventListeners);
    } else {
      setupEventListeners();
    }
  }
}

const authSystem = new AuthSystem();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthSystem;
} else {
  window.AuthSystem = AuthSystem;
  window.authSystem = authSystem;
}
