// app/components/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigate for redirection
import {
  addProduct,
  updateProduct,
  fetchAllProducts,
} from '../utils/firebase-utilsFunc'; // Adjust the import path
import { type Product } from '../utils/firebase-utilsFunc'; // Import the Product interface
import { auth } from '../utils/firebase'; // Import auth for authentication check

export default function AdminPanel() {
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
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.warn('User not authenticated, redirecting to home');
        navigate('/'); // Redirect to home page if not authenticated
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [navigate]);

  // Fetch existing products on component mount
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchAllProducts();
        setProducts(productData.results as Product[]);
      } catch (error) {
        console.error('Failed to load products:', error);
        setMessage('Failed to load products.');
      }
    };
    loadProducts();
  }, []);

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
    setIsLoading(true);
    setMessage('');

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
      const updatedProducts = await fetchAllProducts();
      setProducts(updatedProducts.results as Product[]);
    } catch (error) {
      console.error('Add product failed:', error);
      if (error instanceof Error) {
        setMessage(`Error adding product: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating an existing product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

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
      const updatedProducts = await fetchAllProducts();
      setProducts(updatedProducts.results as Product[]);
    } catch (error) {
      console.error('Update product failed:', error);
      if (error instanceof Error) {
        setMessage(`Error updating product: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow-lg rounded-lg  text-black">
      <h2 className="text-2xl font-bold mb-4">Admin Panel - Manage Products</h2>

      {/* Add Product Form */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-xl font-semibold mb-2">Add New Product</h3>
        {message && <p className="mb-2 text-red-500">{message}</p>}
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input
            type="text"
            name="itemName"
            value={newProduct.itemName}
            onChange={handleInputChange}
            placeholder="Item Name *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Price *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="color"
            value={newProduct.color}
            onChange={handleInputChange}
            placeholder="Color *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="itemSize"
            value={newProduct.itemSize}
            onChange={handleInputChange}
            placeholder="Size *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="stockQuantity"
            value={newProduct.stockQuantity}
            onChange={handleInputChange}
            placeholder="Stock Quantity"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Update Product Form */}
      <div className="p-4 border rounded">
        <h3 className="text-xl font-semibold mb-2">Update Existing Product</h3>
        {message && <p className="mb-2 text-red-500">{message}</p>}
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Product ID *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="price"
            value={updates.price || ''}
            onChange={handleUpdateChange}
            placeholder="New Price"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="color"
            value={updates.color || ''}
            onChange={handleUpdateChange}
            placeholder="New Color"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="itemSize"
            value={updates.itemSize || ''}
            onChange={handleUpdateChange}
            placeholder="New Size"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="stockQuantity"
            value={updates.stockQuantity || ''}
            onChange={handleUpdateChange}
            placeholder="New Stock Quantity"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </form>
        <div className="mt-4">
          <h4 className="text-lg font-medium">Current Products</h4>
          <ul className="list-disc pl-5">
            {products.map((product) => (
              <li key={product.itemID} className="text-sm">
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
