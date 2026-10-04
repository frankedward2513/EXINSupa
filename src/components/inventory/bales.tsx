import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

interface Bale {
  bal_ID: number;
  bal_Name: string;
  bal_Code: string;
  cat_ID: number;
  sup_ID: number;
  bal_TotalPurchase: number;
  bal_Quantity: number;
  bal_PricePerPiece: number;
  bal_Status: string;
  bal_Description: string | null;
  created_at: string;
}

interface Category {
  cat_ID: number;
  cat_Name: string;
}

interface Supplier {
  sup_ID: number;
  sup_Company: string;
  sup_Name: string;
}

interface BaleForm {
  bal_Name: string;
  cat_ID: string;
  sup_ID: string;
  bal_TotalPurchase: string;
  bal_Quantity: string;
  bal_PricePerPiece: string;
  bal_Status: string;
  bal_Description: string;
}

const Bales: React.FC = () => {
  const [bales, setBales] = useState<Bale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBale, setEditingBale] = useState<Bale | null>(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<BaleForm>({
    bal_Name: "",
    cat_ID: "",
    sup_ID: "",
    bal_TotalPurchase: "",
    bal_Quantity: "",
    bal_PricePerPiece: "",
    bal_Status: "Available",
    bal_Description: "",
  });

  const fetchBales = async () => {
    const { data, error } = await supabase
      .from("Bales")
      .select(`
        bal_ID,
        bal_Name,
        bal_Code,
        cat_ID,
        sup_ID,
        bal_TotalPurchase,
        bal_Quantity,
        bal_PricePerPiece,
        bal_Status,
        bal_Description,
        created_at
      `)
      .order("bal_ID", { ascending: false });

    if (error) {
      console.error("Error fetching bales:", error);
      alert(`Failed to load bales.\n\n${error.message}`);
      return;
    }

    setBales(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("Categories")
      .select("cat_ID, cat_Name")
      .order("cat_Name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from("Suppliers")
      .select("sup_ID, sup_Company, sup_Name")
      .order("sup_Company", { ascending: true });

    if (error) {
      console.error("Error fetching suppliers:", error);
      return;
    }

    setSuppliers(data || []);
  };

  useEffect(() => {
    fetchBales();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
      };

      // Automatically calculate Price Per Piece
      if (
        name === "bal_TotalPurchase" ||
        name === "bal_Quantity"
      ) {
        const totalPurchase =
          name === "bal_TotalPurchase"
            ? Number(value)
            : Number(prev.bal_TotalPurchase);

        const quantity =
          name === "bal_Quantity"
            ? Number(value)
            : Number(prev.bal_Quantity);

        if (totalPurchase > 0 && quantity > 0) {
          updatedForm.bal_PricePerPiece = (
            totalPurchase / quantity
          ).toFixed(2);
        } else {
          updatedForm.bal_PricePerPiece = "";
        }
      }

      return updatedForm;
    });
  };

  const openAddModal = () => {
    setEditingBale(null);

    setFormData({
      bal_Name: "",
      cat_ID: "",
      sup_ID: "",
      bal_TotalPurchase: "",
      bal_Quantity: "",
      bal_PricePerPiece: "",
      bal_Status: "Available",
      bal_Description: "",
    });

    setShowModal(true);
  };

  const openEditModal = (bale: Bale) => {
    setEditingBale(bale);

    setFormData({
      bal_Name: bale.bal_Name,
      cat_ID: String(bale.cat_ID),
      sup_ID: String(bale.sup_ID),
      bal_TotalPurchase: String(bale.bal_TotalPurchase),
      bal_Quantity: String(bale.bal_Quantity),
      bal_PricePerPiece: String(bale.bal_PricePerPiece),
      bal_Status: bale.bal_Status,
      bal_Description: bale.bal_Description || "",
    });

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bal_Name.trim()) {
      alert("Please enter the bale name.");
      return;
    }

    if (!formData.cat_ID) {
      alert("Please select a category.");
      return;
    }

    if (!formData.sup_ID) {
      alert("Please select a supplier.");
      return;
    }

    if (!formData.bal_TotalPurchase) {
      alert("Please enter the total purchase.");
      return;
    }

    if (!formData.bal_Quantity) {
      alert("Please enter the quantity.");
      return;
    }

    const totalPurchase = Number(formData.bal_TotalPurchase);
    const quantity = Number(formData.bal_Quantity);

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (totalPurchase < 0) {
      alert("Total purchase cannot be negative.");
      return;
    }

    // Calculate price per piece again before saving
    const pricePerPiece = totalPurchase / quantity;

    setLoading(true);

    const baleData = {
      bal_Name: formData.bal_Name,
      cat_ID: Number(formData.cat_ID),
      sup_ID: Number(formData.sup_ID),
      bal_TotalPurchase: totalPurchase,
      bal_Quantity: quantity,
      bal_PricePerPiece: Number(pricePerPiece.toFixed(2)),
      bal_Status: formData.bal_Status,
      bal_Description: formData.bal_Description || null,
    };

    if (editingBale) {
      const { error } = await supabase
        .from("Bales")
        .update(baleData)
        .eq("bal_ID", editingBale.bal_ID);

      if (error) {
        console.error("Error updating bale:", error);
        alert(`Failed to update bale.\n\n${error.message}`);
        setLoading(false);
        return;
      }

      alert("Bale updated successfully.");
    } else {
      const { error } = await supabase
        .from("Bales")
        .insert([baleData]);

      if (error) {
        console.error("Error adding bale:", error);
        alert(`Failed to add bale.\n\n${error.message}`);
        setLoading(false);
        return;
      }

      alert("Bale added successfully.");
    }

    setShowModal(false);
    setLoading(false);

    fetchBales();
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bale?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Bales")
      .delete()
      .eq("bal_ID", id);

    if (error) {
      console.error("Error deleting bale:", error);
      alert(`Failed to delete bale.\n\n${error.message}`);
      return;
    }

    alert("Bale deleted successfully.");

    fetchBales();
  };

  const filteredBales = bales.filter((bale) => {
    const searchText = search.toLowerCase();

    const category = categories.find(
      (cat) => cat.cat_ID === bale.cat_ID
    );

    const supplier = suppliers.find(
      (sup) => sup.sup_ID === bale.sup_ID
    );

    return (
      bale.bal_Name.toLowerCase().includes(searchText) ||
      bale.bal_Code.toLowerCase().includes(searchText) ||
      bale.bal_Status.toLowerCase().includes(searchText) ||
      (category?.cat_Name || "")
        .toLowerCase()
        .includes(searchText) ||
      (supplier?.sup_Company || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  const getCategoryName = (id: number) => {
    const category = categories.find(
      (cat) => cat.cat_ID === id
    );

    return category?.cat_Name || "Unknown";
  };

  const getSupplierName = (id: number) => {
    const supplier = suppliers.find(
      (sup) => sup.sup_ID === id
    );

    if (!supplier) {
      return "Unknown";
    }

    return supplier.sup_Company || supplier.sup_Name;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bales
          </h1>

          <p className="text-gray-500 text-sm">
            Manage your product bales
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Add Bale
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search bale..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Bale Code
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Supplier
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Total Purchase
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Price / Piece
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBales.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No bales found.
                  </td>
                </tr>
              ) : (
                filteredBales.map((bale) => (
                  <tr
                    key={bale.bal_ID}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {bale.bal_ID}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-blue-600">
                        {bale.bal_Code}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {bale.bal_Name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {getCategoryName(bale.cat_ID)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {getSupplierName(bale.sup_ID)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      ₱
                      {Number(
                        bale.bal_TotalPurchase
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {Number(
                        bale.bal_Quantity
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      ₱
                      {Number(
                        bale.bal_PricePerPiece
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bale.bal_Status === "Available"
                            ? "bg-green-100 text-green-700"
                            : bale.bal_Status === "Sold"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {bale.bal_Status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(bale)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(bale.bal_ID)
                          }
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingBale ? "Edit Bale" : "Add Bale"}
                </h2>

                {!editingBale && (
                  <p className="text-sm text-gray-500 mt-1">
                    Bale code will be generated automatically.
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              {/* Bale Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bale Name
                </label>

                <input
                  type="text"
                  name="bal_Name"
                  value={formData.bal_Name}
                  onChange={handleChange}
                  placeholder="Enter bale name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>

                <select
                  name="cat_ID"
                  value={formData.cat_ID}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option
                      key={category.cat_ID}
                      value={category.cat_ID}
                    >
                      {category.cat_Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>

                <select
                  name="sup_ID"
                  value={formData.sup_ID}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select Supplier</option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.sup_ID}
                      value={supplier.sup_ID}
                    >
                      {supplier.sup_Company} -{" "}
                      {supplier.sup_Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Purchase
                </label>

                <input
                  type="number"
                  name="bal_TotalPurchase"
                  value={formData.bal_TotalPurchase}
                  onChange={handleChange}
                  placeholder="Enter total purchase"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  name="bal_Quantity"
                  value={formData.bal_Quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  step="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Automatically Calculated Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Piece
                </label>

                <input
                  type="number"
                  name="bal_PricePerPiece"
                  value={formData.bal_PricePerPiece}
                  readOnly
                  placeholder="Automatically calculated"
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg outline-none text-gray-700 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Total Purchase ÷ Quantity
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>

                <select
                  name="bal_Status"
                  value={formData.bal_Status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Sold">Sold</option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                  <option value="Pending">
                    Pending
                  </option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="bal_Description"
                  value={formData.bal_Description}
                  onChange={handleChange}
                  placeholder="Enter bale description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingBale
                    ? "Update Bale"
                    : "Add Bale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bales;