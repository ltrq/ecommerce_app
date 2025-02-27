// app/utils/firebase-utilsFunc.ts
import { db } from './firebase'; // Adjust the import path if needed
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';

// Define the Product interface to match your Firestore structure
export interface Product {
  imgURL1?: string;
  imgURL2?: string;
  imgURL3?: string;
  itemName: string;
  stockQuantity: number;
  price: number;
  averageRating: string | number;
  material: string;
  itemID: number;
  subCategoryID: string;
  color: string;
  saleStartDate?: any; // Timestamp or null/undefined
  updatedAt?: any; // Timestamp or empty string
  dimension: string;
  status: string;
  reviewCount: string | number;
  saleEndDate?: any; // Timestamp or empty string
  createdAt?: any; // Timestamp or empty string
  discount: number;
  categoryID: string;
  isOnSale: boolean;
  itemSize: string;
  description: string;
  SKU: string;
}

// Fetch all products from Firestore
export async function fetchAllProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map((doc) => doc.data() as Product);
    console.log('Fetched products:', products); // Debug log
    return { results: products }; // Match the expected structure in Chatbox.tsx
  } catch (error) {
    console.error('Failed to fetch products from Firestore:', error);
    throw new Error('Failed to fetch products');
  }
}

// Add a new product to the Firestore 'products' collection
export async function addProduct(newProduct: Product): Promise<string> {
  try {
    const productsCollectionRef = collection(db, 'products');
    const docRef = await addDoc(productsCollectionRef, newProduct);
    console.log('Document written with ID:', docRef.id);
    return docRef.id; // Return the generated document ID
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product to Firestore');
  }
}

// Update an existing product in the Firestore 'products' collection
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) {
      console.warn('Document does not exist:', productId);
      throw new Error('Product not found in Firestore');
    }

    console.log('Document data before update:', docSnap.data());
    await updateDoc(productRef, updates);
    console.log('Document successfully updated:', productId);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product in Firestore');
  }
}

// Perform a transaction for complex updates (e.g., atomic updates across multiple documents)
export async function updateProductWithTransaction(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(productRef);
      if (!docSnap.exists()) {
        console.warn('Document does not exist in transaction:', productId);
        throw new Error('Product not found in Firestore');
      }
      console.log('Transaction data before update:', docSnap.data());
      transaction.update(productRef, updates);
    });
    console.log('Transaction successfully completed for:', productId);
  } catch (error) {
    console.error('Error in transaction:', error);
    throw new Error('Failed to update product with transaction');
  }
}

// Example usage in a React component (to be implemented separately)
// function AddProductComponent() {
//   const handleAddProduct = async () => {
//     const newProduct: Product = {
//       itemName: 'Super Cool Socks',
//       stockQuantity: 100,
//       price: 9.99,
//       averageRating: '4.0',
//       material: 'Cotton',
//       itemID: 6,
//       subCategoryID: '1',
//       color: 'Blue',
//       dimension: '10x5x1 cm',
//       status: 'Active',
//       reviewCount: '50',
//       discount: 5,
//       categoryID: '1',
//       isOnSale: true,
//       itemSize: 'M',
//       description: 'The comfiest socks you\'ll ever own!',
//       SKU: 'SKU-SOCKS-BLUE-M',
//     };
//     try {
//       const docId = await addProduct(newProduct);
//       console.log('Added product with ID:', docId);
//     } catch (error) {
//       console.error('Add product failed:', error);
//     }
//   };

//   const handleUpdateProduct = async () => {
//     try {
//       await updateProduct('product_1', { price: 14.99, isOnSale: false });
//       console.log('Product updated');
//     } catch (error) {
//       console.error('Update product failed:', error);
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleAddProduct}>Add Product</button>
//       <button onClick={handleUpdateProduct}>Update Product</button>
//     </div>
//   );
// }

// export { fetchAllProducts, addProduct, updateProduct, updateProductWithTransaction };
