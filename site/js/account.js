class AccountPage {
  constructor() {
    this.user = AuthSystem.getCurrentUser();
    if (!this.user) {
      window.location.href = "login.html";
      return;
    }

    this.user = AuthSystem.normalizeUserRecord(this.user);
    this.persistUser();

    this.initializeTabs();
    this.initializeForms();
    this.renderAll();
    this.openTabFromQuery();
  }

  initializeTabs() {
    const buttons = document.querySelectorAll("[data-account-tab]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        this.setActiveTab(button.dataset.accountTab);
      });
    });
  }

  openTabFromQuery() {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) {
      this.setActiveTab(tab);
    }
  }

  setActiveTab(tabName) {
    const buttons = document.querySelectorAll("[data-account-tab]");
    const panels = document.querySelectorAll("[data-account-panel]");

    buttons.forEach((button) => {
      const active = button.dataset.accountTab === tabName;
      button.classList.toggle("bg-blue-600", active);
      button.classList.toggle("text-white", active);
      button.classList.toggle("text-gray-700", !active);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.accountPanel !== tabName);
    });
  }

  initializeForms() {
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.user.firstName = document.getElementById("profileFirstName").value.trim();
        this.user.lastName = document.getElementById("profileLastName").value.trim();
        this.user.phone = document.getElementById("profilePhone").value.trim();
        this.persistUser();
        authSystem.showMessage("Profile updated.", "success");
      });
    }

    const addressForm = document.getElementById("addressForm");
    if (addressForm) {
      addressForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const address = {
          id: Date.now(),
          label: document.getElementById("addressLabel").value.trim(),
          name: document.getElementById("addressName").value.trim(),
          line1: document.getElementById("addressLine1").value.trim(),
          line2: document.getElementById("addressLine2").value.trim(),
          city: document.getElementById("addressCity").value.trim(),
          state: document.getElementById("addressState").value.trim(),
          postalCode: document.getElementById("addressZip").value.trim(),
          country: document.getElementById("addressCountry").value.trim(),
        };

        this.user.addresses.push(address);
        this.persistUser();
        this.renderAddresses();
        addressForm.reset();
        document.getElementById("addressCountry").value = "United States";
        authSystem.showMessage("Address saved.", "success");
      });
    }

    const addressList = document.getElementById("addressList");
    if (addressList) {
      addressList.addEventListener("click", (e) => {
        const removeButton = e.target.closest("[data-remove-address-id]");
        if (!removeButton) return;

        const id = Number(removeButton.dataset.removeAddressId);
        this.user.addresses = this.user.addresses.filter((address) => address.id !== id);
        this.persistUser();
        this.renderAddresses();
      });
    }

    const preferencesForm = document.getElementById("preferencesForm");
    if (preferencesForm) {
      preferencesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.user.preferences = {
          marketingEmail: document.getElementById("prefMarketingEmail").checked,
          smsUpdates: document.getElementById("prefSmsUpdates").checked,
          orderUpdates: document.getElementById("prefOrderUpdates").checked,
        };
        this.persistUser();
        authSystem.showMessage("Preferences saved.", "success");
      });
    }

    const logoutBtn = document.getElementById("accountLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        authSystem.logout();
      });
    }

    const securityPasswordBtn = document.getElementById("securityPasswordBtn");
    if (securityPasswordBtn) {
      securityPasswordBtn.addEventListener("click", () => {
        alert("Placeholder only. Real password reset flow is not implemented in this demo.");
      });
    }

    const security2faBtn = document.getElementById("security2faBtn");
    if (security2faBtn) {
      security2faBtn.addEventListener("click", () => {
        alert("Placeholder only. Real 2FA setup is not implemented in this demo.");
      });
    }
  }

  persistUser() {
    this.user = AuthSystem.normalizeUserRecord(this.user);
    authSystem.persistUser(this.user);
  }

  renderAll() {
    this.renderProfile();
    this.renderAddresses();
    this.renderOrders();
    this.renderWishlist();
    this.renderPreferences();
  }

  renderProfile() {
    const firstName = document.getElementById("profileFirstName");
    const lastName = document.getElementById("profileLastName");
    const email = document.getElementById("profileEmail");
    const phone = document.getElementById("profilePhone");
    const memberSince = document.getElementById("profileMemberSince");

    if (firstName) firstName.value = this.user.firstName || "";
    if (lastName) lastName.value = this.user.lastName || "";
    if (email) email.value = this.user.email || "";
    if (phone) phone.value = this.user.phone || "";
    if (memberSince) {
      memberSince.textContent = this.user.memberSince
        ? new Date(this.user.memberSince).toLocaleDateString()
        : "-";
    }
  }

  renderAddresses() {
    const addressList = document.getElementById("addressList");
    if (!addressList) return;

    if (!this.user.addresses.length) {
      addressList.innerHTML =
        '<div class="border border-dashed rounded-lg p-6 text-sm text-gray-500">No saved addresses yet. Add one below.</div>';
      return;
    }

    addressList.innerHTML = this.user.addresses
      .map(
        (address) => `
        <div class="border rounded-lg p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-gray-800">${address.label || "Address"}</p>
              <p class="text-sm text-gray-700">${address.name || ""}</p>
              <p class="text-sm text-gray-600">${address.line1 || ""}</p>
              ${address.line2 ? `<p class="text-sm text-gray-600">${address.line2}</p>` : ""}
              <p class="text-sm text-gray-600">${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}</p>
              <p class="text-sm text-gray-600">${address.country || ""}</p>
            </div>
            <button data-remove-address-id="${address.id}" class="text-red-500 text-sm hover:text-red-700">Remove</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  renderOrders() {
    const orderHistoryDiv = document.getElementById("orderHistory");
    if (!orderHistoryDiv) return;

    const orders = this.user.orders || [];

    orderHistoryDiv.innerHTML =
      orders.length === 0
        ? '<p class="text-gray-500">No orders found.</p>'
        : orders
            .map(
              (order) => `
              <div class="border rounded-lg p-4 mb-4">
                <p class="font-semibold text-gray-800">Order ID: ${order.id}</p>
                <p class="text-sm text-gray-600">Total: ${ProductUtils.formatPrice(order.total)}</p>
                <p class="text-sm text-gray-600">Date: ${new Date(order.date).toLocaleDateString()}</p>
                <h4 class="text-sm font-semibold mt-3 text-gray-700">Items</h4>
                <ul class="list-disc pl-5 text-sm text-gray-600">
                  ${order.items
                    .map((item) => {
                      const product = ProductUtils.getProductById(item.productId);
                      return `<li>${product ? product.name : item.productId} (x${item.quantity}) ${item.size ? `- Size: ${item.size}` : ""} ${item.color ? `- Color: ${item.color}` : ""}</li>`;
                    })
                    .join("")}
                </ul>
              </div>
            `
            )
            .join("");
  }

  renderWishlist() {
    const wishlistContent = document.getElementById("wishlistContent");
    if (!wishlistContent) return;

    if (!this.user.wishlist.length) {
      wishlistContent.innerHTML = `
        <div class="border border-dashed rounded-lg p-6 text-sm text-gray-500">
          Your wishlist is empty. Save favorites while browsing products.
          <div class="mt-3">
            <a href="categories.html" class="text-blue-600 hover:text-blue-800 font-semibold">Browse Products</a>
          </div>
        </div>
      `;
      return;
    }

    wishlistContent.innerHTML = this.user.wishlist
      .map((item) => `<div class="border rounded-lg p-4 text-sm text-gray-700">${item.name || "Wishlist item"}</div>`)
      .join("");
  }

  renderPreferences() {
    const prefs = this.user.preferences || {};
    const marketing = document.getElementById("prefMarketingEmail");
    const sms = document.getElementById("prefSmsUpdates");
    const order = document.getElementById("prefOrderUpdates");

    if (marketing) marketing.checked = Boolean(prefs.marketingEmail);
    if (sms) sms.checked = Boolean(prefs.smsUpdates);
    if (order) order.checked = prefs.orderUpdates !== false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new AccountPage();
});
