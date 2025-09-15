// lib/products.js
// It is a Small mock data array for Monday's demo

export const PRODUCTS = [
  {
    id: "lagavulin-16",
    name: "Lagavulin 16 Year Single Malt",
    slug: "lagavulin-16",
    price: 159.99,
    image:
      "https://aem.lcbo.com/content/dam/lcbo/products/5/0/3/0/503060.jpg.thumb.1280.1280.jpg",
    abv: "43%",
    size: "750 ml",
    category: "Whisky",
    origin: "Scotland",
    description: "Iconic Islay single malt with peat smoke and dried fruit.",
  },
  {
    id: "grey-goose",
    name: "Grey Goose Vodka",
    slug: "grey-goose",
    price: 49.99,
    image:
      "https://www.canadianliquorstore.ca/cdn/shop/products/772475.jpg?v=1709579279",
    abv: "40%",
    size: "750 ml",
    category: "Vodka",
    origin: "France",
    description:
      "Smooth premium vodka from soft winter wheat and spring water.",
  },
  {
    id: "apothic-red",
    name: "Apothic Red Blend",
    slug: "apothic-red",
    price: 13.99,
    image:
      "https://www.scarthstreetliquor.com/cdn/shop/products/apothicred_3024x.jpg?v=1585175176",
    abv: "13.5%",
    size: "750 ml",
    category: "Wine",
    origin: "USA",
    description: "Bold red with dark fruit, mocha and vanilla notes.",
  },

  {
    id: "patron-silver",
    name: "Patrón Silver Tequila",
    slug: "patron-silver",
    price: 19.99,
    image:
      "https://www.patrontequila.com/binaries/content/gallery/patrontequila/products/patron-silver/v3/story-asset-2.jpg",
    abv: "40%",
    size: "750 ml",
    category: "Tequila",
    origin: "Mexico",
    description: "Crisp, smooth tequila made from 100% Weber Blue Agave.",
  },

  {
    id: "baileys-irish-cream",
    name: "Baileys Irish Cream",
    slug: "baileys-irish-cream",
    price: 24.99,
    image:
      "https://aem.lcbo.com/content/dam/lcbo/products/0/0/5/9/005959-A.jpg.thumb.1280.1280.jpg",
    abv: "40%",
    size: "750 ml",
    category: "Liqueur",
    origin: "Ireland",
    description: "Creamy blend of Irish whiskey and dairy cream.",
  },
];

// return all products
export function getAllProducts() {
  return PRODUCTS;
}

// return product by slug
export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}
