import { useEffect, useState } from "react";

export function useRecentlyViewed(limit = 10) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const storedItems =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    setItems(storedItems);
  }, []);

  const addItem = (item) => {
    const existingItems =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const filteredItems = [
      item,
      ...existingItems.filter((i) => i !== item),
    ].slice(0, limit);
    localStorage.setItem("recentlyViewed", JSON.stringify(filteredItems));
    setItems(filteredItems);
  };

  return { items, addItem };
}
