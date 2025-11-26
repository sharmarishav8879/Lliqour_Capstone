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
    <div>
      <select onChange={handleFoodPairingChange}>
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
