import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { adminService } from "./services/adminService";
import { userAPI } from "./services/api";

function TestAdminDashboard() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({
    profile: null,
    statistics: null,
    users: null,
    error: null
  });
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults({
      profile: null,
      statistics: null,
      users: null,
      error: null
    });

    try {
      // Test 1: User Profile
      console.log("Test 1: Fetching user profile...");
      const profileResponse = await userAPI.getProfile();
      setTestResults(prev => ({ ...prev, profile: profileResponse.data }));
      console.log("Profile test passed:", profileResponse.data);

      // Test 2: Admin Statistics
      console.log("Test 2: Fetching admin statistics...");
      const statsResponse = await adminService.getStatistics();
      setTestResults(prev => ({ ...prev, statistics: statsResponse }));
      console.log("Statistics test passed:", statsResponse);

      // Test 3: Admin Users
      console.log("Test 3: Fetching admin users...");
      const usersResponse = await adminService.getUsers();
      setTestResults(prev => ({ ...prev, users: usersResponse }));
      console.log("Users test passed:", usersResponse.length, "users");

    } catch (error) {
      console.error("Test failed:", error);
      setTestResults(prev => ({ ...prev, error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Admin Dashboard</h1>
      <p className="mb-4">User role: {user?.role}</p>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? "Testing..." : "Run Tests"}
      </button>

      {testResults.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {testResults.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">User Profile</h2>
          {testResults.profile ? (
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(testResults.profile, null, 2)}
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Statistics</h2>
          {testResults.statistics ? (
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(testResults.statistics, null, 2)}
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Users</h2>
          {testResults.users ? (
            <p>{testResults.users.length} users loaded</p>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestAdminDashboard;