// Product data for the ecommerce demo
const products = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    category: "men",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop&q=90",
    ],
    description:
      "Premium cotton classic white t-shirt. Perfect for everyday wear, made from 100% organic cotton with a comfortable fit.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray"],
    featured: true,
  },
  {
    id: 2,
    name: "Denim Jacket",
    category: "men",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1537465978529-d23b17165b3b?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1537465978529-d23b17165b3b?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1537465978529-d23b17165b3b?w=300&h=400&fit=crop&q=80",
    ],
    description:
      "Classic denim jacket with vintage styling. Features button closure, chest pockets, and comfortable fit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black", "Light Blue"],
    featured: true,
  },
  {
    id: 3,
    name: "Casual Chinos",
    category: "men",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=400&fit=crop",
    ],
    description:
      "Comfortable casual chinos perfect for work or weekend. Made from premium cotton blend fabric.",
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["Khaki", "Navy", "Black", "Olive"],
    featured: false,
  },
  {
    id: 4,
    name: "Elegant Blouse",
    category: "women",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop",
    ],
    description:
      "Elegant silk blouse perfect for office or evening wear. Features button-up design and relaxed fit.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Cream", "Light Blue", "Pink"],
    featured: true,
  },
  {
    id: 5,
    name: "Summer Dress",
    category: "women",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=400&fit=crop",
    ],
    description:
      "Light and airy summer dress with floral pattern. Perfect for warm weather and casual occasions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Blue", "Floral Pink", "Solid Yellow"],
    featured: true,
  },
  {
    id: 6,
    name: "High-Waisted Jeans",
    category: "women",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300&h=400&fit=crop",
    ],
    description:
      "Classic high-waisted jeans with slim fit. Made from premium denim with stretch for comfort.",
    sizes: ["24", "26", "28", "30", "32"],
    colors: ["Dark Blue", "Light Blue", "Black"],
    featured: false,
  },
  {
    id: 7,
    name: "Wool Cardigan",
    category: "women",
    price: 95.99,
    image:
      "https://images.unsplash.com//photo-1610288311735-39b7facbd095?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610288311735-39b7facbd095?w=300&h=400&fit=crop",
    ],
    description:
      "Cozy wool cardigan perfect for layering. Features button closure and ribbed trim.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Gray", "Burgundy", "Navy"],
    featured: false,
  },
  {
    id: 8,
    name: "Leather Watch",
    category: "accessories",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1600071177478-88758260617d?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600071177478-88758260617d?w=300&h=400&fit=crop",
    ],
    description:
      "Classic leather watch with stainless steel case. Water-resistant and perfect for everyday wear.",
    sizes: ["One Size"],
    colors: ["Brown", "Black", "Tan"],
    featured: true,
  },
  {
    id: 9,
    name: "Canvas Tote Bag",
    category: "accessories",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop".
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop",
    ],
    description:
      "Spacious canvas tote bag perfect for shopping or daily use. Eco-friendly and durable.",
    sizes: ["One Size"],
    colors: ["Natural", "Black", "Navy"],
    featured: false,
  },
  {
    id: 10,
    name: "Sunglasses",
    category: "accessories",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=400&fit=crop",
    ],
    description:
      "Stylish sunglasses with UV protection. Classic design suitable for any occasion.",
    sizes: ["One Size"],
    colors: ["Black", "Brown", "Gold"],
    featured: false,
  },
  {
    id: 11,
    name: "Formal Shirt",
    category: "men",
    price: 45.99,
    image:
      "https://images.unsplash.com/photo-1603252109612-24fa03d145c8?w=300&h=400&fit=crop",

    images: [
      "https://images.unsplash.com/photo-1603252109612-24fa03d145c8?w=300&h=400&fit=crop",
    ],
    description:
      "Classic formal shirt perfect for office wear. Made from premium cotton with slim fit.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Pink"],
    featured: false,
  },
  {
    id: 12,
    name: "Sneakers",
    category: "men",
    price: 119.99,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop",
    ],
    description:
      "Comfortable sneakers perfect for casual wear. Features cushioned sole and breathable material.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["White", "Black", "Gray"],
    featured: true,
  },
  {
    id: 13,
    name: "Knit Sweater",
    category: "women",
    price: 75.99,
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop",
    ],
    description:
      "Cozy knit sweater perfect for cool weather. Made from soft wool blend with relaxed fit.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Cream", "Navy", "Burgundy"],
    featured: false,
  },
  {
    id: 14,
    name: "Baseball Cap",
    category: "accessories",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=400&fit=crop",
    ],
    description:
      "Classic baseball cap with adjustable strap. Perfect for casual wear and sun protection.",
    sizes: ["One Size"],
    colors: ["Black", "Navy", "Gray", "Red"],
    featured: false,
  },
  {
    id: 15,
    name: "Maxi Dress",
    category: "women",
    price: 85.99,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop",
    ],
    description:
      "Elegant maxi dress perfect for special occasions. Features flowing silhouette and comfortable fabric.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Burgundy"],
    featured: true,
  },
  {
    id: 16,
    name: "Polo Shirt",
    category: "men",
    price: 35.99,
    image:
      "https://images.unsplash.com/photo-1614533836002-5728f1963983?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1614533836002-5728f1963983?w=300&h=400&fit=crop",
    ],
    description:
      "Classic polo shirt perfect for casual or semi-formal occasions. Made from premium cotton pique.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Navy", "Gray", "Green"],
    featured: false,
  },
  {
    id: 17,
    name: "Silk Scarf",
    category: "accessories",
    price: 45.99,
    image:
      "https://images.unsplash.com/photo-1566534335938-05f1f2949435w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1566534335938-05f1f2949435?w=300&h=400&fit=crop",
    ],
    description:
      "Luxurious silk scarf with elegant pattern. Perfect accessory for adding sophistication to any outfit.",
    sizes: ["One Size"],
    colors: ["Blue Pattern", "Red Pattern", "Gold Pattern"],
    featured: false,
  },
  {
    id: 18,
    name: "Ankle Boots",
    category: "women",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1654684198148-c192c37f9b0d?w=300&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1654684198148-c192c37f9b0d?w=300&h=400&fit=crop",
    ],
    description:
      "Stylish ankle boots perfect for fall and winter. Features comfortable heel and premium leather construction.",
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Brown", "Tan"],
    featured: true,
  },
];

// Utility functions for working with products
const ProductUtils = {
  getAllProducts() {
    return products;
  },

  getProductById(id) {
    return products.find((product) => product.id === parseInt(id));
  },

  getProductsByCategory(category) {
    if (category === "all" || !category) {
      return products;
    }
    return products.filter((product) => product.category === category);
  },

  getFeaturedProducts(limit = 4) {
    return products.filter((product) => product.featured).slice(0, limit);
  },

  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
  },

  sortProducts(products, sortBy) {
    const productsCopy = [...products];

    switch (sortBy) {
      case "name":
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "price-low":
        return productsCopy.sort((a, b) => a.price - b.price);
      case "price-high":
        return productsCopy.sort((a, b) => b.price - a.price);
      default:
        return productsCopy;
    }
  },

  getRelatedProducts(productId, limit = 4) {
    const product = this.getProductById(productId);
    if (!product) return [];

    return products
      .filter((p) => p.id !== productId && p.category === product.category)
      .slice(0, limit);
  },

  formatPrice(price) {
    return `$${price.toFixed(2)}`;
  },
};

// Make products data available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = { products, ProductUtils };
} else {
  window.products = products;
  window.ProductUtils = ProductUtils;
}
