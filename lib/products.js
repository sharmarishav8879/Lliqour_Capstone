// lib/products.js
// It is a Small mock data array for Monday's demo

export const PRODUCTS = [
  {
    id: "lagavulin-16",
    name: "Lagavulin 16 Year Single Malt",
    slug: "lagavulin-16",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1541976076758-347942db1978?q=80&w=1200",
    abv: "43%",
    size: "750 ml",
    category: "Whisky",
    origin: "Scotland",
    description: "Iconic Islay single malt with peat smoke and dried fruit."
  },
  {
    id: "grey-goose",
    name: "Grey Goose Vodka",
    slug: "grey-goose",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae8a19c3?q=80&w=1200",
    abv: "40%",
    size: "750 ml",
    category: "Vodka",
    origin: "France",
    description: "Smooth premium vodka from soft winter wheat and spring water."
  },
  {
    id: "apothic-red",
    name: "Apothic Red Blend",
    slug: "apothic-red",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c76db?q=80&w=1200",
    abv: "13.5%",
    size: "750 ml",
    category: "Wine",
    origin: "USA",
    description: "Bold red with dark fruit, mocha and vanilla notes."
  }
];

// return all products
export function getAllProducts() {
  return PRODUCTS;
}

// return product by slug
export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || null;
}