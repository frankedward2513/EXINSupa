import React, { useState } from "react";
import { Auth } from "./components/Auth";
import Supplier from "./components/inventory/supplier";
import Categories from "./components/inventory/categories";
import Bales from "./components/inventory/bales";
import Products from "./components/inventory/products";
import type { UserRecord } from "./utils/supabase";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] =
    useState<UserRecord | null>(null);

  const [activePage, setActivePage] = useState<
    "supplier" | "categories" | "bales" | "products"
  >("supplier");

  // If not logged in
  if (!currentUser) {
    return (
      <Auth
        onSuccess={(user: UserRecord) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // Only admin and staff can access
  if (
    currentUser.cus_role !== "admin" &&
    currentUser.cus_role !== "staff"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>

          <p className="text-gray-500 mb-5">
            You do not have permission to access the inventory system.
          </p>

          <button
            onClick={() => setCurrentUser(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Inventory System
          </h1>

          <p className="text-sm text-gray-500">
            Welcome, {currentUser.cus_name}
          </p>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </header>

      {/* NAVIGATION */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2 overflow-x-auto">

          {/* SUPPLIERS */}
          <button
            onClick={() => setActivePage("supplier")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activePage === "supplier"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Suppliers
          </button>

          {/* CATEGORIES */}
          <button
            onClick={() => setActivePage("categories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activePage === "categories"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Categories
          </button>

          {/* BALES */}
          <button
            onClick={() => setActivePage("bales")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activePage === "bales"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Bales
          </button>

          {/* PRODUCTS */}
          <button
            onClick={() => setActivePage("products")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activePage === "products"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Products
          </button>

        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main>
        {activePage === "supplier" && <Supplier />}

        {activePage === "categories" && <Categories />}

        {activePage === "bales" && <Bales />}

        {activePage === "products" && <Products />}
      </main>

    </div>
  );
};

export default App;