import { useState } from 'react';

export function TestApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">GateMesh Test</h1>
        <p className="text-gray-600 mb-6">Deployment verification successful!</p>
        
        <div className="space-y-4">
          <p className="text-lg">Count: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Increment
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors ml-2"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>React: ✅</p>
          <p>Vite: ✅</p>
          <p>Tailwind CSS: ✅</p>
          <p>Vercel: ✅</p>
        </div>
      </div>
    </div>
  );
}