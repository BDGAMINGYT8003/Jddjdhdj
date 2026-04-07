/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export default function App() {
  const [image, setImage] = useState<{ url: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cosplay');
      const data = await response.json();
      if (data.success) {
        setImage({ url: data.message, id: data.id });
      } else {
        setError(data.message || 'Failed to fetch image');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cosplay Image API</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded">
            {error}
          </div>
        ) : image ? (
          <div className="flex flex-col items-center">
            <img 
              src={image.url} 
              alt="Cosplay" 
              className="w-full h-auto rounded shadow-sm mb-4 object-cover max-h-96"
              referrerPolicy="no-referrer"
            />
            <div className="text-sm text-gray-500 mb-4">
              ID: <span className="font-mono">{image.id}</span>
            </div>
            <button 
              onClick={fetchRandomImage}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Fetch Another Random Image
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 text-sm text-gray-500 max-w-md">
        <h2 className="font-semibold mb-2">API Endpoints:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>GET /api/cosplay</code> - Fetch a random image</li>
          <li><code>GET /api/cosplay/:id</code> - Fetch a specific image by ID</li>
        </ul>
      </div>
    </div>
  );
}
