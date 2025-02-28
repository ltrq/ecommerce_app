// app/components/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/productContext'; // Use ProductContext for products, UserContext for auth
import { useUser } from '../context/userContext';
import { addProduct, updateProduct } from '../utils/firebase-utilsFunc'; // Only import write functions
import { type Product } from '../context/productContext'; // Import Product interface from ProductContext

export default function AdminPanel() {
  const { products, isLoading, error, refreshProducts } = useProducts(); // Access products from ProductContext
  const user = useUser(); // Check authentication for writes
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    itemName: '',
    stockQuantity: 0,
    price: 0,
    averageRating: 'N/A',
    material: 'N/A',
    itemID: 0,
    subCategoryID: 'N/A',
    color: 'N/A',
    saleStartDate: null,
    updatedAt: null,
    dimension: 'N/A',
    status: 'Active',
    reviewCount: 'N/A',
    saleEndDate: null,
    createdAt: null,
    discount: 0,
    categoryID: 'N/A',
    isOnSale: false,
    itemSize: 'N/A',
    description: '',
    SKU: '',
    imgURL1: '',
    imgURL2: '',
    imgURL3: '',
  });
  const [productId, setProductId] = useState<string>('');
  const [updates, setUpdates] = useState<Partial<Product>>({});
  const [message, setMessage] = useState<string>('');

  // Redirect to home if not authenticated on mount
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  // Handle input changes for new product
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle input changes for updates
  const handleUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setUpdates((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle adding a new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('Please log in to add products.');
      return;
    }

    try {
      const requiredFields: (keyof Product)[] = [
        'itemName',
        'price',
        'color',
        'itemSize',
      ];
      const hasAllRequired = requiredFields.every(
        (field) => !!newProduct[field]
      );
      if (!hasAllRequired) {
        throw new Error(
          'Please fill all required fields: itemName, price, color, itemSize'
        );
      }

      const productToAdd: Product = {
        ...newProduct,
        stockQuantity: newProduct.stockQuantity || 0,
        averageRating: newProduct.averageRating || 'N/A',
        material: newProduct.material || 'N/A',
        itemID: newProduct.itemID || Date.now(), // Use timestamp if no ID
        subCategoryID: newProduct.subCategoryID || 'N/A',
        saleStartDate: newProduct.saleStartDate || null,
        updatedAt: newProduct.updatedAt || null,
        dimension: newProduct.dimension || 'N/A',
        status: newProduct.status || 'Active',
        reviewCount: newProduct.reviewCount || 'N/A',
        saleEndDate: newProduct.saleEndDate || null,
        createdAt: newProduct.createdAt || null,
        discount: newProduct.discount || 0,
        categoryID: newProduct.categoryID || 'N/A',
        isOnSale: newProduct.isOnSale || false,
        description: newProduct.description || '',
        SKU: newProduct.SKU || `SKU-${Date.now()}`,
        imgURL1: newProduct.imgURL1 || '',
        imgURL2: newProduct.imgURL2 || '',
        imgURL3: newProduct.imgURL3 || '',
      } as Product;

      const docId = await addProduct(productToAdd);
      setMessage(`Product added successfully with ID: ${docId}`);
      setNewProduct({
        itemName: '',
        stockQuantity: 0,
        price: 0,
        averageRating: 'N/A',
        material: 'N/A',
        itemID: 0,
        subCategoryID: 'N/A',
        color: 'N/A',
        saleStartDate: null,
        updatedAt: null,
        dimension: 'N/A',
        status: 'Active',
        reviewCount: 'N/A',
        saleEndDate: null,
        createdAt: null,
        discount: 0,
        categoryID: 'N/A',
        isOnSale: false,
        itemSize: 'N/A',
        description: '',
        SKU: '',
        imgURL1: '',
        imgURL2: '',
        imgURL3: '',
      }); // Reset form
      refreshProducts(); // Update ProductContext with new products
    } catch (error) {
      console.error('Add product failed:', error);
      setMessage(
        `Error adding product: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  // Handle updating an existing product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('Please log in to update products.');
      return;
    }

    try {
      if (!productId) {
        throw new Error('Please enter a product ID to update');
      }

      const hasUpdates = Object.keys(updates).length > 0;
      if (!hasUpdates) {
        throw new Error('Please provide at least one field to update');
      }

      await updateProduct(productId, updates);
      setMessage(`Product ${productId} updated successfully`);
      setProductId('');
      setUpdates({});
      refreshProducts(); // Update ProductContext with updated products
    } catch (error) {
      console.error('Update product failed:', error);
      setMessage(
        `Error updating product: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-black">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 shadow-xl rounded-lg text-black">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Panel - Manage Products
      </h2>

      {/* Add Product Form */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">
          Add New Product
        </h3>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="itemName"
              value={newProduct.itemName}
              onChange={handleInputChange}
              placeholder="Item Name *"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!user}
            />
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Price *"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!user}
            />
            <input
              type="text"
              name="color"
              value={newProduct.color}
              onChange={handleInputChange}
              placeholder="Color *"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!user}
            />
            <input
              type="text"
              name="itemSize"
              value={newProduct.itemSize}
              onChange={handleInputChange}
              placeholder="Size *"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!user}
            />
            <input
              type="number"
              name="stockQuantity"
              value={newProduct.stockQuantity}
              onChange={handleInputChange}
              placeholder="Stock Quantity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
            <input
              type="text"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition duration-300"
            disabled={!user || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Update Product Form */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">
          Update Existing Product
        </h3>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Product ID *"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!user}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              value={updates.price || ''}
              onChange={handleUpdateChange}
              placeholder="New Price"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
            <input
              type="text"
              name="color"
              value={updates.color || ''}
              onChange={handleUpdateChange}
              placeholder="New Color"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
            <input
              type="text"
              name="itemSize"
              value={updates.itemSize || ''}
              onChange={handleUpdateChange}
              placeholder="New Size"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
            <input
              type="number"
              name="stockQuantity"
              value={updates.stockQuantity || ''}
              onChange={handleUpdateChange}
              placeholder="New Stock Quantity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!user}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition duration-300"
            disabled={!user || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </form>
        <div className="mt-6">
          <h4 className="text-xl font-medium mb-2 text-gray-700">
            Current Products
          </h4>
          <ul className="list-disc pl-5 space-y-2">
            {products.map((product) => (
              <li key={product.itemID} className="text-gray-600">
                {product.itemName} (ID: {product.itemID}, Price: $
                {product.price})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
