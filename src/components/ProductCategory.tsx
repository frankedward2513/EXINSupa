import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

type Category = {
  cat_ID: number;
  cat_Name: string;
  cat_Description: string | null;
  cat_Color: string | null;
  pro_ID: number;
  created_at: string;
};

function App() {
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catColor, setCatColor] = useState("");
  const [proID, setProID] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get categories from Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("Categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      setErrorMessage(`Failed to load categories: ${error.message}`);
    } else {
      setCategories(data || []);
    }
  };

  // Load categories when app starts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!catName.trim()) {
      setErrorMessage("Please enter a category name.");
      return;
    }

    if (!proID) {
      setErrorMessage("Please enter a Product ID.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("Categories")
      .insert([
        {
          cat_Name: catName.trim(),
          cat_Description: catDescription.trim() || null,
          cat_Color: catColor.trim() || null,
          pro_ID: Number(proID),
        },
      ])
      .select();

    console.log("Inserted data:", data);
    console.log("Supabase error:", error);

    if (error) {
      console.error("INSERT ERROR:", error);
      setErrorMessage(`Failed to add category: ${error.message}`);
    } else {
      setSuccessMessage("Category added successfully!");

      // Clear form
      setCatName("");
      setCatDescription("");
      setCatColor("");
      setProID("");

      // Refresh category list
      await fetchCategories();
    }

    setLoading(false);
  };

  return (
    <div>

      <h1>Categories</h1>

      {/* Add Category Form */}
      <h2>Add Category</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Category Name</label>
          <br />

          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />

          <textarea
            value={catDescription}
            onChange={(e) =>
              setCatDescription(e.target.value)
            }
            placeholder="Enter description"
          />
        </div>

        <br />

        <div>
          <label>Color</label>
          <br />

          <input
            type="text"
            value={catColor}
            onChange={(e) =>
              setCatColor(e.target.value)
            }
            placeholder="e.g. blue or #3b82f6"
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Category"}
        </button>

      </form>

      <br />

      {/* Messages */}

      {successMessage && (
        <p>{successMessage}</p>
      )}

      {errorMessage && (
        <p>{errorMessage}</p>
      )}

      <hr />

      {/* Category List */}

      <h2>Existing Categories</h2>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div>

          {categories.map((category) => (
            <div key={category.cat_ID}>

              <h3>
                {category.cat_Name}
              </h3>

              <p>
                Description:{" "}
                {category.cat_Description ||
                  "No description"}
              </p>

              <p>
                Color:{" "}
                {category.cat_Color ||
                  "No color"}
              </p>

              <p>
                Product ID: {category.pro_ID}
              </p>

              <p>
                Category ID: {category.cat_ID}
              </p>

              <p>
                Created:{" "}
                {new Date(
                  category.created_at
                ).toLocaleDateString()}
              </p>

              <hr />

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default App;