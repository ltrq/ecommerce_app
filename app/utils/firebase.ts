// app/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import Papa from 'papaparse';

// Define the Product interface to match your Firestore structure
interface Product {
  imgURL1?: string;
  imgURL2?: string | string[]; // Allow array for multiple images
  imgURL3?: string;
  itemName: string;
  stockQuantity: number;
  price: number;
  averageRating: string | number;
  material: string;
  itemID: number;
  subCategoryID: string;
  color: string;
  saleStartDate?: Date | null; // Allow null for invalid dates
  updatedAt?: Date | null;
  dimension: string;
  status: string;
  reviewCount: string | number;
  saleEndDate?: Date | null;
  createdAt?: Date | null;
  discount: number;
  categoryID: string;
  isOnSale: boolean;
  itemSize: string;
  description: string;
  SKU: string;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional, remove if not used
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  throw new Error('Missing Firebase configuration. Check .env variables.');
}

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Utility function to parse date strings safely
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Utility function to parse array-like string
function parseArrayString(arrayStr: string): string[] {
  if (!arrayStr || typeof arrayStr !== 'string') return [];
  try {
    // Remove brackets and split by comma, trimming whitespace
    return arrayStr
      .replace(/[\[\]']+/g, '')
      .split(',')
      .map((item) => item.trim());
  } catch (error) {
    console.warn('Failed to parse array string:', arrayStr, error);
    return [];
  }
}

// Function to import CSV data into Firestore with TypeScript and Product interface, enhanced with debugging
export async function importCSVToFirestore(
  csvFile: File,
  collectionName: string = 'products'
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting CSV import for file:', csvFile.name); // Debug: Start of import
    Papa.parse(csvFile, {
      header: true, // Assuming your CSV has a header row matching Product interface
      complete: async (results) => {
        console.log(
          'CSV parsing completed, raw results:',
          JSON.stringify(results.data.slice(0, 5), null, 2)
        ); // Debug: First 5 rows of parsed data
        try {
          const batch = writeBatch(db); // Use writeBatch for efficiency
          const maxBatchSize = 500; // Firestore batch limit
          let operationCount = 0;

          results.data.forEach((data: any, index: number) => {
            console.log(`Processing row ${index + 1}:`, data); // Debug: Each row being processed
            // Validate and transform CSV data to match Product interface
            const product: Product = {
              itemName: data.itemName || 'Unknown Item',
              stockQuantity: parseInt(data.StockQuantity, 10) || 0, // Match CSV field name
              price: parseFloat(data.Price) || 0, // Match CSV field name
              averageRating: data.AverageRating || 'N/A',
              material: data.Material || 'N/A',
              itemID: parseInt(data.itemID, 10) || index + 1, // Fallback to index if no ID
              subCategoryID: data.SubCategoryID || 'N/A',
              color: data.Color || 'N/A',
              saleStartDate: parseDate(data.SaleStartDate), // Use safe date parsing
              updatedAt: parseDate(data.UpdatedAt),
              dimension: data.Dimensions || 'N/A', // Match CSV field name
              status: data.Status || 'Active',
              reviewCount: data.ReviewCount || 'N/A',
              saleEndDate: parseDate(data.SaleEndDate),
              createdAt: parseDate(data.CreatedAt),
              discount: parseFloat(data.Discount) || 0, // Match CSV field name
              categoryID: data.CategoryID || 'N/A',
              isOnSale: data.IsOnSale === 'true' || data.IsOnSale === true,
              itemSize: data.ItemSize || 'N/A', // Match CSV field name
              description: data.Description || 'No description', // Match CSV field name
              SKU: data.SKU || `SKU-${index + 1}`,
              imgURL1: data.ImageURL1 || undefined,
              imgURL2:
                typeof data.ImageURL2 === 'string'
                  ? parseArrayString(data.ImageURL2)[0] || undefined
                  : undefined, // Handle array string
              imgURL3: data.ImageURL3 || undefined,
            };

            console.log(`Transformed product for row ${index + 1}:`, product); // Debug: Transformed product
            if (Object.values(product).some((value) => value === undefined)) {
              console.warn(
                `Row ${index + 1} contains undefined values, skipping:`,
                product
              );
              return; // Skip this product if it contains undefined
            }

            const docRef = doc(db, collectionName, `product_${product.itemID}`); // Use itemID or generate ID
            batch.set(docRef, product);
            operationCount++;

            // Commit batch if limit is reached
            // if (operationCount === maxBatchSize) {
            //   console.log(`Preparing to commit batch ${Math.floor(index / maxBatchSize) + 1} with ${operationCount} operations`);
            //   await batch.commit();
            //   console.log(`Committed batch ${Math.floor(index / maxBatchSize) + 1} successfully`);
            //   batch.clear();
            //   operationCount = 0;
            // }
          });

          // Commit any remaining operations
          if (operationCount > 0) {
            console.log(
              `Preparing to commit final batch with ${operationCount} operations`
            );
            await batch.commit();
            console.log('Committed final batch successfully');
          }

          resolve();
          console.log('CSV data imported to Firestore successfully!');
        } catch (error) {
          console.error('Error during batch processing:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error(
          'Error parsing CSV file:',
          error,
          'File content:',
          csvFile
        ); // Debug: Include file context
        reject(error);
      },
    });
  });
}

// Export for use in components or other modules
// export { importCSVToFirestore };
