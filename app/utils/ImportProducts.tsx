import { useState } from 'react';
import { importCSVToFirestore } from './firebase';

export function ImportProducts() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (file) {
      try {
        await importCSVToFirestore(file, 'products');
        alert('Products imported successfully!');
      } catch (error) {
        console.error('Import failed:', error);
        alert('Error importing products.');
      }
    }
  };

  return (
    <div>
      hello
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleImport} disabled={!file}>
        Import CSV
      </button>
    </div>
  );
}
