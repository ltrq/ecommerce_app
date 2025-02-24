// hooks/useFetchAllProducts.ts
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  itemName: string;
  Price: number;
  Description: string;
  ItemSize: string;
  Color: string;
  image: string;
}

const API_URL = process.env.BASEROW_API_URL;
const API_TOKEN = process.env.BASEROW_API_TOKEN;

export function useFetchAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  // const [products, setProducts] = useState<Product[]>([
  //   {
  //     id: '123',
  //     itemName: 'slim',
  //     Price: 19.99,
  //     Description: 'A comfortable and stylish cotton T-shirt.',
  //     ItemSize: 'M',
  //     Color: 'Red',
  //     image: 'https://example.com/path-to-image.jpg',
  //   },
  // ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!API_URL || !API_TOKEN) {
        setError('API config missing');
        return;
      }

      console.log('API URL:', API_URL);
      console.log('API Token:', API_TOKEN);

      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            Authorization: `Token ${API_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch: Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched Data:', data); // Log the data to verify structure

        setProducts(data.results || []); // Make sure you handle the case where `results` might not exist
      } catch (error) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this will run only once after the initial render

  return { products, loading, error };
}
