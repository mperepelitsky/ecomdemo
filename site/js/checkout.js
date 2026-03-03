// Checkout page behavior for the demo's automatic Face Payment flow.
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = AuthSystem.getCurrentUser();
  if (!currentUser) {
    alert("Please log in to continue to checkout.");
    window.location.href = "login.html";
    return;
  }

  const checkoutEmail = document.getElementById("checkoutEmail");
  if (checkoutEmail) {
    checkoutEmail.textContent = currentUser.email;
  }

  if (cart.getItemCount() === 0) {
    alert("Your cart is empty.");
    window.location.href = "cart.html";
  }
});
