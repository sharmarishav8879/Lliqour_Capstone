// lib/cart.js
// It is a very small cart saved in localStorage

export function getCart() {
  const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(product, qty) {
  const cart = getCart();
  const i = cart.findIndex(x => x.id === product.id);

  if (i >= 0) cart[i].qty += qty;
  else cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    qty
  });

  saveCart(cart);
}