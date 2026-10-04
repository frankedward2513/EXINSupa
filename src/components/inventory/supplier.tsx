import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

interface Supplier {
  sup_ID: number;
  sup_Company: string;
  sup_Name: string;
  sup_Email: string;
  sup_Address: string;
  sup_Description: string | null;
  created_at: string;
}

const Supplier: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    sup_Company: "",
    sup_Name: "",
    sup_Email: "",
    sup_Address: "",
    sup_Description: "",
  });

  // =========================
  // GET SUPPLIERS
  // =========================
  const fetchSuppliers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Suppliers")
      .select(
        "sup_ID, sup_Company, sup_Name, sup_Email, sup_Address, sup_Description, created_at"
      )
      .order("sup_ID", { ascending: false });

    if (error) {
      console.error("Error fetching suppliers:", error);
      alert(error.message);
    } else {
      setSuppliers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);

    setFormData({
      sup_Company: "",
      sup_Name: "",
      sup_Email: "",
      sup_Address: "",
      sup_Description: "",
    });

    setIsModalOpen(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (supplier: Supplier) => {
    setIsEditMode(true);
    setSelectedId(supplier.sup_ID);

    setFormData({
      sup_Company: supplier.sup_Company,
      sup_Name: supplier.sup_Name,
      sup_Email: supplier.sup_Email,
      sup_Address: supplier.sup_Address,
      sup_Description: supplier.sup_Description || "",
    });

    setIsModalOpen(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setSelectedId(null);
  };

  // =========================
  // ADD / UPDATE SUPPLIER
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.sup_Company.trim() ||
      !formData.sup_Name.trim() ||
      !formData.sup_Email.trim() ||
      !formData.sup_Address.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);

    if (isEditMode && selectedId !== null) {
      // UPDATE
      const { error } = await supabase
        .from("Suppliers")
        .update({
          sup_Company: formData.sup_Company,
          sup_Name: formData.sup_Name,
          sup_Email: formData.sup_Email,
          sup_Address: formData.sup_Address,
          sup_Description: formData.sup_Description || null,
        })
        .eq("sup_ID", selectedId);

      if (error) {
        console.error("Error updating supplier:", error);
        alert(error.message);
      } else {
        alert("Supplier updated successfully.");
        closeModal();
        await fetchSuppliers();
      }
    } else {
      // INSERT
      const { error } = await supabase.from("Suppliers").insert([
        {
          sup_Company: formData.sup_Company,
          sup_Name: formData.sup_Name,
          sup_Email: formData.sup_Email,
          sup_Address: formData.sup_Address,
          sup_Description: formData.sup_Description || null,
        },
      ]);

      if (error) {
        console.error("Error adding supplier:", error);
        alert(error.message);
      } else {
        alert("Supplier added successfully.");
        closeModal();
        await fetchSuppliers();
      }
    }

    setSaving(false);
  };

  // =========================
  // DELETE SUPPLIER
  // =========================
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Suppliers")
      .delete()
      .eq("sup_ID", id);

    if (error) {
      console.error("Error deleting supplier:", error);
      alert(error.message);
    } else {
      alert("Supplier deleted successfully.");
      await fetchSuppliers();
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase();

    return (
      supplier.sup_Company.toLowerCase().includes(searchText) ||
      supplier.sup_Name.toLowerCase().includes(searchText) ||
      supplier.sup_Email.toLowerCase().includes(searchText) ||
      supplier.sup_Address.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Supplier Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your suppliers
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Supplier
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading suppliers...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No suppliers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    Company
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    Contact Name
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    Address
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-600 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.sup_ID}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {supplier.sup_ID}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {supplier.sup_Company}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {supplier.sup_Name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {supplier.sup_Email}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {supplier.sup_Address}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {supplier.sup_Description || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(supplier.sup_ID)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Supplier" : "Add Supplier"}
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>

                <input
                  type="text"
                  name="sup_Company"
                  value={formData.sup_Company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>

                <input
                  type="text"
                  name="sup_Name"
                  value={formData.sup_Name}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>

                <input
                  type="email"
                  name="sup_Email"
                  value={formData.sup_Email}
                  onChange={handleChange}
                  placeholder="supplier@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>

                <input
                  type="text"
                  name="sup_Address"
                  value={formData.sup_Address}
                  onChange={handleChange}
                  placeholder="Enter supplier address"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="sup_Description"
                  value={formData.sup_Description}
                  onChange={handleChange}
                  placeholder="Enter supplier description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                    ? "Update Supplier"
                    : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplier;