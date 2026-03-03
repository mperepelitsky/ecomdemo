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
        const variantParts = [];
        if (item.size) variantParts.push(`Size: ${item.size}`);
        if (item.color) variantParts.push(`Color: ${item.color}`);
        const variantText = variantParts.length > 0 ? ` (${variantParts.join(", ")})` : "";

        return `
          <li class="py-2 border-b last:border-b-0 flex justify-between gap-4">
            <span>${productName}${variantText} x${item.quantity}</span>
            <span class="font-semibold">${ProductUtils.formatPrice(item.price * item.quantity)}</span>
          </li>
        `;
      })
      .join("");
  }

  const orderItemsForTracking = savedOrder.items.map((item) => {
    const product = ProductUtils.getProductById(item.productId);
    return {
      item_id: String(item.productId),
      item_name: product ? product.name : `Item ${item.productId}`,
      quantity: item.quantity,
      price: item.price,
      item_variant: [item.size, item.color].filter(Boolean).join(" / ") || null,
    };
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "order_confirmation_view",
    customer: {
      id: savedOrder.customer?.id || null,
      first_name: savedOrder.customer?.firstName || null,
      last_name: savedOrder.customer?.lastName || null,
      email: savedOrder.customer?.email || null,
    },
    order: {
      order_id: savedOrder.id,
      order_date: savedOrder.date,
      payment_method: savedOrder.payment?.method || "face_payment_auto",
      payment_status: savedOrder.payment?.status || "approved",
      currency: "USD",
      value: savedOrder.total,
      item_count: itemCount,
      items: orderItemsForTracking,
    },
  });
});
