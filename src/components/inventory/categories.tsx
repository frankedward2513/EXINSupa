import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

interface Category {
  cat_ID: number;
  cat_Name: string;
  cat_Description: string | null;
  cat_Color: string | null;
  created_at: string;
}

interface CategoryForm {
  cat_Name: string;
  cat_Description: string;
  cat_Color: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );

  const [formData, setFormData] = useState<CategoryForm>({
    cat_Name: "",
    cat_Description: "",
    cat_Color: "#000000",
  });

  const [loading, setLoading] = useState(false);

  // ============================================
  // FETCH CATEGORIES
  // ============================================

  const fetchCategories = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Categories")
      .select(
        "cat_ID, cat_Name, cat_Description, cat_Color, created_at"
      )
      .order("cat_ID", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error.message);
      alert("Failed to load categories.");
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================
  // HANDLE INPUT
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // OPEN ADD MODAL
  // ============================================

  const openAddModal = () => {
    setEditingCategory(null);

    setFormData({
      cat_Name: "",
      cat_Description: "",
      cat_Color: "#000000",
    });

    setShowModal(true);
  };

  // ============================================
  // OPEN EDIT MODAL
  // ============================================

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    setFormData({
      cat_Name: category.cat_Name,
      cat_Description: category.cat_Description || "",
      cat_Color: category.cat_Color || "#000000",
    });

    setShowModal(true);
  };

  // ============================================
  // SAVE CATEGORY
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cat_Name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setLoading(true);

    if (editingCategory) {
      // UPDATE
      const { error } = await supabase
        .from("Categories")
        .update({
          cat_Name: formData.cat_Name,
          cat_Description: formData.cat_Description,
          cat_Color: formData.cat_Color,
        })
        .eq("cat_ID", editingCategory.cat_ID);

      if (error) {
        console.error("Error updating category:", error.message);
        alert("Failed to update category.");
      } else {
        alert("Category updated successfully.");
        setShowModal(false);
        fetchCategories();
      }
    } else {
      // INSERT
      // cat_ID and created_at are generated automatically
      const { error } = await supabase.from("Categories").insert([
        {
          cat_Name: formData.cat_Name,
          cat_Description: formData.cat_Description,
          cat_Color: formData.cat_Color,
        },
      ]);

      if (error) {
        console.error("Error adding category:", error.message);
        alert("Failed to add category.");
      } else {
        alert("Category added successfully.");
        setShowModal(false);
        fetchCategories();
      }
    }

    setLoading(false);
  };

  // ============================================
  // DELETE CATEGORY
  // ============================================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Categories")
      .delete()
      .eq("cat_ID", id);

    if (error) {
      console.error("Error deleting category:", error.message);
      alert("Failed to delete category.");
    } else {
      alert("Category deleted successfully.");
      fetchCategories();
    }
  };

  // ============================================
  // SEARCH
  // ============================================

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      category.cat_Name.toLowerCase().includes(searchText) ||
      (category.cat_Description || "").toLowerCase().includes(searchText)
    );
  });

  // ============================================
  // UI
  // ============================================

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Categories
          </h1>

          <p className="text-gray-500 text-sm">
            Manage your product categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Add Category
        </button>
      </div>

      {/* SEARCH */}

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Category Name
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Color
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Created
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.cat_ID}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {category.cat_ID}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {category.cat_Name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {category.cat_Description || "No description"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{
                            backgroundColor:
                              category.cat_Color || "#000000",
                          }}
                        />

                        <span className="text-sm text-gray-600">
                          {category.cat_Color || "None"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(category.cat_ID)
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

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* CATEGORY NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>

                <input
                  type="text"
                  name="cat_Name"
                  value={formData.cat_Name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="cat_Description"
                  value={formData.cat_Description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* COLOR */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Color
                </label>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cat_Color"
                    value={formData.cat_Color}
                    onChange={handleChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />

                  <input
                    type="text"
                    name="cat_Color"
                    value={formData.cat_Color}
                    onChange={handleChange}
                    placeholder="#000000"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* BUTTONS */}

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
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;