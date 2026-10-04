import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

interface Product {
  pro_ID: number;
  pro_Name: string;
  bal_ID: number;
  pro_Quantity: number;
  pro_SellingPrice: number;
  pro_Size: string;
  pro_Link: string;
  pro_Description: string | null;
  created_at: string;
}

interface Bale {
  bal_ID: number;
  bal_Name: string;
  bal_Code: string;
  bal_Quantity: number;
}

interface ProductForm {
  pro_Name: string;
  bal_ID: string;
  pro_Quantity: string;
  pro_SellingPrice: string;
  pro_Size: string;
  pro_Description: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bales, setBales] = useState<Bale[]>([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>({
    pro_Name: "",
    bal_ID: "",
    pro_Quantity: "",
    pro_SellingPrice: "",
    pro_Size: "",
    pro_Description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ==============================
  // FETCH PRODUCTS
  // ==============================
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("Products")
      .select("*")
      .order("pro_ID", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      setErrorMessage(error.message);
      return;
    }

    setProducts((data || []) as Product[]);
  };

  // ==============================
  // FETCH BALES
  // ==============================
  const fetchBales = async () => {
    const { data, error } = await supabase
      .from("Bales")
      .select("bal_ID, bal_Name, bal_Code, bal_Quantity")
      .order("bal_ID", { ascending: true });

    if (error) {
      console.error("Error fetching bales:", error);
      setErrorMessage(error.message);
      return;
    }

    setBales((data || []) as Bale[]);
  };

  useEffect(() => {
    fetchProducts();
    fetchBales();
  }, []);

  // ==============================
  // FORM CHANGE
  // ==============================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // IMAGE CHANGE
  // ==============================
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB.");
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    setErrorMessage("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ==============================
  // UPLOAD IMAGE
  // ==============================
  const uploadImage = async (
    file: File
  ): Promise<string | null> => {
    const fileExtension = file.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExtension}`;

    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Image upload error:", error);
      setErrorMessage(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ==============================
  // DELETE IMAGE FROM STORAGE
  // ==============================
  const deleteImageFromStorage = async (
    imageUrl: string
  ) => {
    if (!imageUrl) {
      return;
    }

    try {
      const marker =
        "/storage/v1/object/public/product-images/";

      const index = imageUrl.indexOf(marker);

      if (index === -1) {
        return;
      }

      const filePath = imageUrl.substring(
        index + marker.length
      );

      if (!filePath) {
        return;
      }

      const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (error) {
        console.error(
          "Error deleting image:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Error deleting image:",
        error
      );
    }
  };

  // ==============================
  // OPEN ADD MODAL
  // ==============================
  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      pro_Name: "",
      bal_ID: "",
      pro_Quantity: "",
      pro_SellingPrice: "",
      pro_Size: "",
      pro_Description: "",
    });

    setImageFile(null);
    setImagePreview("");
    setErrorMessage("");
    setShowModal(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================
  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      pro_Name: product.pro_Name,
      bal_ID: String(product.bal_ID),
      pro_Quantity: String(product.pro_Quantity),
      pro_SellingPrice: String(product.pro_SellingPrice),
      pro_Size: product.pro_Size,
      pro_Description: product.pro_Description || "",
    });

    setImageFile(null);
    setImagePreview(product.pro_Link || "");
    setErrorMessage("");
    setShowModal(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
    setErrorMessage("");
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      // Basic validation
      if (!form.pro_Name.trim()) {
        setErrorMessage("Product name is required.");
        setLoading(false);
        return;
      }

      if (!form.bal_ID) {
        setErrorMessage("Please select a bale.");
        setLoading(false);
        return;
      }

      if (
        form.pro_Quantity === "" ||
        Number(form.pro_Quantity) < 0
      ) {
        setErrorMessage(
          "Quantity must be zero or greater."
        );
        setLoading(false);
        return;
      }

      if (
        form.pro_SellingPrice === "" ||
        Number(form.pro_SellingPrice) < 0
      ) {
        setErrorMessage(
          "Selling price must be zero or greater."
        );
        setLoading(false);
        return;
      }

      if (!form.pro_Size.trim()) {
        setErrorMessage("Product size is required.");
        setLoading(false);
        return;
      }

      // Image is required when adding
      if (!editingProduct && !imageFile) {
        setErrorMessage(
          "Please select a product image."
        );
        setLoading(false);
        return;
      }

      let imageUrl =
        editingProduct?.pro_Link || "";

      // Upload new image
      if (imageFile) {
        const uploadedUrl =
          await uploadImage(imageFile);

        if (!uploadedUrl) {
          setLoading(false);
          return;
        }

        imageUrl = uploadedUrl;

        // Delete old image when replacing it
        if (
          editingProduct?.pro_Link &&
          editingProduct.pro_Link !== uploadedUrl
        ) {
          await deleteImageFromStorage(
            editingProduct.pro_Link
          );
        }
      }

      // ==============================
      // UPDATE
      // ==============================
      if (editingProduct) {
        const { error } = await supabase
          .from("Products")
          .update({
            pro_Name: form.pro_Name.trim(),
            bal_ID: Number(form.bal_ID),
            pro_Quantity: Number(form.pro_Quantity),
            pro_SellingPrice: Number(
              form.pro_SellingPrice
            ),
            pro_Size: form.pro_Size.trim(),
            pro_Link: imageUrl,
            pro_Description:
              form.pro_Description.trim() || null,
          })
          .eq("pro_ID", editingProduct.pro_ID);

        if (error) {
          console.error(
            "Error updating product:",
            error
          );

          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      }

      // ==============================
      // INSERT
      // ==============================
      else {
        const { error } = await supabase
          .from("Products")
          .insert([
            {
              pro_Name: form.pro_Name.trim(),
              bal_ID: Number(form.bal_ID),
              pro_Quantity: Number(
                form.pro_Quantity
              ),
              pro_SellingPrice: Number(
                form.pro_SellingPrice
              ),
              pro_Size: form.pro_Size.trim(),
              pro_Link: imageUrl,
              pro_Description:
                form.pro_Description.trim() ||
                null,
            },
          ]);

        if (error) {
          console.error(
            "Error adding product:",
            error
          );

          // Delete uploaded image if database insert fails
          if (imageFile && imageUrl) {
            await deleteImageFromStorage(
              imageUrl
            );
          }

          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      }

      await fetchProducts();

      closeModal();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE PRODUCT
  // ==============================
  const handleDelete = async (
    product: Product
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.pro_Name}"?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("Products")
        .delete()
        .eq("pro_ID", product.pro_ID);

      if (error) {
        console.error(
          "Error deleting product:",
          error
        );

        setErrorMessage(error.message);
        return;
      }

      // Delete image after database deletion
      if (product.pro_Link) {
        await deleteImageFromStorage(
          product.pro_Link
        );
      }

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong while deleting the product."
      );
    }
  };

  // ==============================
  // GET BALE NAME
  // ==============================
  const getBaleName = (balId: number) => {
    const bale = bales.find(
      (item) => item.bal_ID === balId
    );

    if (!bale) {
      return "Unknown Bale";
    }

    return `${bale.bal_Code} - ${bale.bal_Name}`;
  };

  // ==============================
  // SEARCH
  // ==============================
  const filteredProducts = products.filter(
    (product) => {
      const searchValue =
        search.toLowerCase();

      return (
        product.pro_Name
          .toLowerCase()
          .includes(searchValue) ||
        product.pro_Size
          .toLowerCase()
          .includes(searchValue) ||
        getBaleName(product.bal_ID)
          .toLowerCase()
          .includes(searchValue) ||
        String(product.pro_ID).includes(
          searchValue
        )
      );
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Products
          </h2>

          <p className="text-sm text-gray-500">
            Manage your products and product images.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add Product
        </button>

      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr className="border-b border-gray-200">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Image
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Bale
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Quantity
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Selling Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Size
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => (
                    <tr
                      key={product.pro_ID}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >

                      {/* IMAGE */}
                      <td className="px-6 py-4">

                        {product.pro_Link ? (
                          <img
                            src={product.pro_Link}
                            alt={product.pro_Name}
                            className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                      </td>

                      {/* ID */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.pro_ID}
                      </td>

                      {/* PRODUCT */}
                      <td className="px-6 py-4">

                        <p className="font-medium text-gray-800">
                          {product.pro_Name}
                        </p>

                        {product.pro_Description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {product.pro_Description}
                          </p>
                        )}

                      </td>

                      {/* BALE */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getBaleName(
                          product.bal_ID
                        )}
                      </td>

                      {/* QUANTITY */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.pro_Quantity}
                      </td>

                      {/* SELLING PRICE */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        ₱
                        {Number(
                          product.pro_SellingPrice
                        ).toFixed(2)}
                      </td>

                      {/* SIZE */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.pro_Size}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h3>

                <p className="text-sm text-gray-500">
                  {editingProduct
                    ? "Update product information."
                    : "Add a new product to your inventory."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* PRODUCT NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Name
                </label>

                <input
                  type="text"
                  name="pro_Name"
                  value={form.pro_Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter product name"
                />
              </div>

              {/* BALE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bale
                </label>

                <select
                  name="bal_ID"
                  value={form.bal_ID}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Bale
                  </option>

                  {bales.map((bale) => (
                    <option
                      key={bale.bal_ID}
                      value={bale.bal_ID}
                    >
                      {bale.bal_Code} -{" "}
                      {bale.bal_Name}
                    </option>
                  ))}

                </select>
              </div>

              {/* QUANTITY + PRICE */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="pro_Quantity"
                    value={form.pro_Quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    name="pro_SellingPrice"
                    value={form.pro_SellingPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter selling price"
                  />
                </div>

              </div>

              {/* SIZE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Size
                </label>

                <input
                  type="text"
                  name="pro_Size"
                  value={form.pro_Size}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Example: Small, Medium, Large"
                />
              </div>

              {/* IMAGE */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Maximum file size: 5MB
                </p>

                {/* IMAGE PREVIEW */}
                {imagePreview && (
                  <div className="mt-4">

                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Image Preview
                    </p>

                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
                    />

                  </div>
                )}

              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="pro_Description"
                  value={form.pro_Description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter product description"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Products;