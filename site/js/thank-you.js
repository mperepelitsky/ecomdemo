// Thank-you page renderer and tracking payload
document.addEventListener("DOMContentLoaded", function () {
  const orderIdElement = document.getElementById("orderId");
  const emailElement = document.getElementById("orderEmail");
  const dateElement = document.getElementById("orderDate");
  const totalElement = document.getElementById("orderTotal");
  const itemCountElement = document.getElementById("orderItemCount");
  const itemsElement = document.getElementById("orderItems");

  const urlParams = new URLSearchParams(window.location.search);
  const orderFromQuery = urlParams.get("order");
  const savedOrder = JSON.parse(localStorage.getItem("vibeThreadLastOrder") || "null");

  if (!savedOrder || (orderFromQuery && savedOrder.id !== orderFromQuery)) {
    if (orderIdElement) orderIdElement.textContent = orderFromQuery || "N/A";
    if (emailElement) emailElement.textContent = "N/A";
    if (dateElement) dateElement.textContent = "N/A";
    if (totalElement) totalElement.textContent = "$0.00";
    if (itemCountElement) itemCountElement.textContent = "0";
    if (itemsElement) {
      itemsElement.innerHTML =
        '<p class="text-gray-500">No recent order details were found.</p>';
    }
    return;
  }

  const itemCount = savedOrder.items.reduce((count, item) => count + item.quantity, 0);

  if (orderIdElement) orderIdElement.textContent = savedOrder.id;
  if (emailElement) emailElement.textContent = savedOrder.customer?.email || "N/A";
  if (dateElement) {
    dateElement.textContent = new Date(savedOrder.date).toLocaleString();
  }
  if (totalElement) totalElement.textContent = ProductUtils.formatPrice(savedOrder.total);
  if (itemCountElement) itemCountElement.textContent = String(itemCount);

  if (itemsElement) {
    itemsElement.innerHTML = savedOrder.items
      .map((item) => {
        const product = ProductUtils.getProductById(item.productId);
        const productName = product ? product.name : `Item ${item.productId}`;
        const unitPrice =
          typeof item.unitPrice === "number"
            ? item.unitPrice
            : typeof item.price === "number"
              ? item.price
              : product
                ? product.price
                : 0;
        const variantParts = [];
        if (item.size) variantParts.push(`Size: ${item.size}`);
        if (item.color) variantParts.push(`Color: ${item.color}`);
        const variantText = variantParts.length > 0 ? ` (${variantParts.join(", ")})` : "";

        return `
          <li class="py-2 border-b last:border-b-0 flex justify-between gap-4">
            <span>${productName}${variantText} x${item.quantity}</span>
            <span class="font-semibold">${ProductUtils.formatPrice(unitPrice * item.quantity)}</span>
          </li>
        `;
      })
      .join("");
  }

  if (typeof dataLayerManager !== "undefined") {
    dataLayerManager.trackOrderConfirmationView(savedOrder);
  }
});
