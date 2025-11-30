import { useState } from "react";

export default function FoodPairing() {
  const [foodPairings, setFoodPairings] = useState([]);

  const handleFoodPairingChange = (event) => {
    const selectedBeverage = event.target.value;
    import("../lib/pairingFood.json").then((data) => {
      const pairings = data[selectedBeverage] || [];
      setFoodPairings(pairings);
    });
  };
  return (
    <div className="p-4 border rounded-lg shadow-md w-full max-w-md">
      <select
        className="w-full p-2 border rounded-md mb-4 bg-gradient-to-r from-orange-400 to-orange-600 text-gray-950 font-serif"
        onChange={handleFoodPairingChange}
      >
        <option value="red_wine">Red Wine</option>
        <option value="white_wine">White Wine</option>
        <option value="rum">Rum</option>
        <option value="whiskey">Whiskey</option>
        <option value="vodka">Vodka</option>
        <option value="gin">Gin</option>
        <option value="tequila">Tequila</option>
        <option value="scotch">Scotch</option>
        <option value="cognac">Cognac</option>
        <option value="champagne"> Champagne</option>
      </select>

      <div>
        {foodPairings.length > 0 ? (
          <ul>
            {foodPairings.map((food, index) => (
              <li key={index}>{food}</li>
            ))}
          </ul>
        ) : (
          <p>No food pairings found.</p>
        )}
      </div>
    </div>
  );
}
