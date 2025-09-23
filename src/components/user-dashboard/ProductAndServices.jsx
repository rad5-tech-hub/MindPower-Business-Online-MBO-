import React, { useState, useEffect } from "react";
import { MdFileUpload } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit3 } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import NoProductsImg from "../../assets/NotAvailable.svg";
import EditHeader from "./EditHeader";

const ProductAndServices = () => {
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isNewUpload, setIsNewUpload] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);

  const { token } = useSelector((state) => state.auth);

  // Fetch profile data to get categoryId and subscription status
  useEffect(() => {
    if (!token) {
      toast.error("No authentication token found!");
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.success && response.data?.data) {
          const profile = response.data.data;
          setCategoryId(profile.categories?.[0]?.id || null);
          setIsSubscribed(profile.member.subscriptionStatus === "active");
          if (!profile.categories?.[0]?.id) {
            toast.warn("No category ID found in profile. Upload may fail.");
          }
        } else {
          toast.error("No profile data found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Profile:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch profile data."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Fetch product images
  useEffect(() => {
    if (!token) return;

    const fetchProductImages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/member/my-product-images`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success && response.data.data?.productImages) {
          const fetchedProducts = response.data.data.productImages.map(
            (img) => ({
              id: img.id,
              name: img.name || "Unnamed Product",
              description: img.description || "",
              image: img.imageUrl,
            })
          );
          setProducts(fetchedProducts);
        } else {
          toast.error("No product images found in the response.");
        }
      } catch (error) {
        console.error("❌ Error Fetching Product Images:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch product images."
        );
      }
    };

    fetchProductImages();
  }, [token]);

  // Handle image upload and trigger edit modal
  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    if (!token || !categoryId) {
      toast.error(
        !token ? "Authentication token missing!" : "Category ID not available."
      );
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/member/upload-images/${categoryId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Image uploaded successfully!");
        const imageUrl = response.data.images?.[0]?.imageUrl;
        if (imageUrl) {
          const newProduct = {
            id: response.data.images[0].id,
            name: "",
            description: "",
            image: imageUrl,
          };
          setProducts((prev) => [...prev, newProduct]);
          setEditingProduct(newProduct);
          setNewName("");
          setNewDescription("");
          setIsNewUpload(true);
          if (!isSubscribed) {
            setShowSubscriptionModal(true);
          }
        }
      } else {
        toast.error(response.data.error || "Failed to upload image.");
      }
    } catch (error) {
      console.error("❌ Error Uploading Image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Handle edit functionality
  const handleEdit = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setNewName(product.name);
      setNewDescription(product.description || "");
      setIsNewUpload(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!newName.trim() || !newDescription.trim()) {
      toast.error("Please fill in both product name and description.");
      return;
    }

    if (!editingProduct) {
      toast.error("No product selected for editing.");
      return;
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/member/edit-image/${
          editingProduct.id
        }`,
        { name: newName, description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === editingProduct.id
              ? { ...p, name: newName, description: newDescription }
              : p
          )
        );
        setEditingProduct(null);
        setNewName("");
        setNewDescription("");
        setIsNewUpload(false);
      } else {
        toast.error(response.data.error || "Failed to update product.");
      }
    } catch (error) {
      console.error("❌ Error Updating Product:", error);
      toast.error(error.response?.data?.message || "Failed to update product.");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setDeleteConfirmProduct(product);
    }
  };

  // Handle delete functionality
  const handleDelete = async () => {
    if (!token || !deleteConfirmProduct) {
      toast.error("Authentication token missing or no product selected!");
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/member/delete-image/${
          deleteConfirmProduct.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Product deleted successfully!");
        const updatedProducts = products.filter(
          (p) => p.id !== deleteConfirmProduct.id
        );
        setProducts(updatedProducts);
        setDeleteConfirmProduct(null);
      } else {
        toast.error(response.data.error || "Failed to delete product.");
      }
    } catch (error) {
      console.error("❌ Error Deleting Product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    }
  };

  // Loader component
  const Loader = () => (
    <div className="flex space-x-2 items-center">
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-pulse delay-200"></div>
      <div className="w-3 h-3 bg-[#003087] rounded-full animate-pulse delay-400"></div>
    </div>
  );

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#FEFEFF] to-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full pb-8 flex flex-col gap-10 text-[#003087] bg-gradient-to-br from-[#FEFEFF] to-white min-h-screen">
      <EditHeader />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="container px-[5vw] mx-auto">
        <div className="product-header flex max-md:flex-col max-md:gap-4 items-center justify-between mb-8">
          <p className="text-[18px] text-[#003087] font-semibold border-b-2 border-[#043D12] px-3 py-1 transition-all">
            Product & Services
          </p>
          <button
            className={`text-[14px] border-[1px] rounded-full shadow px-5 py-2.5 flex items-center gap-2 border-[#043D12] bg-[#003087] text-white hover:bg-[#03280E] transition-all duration-300 cursor-pointer ${
              uploading ? "cursor-not-allowed opacity-60" : ""
            }`}
            onClick={() => {
              if (!uploading) {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*";
                fileInput.onchange = (e) =>
                  handleImageUpload(e.target.files[0]);
                fileInput.click();
              }
            }}
            disabled={uploading || !categoryId}
          >
            {uploading ? "Uploading..." : "Add New Product"}
            {uploading ? <Loader /> : <MdFileUpload className="text-[22px]" />}
          </button>
        </div>

        {/* Products Grid with Empty State */}
        {products.length > 0 ? (
          <div className="products grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <figure
                key={product.id}
                className="flex flex-col gap-4 group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={product.image}
                    alt={`Product_${product.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.target.src = NoProductsImg)}
                  />
                </div>
                <figcaption className="flex flex-col px-4 py-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[14px] font-medium text-[#003087]">
                      {product.name}
                    </h5>
                    <div className="flex items-center gap-3 text-[20px]">
                      <FiEdit3
                        className="cursor-pointer text-[#003087] hover:text-[#003087] transition-colors"
                        onClick={() => handleEdit(product.id)}
                      />
                      <RiDeleteBinLine
                        className="text-red-400 cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteConfirm(product.id)}
                      />
                    </div>
                  </div>
                  <p className="text-[12px] text-[#003087] line-clamp-2">
                    {product.description || "No description provided"}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-[#043D12] rounded-xl bg-white shadow-sm">
            <div className="w-48 h-48 mb-6">
              <img
                src={NoProductsImg}
                alt="No products"
                className="w-full h-full object-contain opacity-80"
              />
            </div>
            <h3 className="text-2xl font-semibold text-[#003087] mb-3">
              No Products Yet
            </h3>
            <p className="text-center text-[#003087] mb-6 max-w-md">
              Showcase your amazing products and services. Upload your first
              product to kick things off!
            </p>
            <button
              className="text-[14px] border-[1px] rounded-full shadow px-6 py-3 flex items-center gap-2 border-[#043D12] bg-[#003087] text-white hover:bg-[#03280E] transition-all duration-300"
              onClick={() => {
                if (!uploading) {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = (e) =>
                    handleImageUpload(e.target.files[0]);
                  fileInput.click();
                }
              }}
              disabled={uploading || !categoryId}
            >
              {uploading ? "Uploading..." : "Upload Your First Product"}
              {uploading ? (
                <Loader />
              ) : (
                <MdFileUpload className="text-[22px]" />
              )}
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl w-[28rem] max-w-[90%] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
              <h2 className="text-2xl font-semibold text-[#003087] mb-6">
                {isNewUpload ? "Name & Describe Your Product" : "Edit Product"}
              </h2>
              {/* Product Image Preview */}
              <div className="mb-6 flex justify-center">
                <img
                  src={editingProduct.image}
                  alt={editingProduct.name || "Product Preview"}
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                  onError={(e) => (e.target.src = NoProductsImg)}
                />
              </div>
              {/* Name Input */}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-[#6A7368]/30 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#043D12] transition-all"
                placeholder="Enter product name"
                autoFocus
                required
              />
              {/* Description Textarea */}
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-3 border border-[#6A7368]/30 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-[#043D12] transition-all resize-none"
                placeholder="Enter product description"
                rows="4"
                required
              />
              <div className="flex justify-end gap-3">
                {/* Only show Cancel button during edit mode, not during new upload */}
                {!isNewUpload && (
                  <button
                    className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-[#003087] font-medium cursor-pointer"
                    onClick={() => {
                      setEditingProduct(null);
                      setNewName("");
                      setNewDescription("");
                      setIsNewUpload(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                    newName.trim() && newDescription.trim()
                      ? "bg-[#003087] text-white hover:bg-[#03280E]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleSaveEdit}
                  disabled={!newName.trim() || !newDescription.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmProduct && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl w-96 max-w-[90%] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
              <h2 className="text-xl font-semibold text-[#003087] mb-4">
                Confirm Deletion
              </h2>
              <p className="text-[#003087] mb-4">
                Are you sure you want to delete "{deleteConfirmProduct.name}"?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                  onClick={() => setDeleteConfirmProduct(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Modal for Non-Subscribed Users */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl w-[32rem] max-w-[90%] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
              <h2 className="text-2xl font-semibold text-[#003087] mb-4">
                Heads up!{" "}
              </h2>
              <p className="text-[#003087] mb-6">
                Products stay hidden until you subscribe.
                <br />
                Want buyers to find you? Unlock your profile
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-[#003087] font-medium cursor-pointer"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  Close
                </button>
                <a
                  href="/subscribe" // Adjust the URL to match your subscription page route
                  className="px-6 py-2.5 bg-[#003087] text-white rounded-lg hover:bg-[#03280E] transition-colors duration-200 font-medium cursor-pointer"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAndServices;
