import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const StorageTest: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStorage = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      addResult('Starting storage tests...');
      
      // Test 1: Check if user is authenticated
      addResult(`User authenticated: ${!!user}`);
      addResult(`User is admin: ${isAdmin}`);
      addResult(`User email: ${user?.email || 'Not logged in'}`);
      
      // Test 2: Try to list buckets
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
          addResult(`❌ Error listing buckets: ${bucketsError.message}`);
        } else {
          addResult(`✅ Buckets found: ${buckets?.map(b => b.name).join(', ')}`);
          const storeFilesBucket = buckets?.find(b => b.id === 'store-files');
          addResult(`Store-files bucket exists: ${!!storeFilesBucket}`);
        }
      } catch (error) {
        addResult(`❌ Exception listing buckets: ${error}`);
      }
      
      // Test 3: Try to upload a test file (only if admin)
      if (isAdmin) {
        try {
          const testFile = new Blob(['Hello World'], { type: 'text/plain' });
          const fileName = `test-${Date.now()}.txt`;
          
          const { error: uploadError } = await supabase.storage
            .from('store-files')
            .upload(`test/${fileName}`, testFile);
            
          if (uploadError) {
            addResult(`❌ Upload test failed: ${uploadError.message}`);
          } else {
            addResult(`✅ Upload test successful: ${fileName}`);
            
            // Try to get public URL
            const { data } = supabase.storage
              .from('store-files')
              .getPublicUrl(`test/${fileName}`);
            addResult(`✅ Public URL: ${data.publicUrl}`);
            
            // Clean up - delete test file
            const { error: deleteError } = await supabase.storage
              .from('store-files')
              .remove([`test/${fileName}`]);
            if (!deleteError) {
              addResult(`✅ Test file cleaned up`);
            }
          }
        } catch (error) {
          addResult(`❌ Upload exception: ${error}`);
        }
      } else {
        addResult('⚠️ Skipping upload test - not admin');
      }
      
      addResult('Storage tests completed!');
    } catch (error) {
      addResult(`❌ General error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Storage test is only available for admins.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Storage Functionality Test</h3>
      
      <button
        onClick={testStorage}
        disabled={testing}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Storage Tests'}
      </button>
      
      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <div className="bg-gray-100 p-3 rounded-lg max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageTest;
