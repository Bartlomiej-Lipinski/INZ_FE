"use client";

// import SignInForm from "../components/pages/Sign-in-form";

// export default function Page() {
//   return <SignInForm />;
// }


import SignInForm from "../components/pages/Sign-in-form";
import { useUser } from "../hooks/use-user";
import { useState } from "react";

export default function Page() {
  const { getUser, isLoading, error } = useUser();
  const [testResult, setTestResult] = useState<any>(null);
  const [userId, setUserId] = useState('');

  const testUserEndpoint = async () => {
    if (!userId.trim()) {
      alert('Wprowadź ID użytkownika');
      return;
    }
    
    const result = await getUser(userId);
    setTestResult(result);
  };

  return (
    <div className="p-4">
      <SignInForm />
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Test endpointu użytkownika</h2>
        
        <div className="mb-4">
          <label className="block mb-2">ID użytkownika:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded w-full max-w-md"
            placeholder="Wprowadź ID użytkownika"
          />
        </div>
        
        <button
          onClick={testUserEndpoint}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Ładowanie...' : 'Testuj endpoint'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Błąd: {error}
          </div>
        )}
        
        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 border rounded">
            <h3 className="font-bold mb-2">Wynik testu:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}


