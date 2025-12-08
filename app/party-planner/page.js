"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeToggle";
import { useUserAuth } from "@/app/auth/_util/auth-context";
import { db } from "@/app/auth/_util/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAllProducts } from "@/lib/products";

const OCCASIONS = [
  "House Party",
  "Birthday",
  "Wedding Reception",
  "Game Night",
  "Corporate Event",
];

const DEFAULT_PREFS = {
  beer: true,
  wine: true,
  spirits: false,
};

export default function PartyPlannerPage() {
  const { theme } = useTheme();
  const { user } = useUserAuth();

  const [occasion, setOccasion] = useState("House Party");
  const [peopleCount, setPeopleCount] = useState(10);
  const [budget, setBudget] = useState(200);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);

  const [planSummary, setPlanSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load products from Firestore (re-use your existing helper)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        if (Array.isArray(products)) {
          setAllProducts(products);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products", err);
        setAllProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Listen to this user's saved party plans
  useEffect(() => {
    if (!user) {
      setPlans([]);
      return;
    }

    const q = query(
      collection(db, "partyPlans"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlans(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGeneratePlan = () => {
    const people = Number(peopleCount) || 0;
    const totalBudget = Number(budget) || 0;

    if (people <= 0 || totalBudget <= 0) {
      alert("Please enter a valid number of people and budget.");
      return;
    }

    const perPerson = totalBudget / Math.max(people, 1);
    const mix = [];

    if (preferences.beer) {
      const beerQty = Math.round(people * 1.5);
      mix.push({
        type: "Beer",
        quantity: beerQty,
        note: "Approx. 1–2 cans per guest.",
      });
    }

    if (preferences.wine) {
      const wineQty = Math.ceil(people / 3);
      mix.push({
        type: "Wine",
        quantity: wineQty,
        note: "Roughly 1 bottle per 3 guests.",
      });
    }

    if (preferences.spirits) {
      const spiritBottles = Math.ceil(people / 8);
      mix.push({
        type: "Spirits",
        quantity: spiritBottles,
        note: "For cocktails or shots.",
      });
    }

    // Pick some suggested products from Firestore data
    const preferredCategories = [];
    if (preferences.beer) preferredCategories.push("Beer");
    if (preferences.wine) preferredCategories.push("Wine");
    if (preferences.spirits) preferredCategories.push("Whisky", "Vodka", "Rum");

    const suggestedProducts = allProducts
      .filter((p) =>
        preferredCategories.length
          ? preferredCategories.includes(p.category)
          : true
      )
      .slice(0, 6) // just show a few
      .map((p) => ({
        id: p.docId || p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        slug: p.slug,
      }));

    const summary = {
      occasion,
      peopleCount: people,
      budget: totalBudget,
      perPersonBudget: perPerson,
      mix,
      suggestedProducts,
    };

    setPlanSummary(summary);
  };

  const handleSavePlan = async () => {
    if (!user) {
      alert("Please sign in to save your party plan.");
      return;
    }
    if (!planSummary) {
      alert("Generate a plan before saving.");
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "partyPlans"), {
        userId: user.uid,
        occasion: planSummary.occasion,
        peopleCount: planSummary.peopleCount,
        budget: planSummary.budget,
        preferences,
        mix: planSummary.mix,
        suggestedProducts: planSummary.suggestedProducts,
        createdAt: serverTimestamp(),
      });
      // Optional: clear plan summary after save
      // setPlanSummary(null);
    } catch (err) {
      console.error("Error saving party plan:", err);
      alert("Could not save party plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const containerBg =
    theme === "light" ? "bg-gray-50 text-black" : "bg-gray-900 text-white";
  const cardBg =
    theme === "light" ? "bg-white border-gray-300" : "bg-gray-800 border-gray-700";

  return (
    <div className={`font-serif min-h-screen ${containerBg} px-4 py-8`}>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Party Planner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Plan drinks for your next event, see suggestions from our catalog,
              and save your party plans to your account.
            </p>
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            {user ? (
              <span>Signed in as {user.email || user.displayName}</span>
            ) : (
              <span>Sign in to save and view your party plans.</span>
            )}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Form */}
          <section
            className={`shadow-xl rounded-xl p-4 space-y-4 ${cardBg}`}
          >
            <h2 className="text-lg font-bold">Event details</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full rounded-md border px-2 py-1 text-sm text-black"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Number of people</label>
              <input
                type="number"
                min="1"
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                className="w-full rounded-md border px-2 py-1 text-sm text-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Total budget ($)</label>
              <input
                type="number"
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-md border px-2 py-1 text-sm text-black"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Preferred drink types</p>
              <div className="flex flex-col gap-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.beer}
                    onChange={() => handleTogglePreference("beer")}
                  />
                  Beer
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.wine}
                    onChange={() => handleTogglePreference("wine")}
                  />
                  Wine
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.spirits}
                    onChange={() => handleTogglePreference("spirits")}
                  />
                  Spirits (Whisky / Vodka / Rum)
                </label>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Generate Plan
            </button>

            {loadingProducts && (
              <p className="text-xs text-gray-500 mt-2">
                Loading catalog data from Firestore...
              </p>
            )}
          </section>

          {/* Right: Generated plan + save button */}
          <section
            className={`shadow-xl rounded-xl p-4 flex flex-col gap-3 ${cardBg}`}
          >
            <h2 className="text-lg font-bold">Suggested plan</h2>

            {!planSummary && (
              <p className="text-sm text-gray-500">
                Fill out the event details on the left and click{" "}
                <span className="font-semibold">Generate Plan</span> to see our
                suggestion.
              </p>
            )}

            {planSummary && (
              <>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Occasion:</span>{" "}
                    {planSummary.occasion}
                  </p>
                  <p>
                    <span className="font-semibold">Guests:</span>{" "}
                    {planSummary.peopleCount}
                  </p>
                  <p>
                    <span className="font-semibold">Total budget:</span> $
                    {planSummary.budget}
                  </p>
                  <p>
                    <span className="font-semibold">Budget per person:</span> $
                    {planSummary.perPersonBudget.toFixed(2)}
                  </p>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-semibold mb-1">Drink mix</h3>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {planSummary.mix.map((item, index) => (
                      <li key={index}>
                        <span className="font-semibold">
                          {item.type}: {item.quantity}
                        </span>{" "}
                        <span className="text-gray-500">– {item.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {planSummary.suggestedProducts.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold mb-1">
                      Suggested products from our catalog
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {planSummary.suggestedProducts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="border rounded-md p-2 text-xs flex gap-2 hover:bg-black/10"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-gray-500">
                              {p.category} • ${p.price?.toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {saving ? "Saving..." : "Save this plan"}
                </button>
              </>
            )}
          </section>
        </div>

        {/* Saved plans section */}
        <section
          className={`shadow-xl rounded-xl p-4 mt-4 ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">My saved party plans</h2>
            {!user && (
              <p className="text-xs text-red-400">
                Sign in to view your saved plans.
              </p>
            )}
          </div>

          {user && plans.length === 0 && (
            <p className="text-sm text-gray-500">
              You don&apos;t have any saved party plans yet.
            </p>
          )}

          {user && plans.length > 0 && (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg px-3 py-2 text-sm flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{plan.occasion}</div>
                    {plan.createdAt?.toDate && (
                      <div className="text-xs text-gray-500">
                        {plan.createdAt.toDate().toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Guests: {plan.peopleCount} • Budget: ${plan.budget}
                  </div>
                  {Array.isArray(plan.mix) && plan.mix.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Mix:{" "}
                      {plan.mix
                        .map((m) => `${m.type} x${m.quantity}`)
                        .join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
