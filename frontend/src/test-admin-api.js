// Simple test script to verify admin API endpoints
const testAdminAPI = async () => {
  try {
    console.log("Testing admin API endpoints...");
    
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      console.log("No access token found. Please login first.");
      return;
    }
    
    // Test statistics endpoint
    console.log("Testing /api/admin/statistics/ endpoint...");
    const statsResponse = await fetch("http://localhost:8000/api/admin/statistics/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log("Statistics data:", statsData);
    } else {
      console.log("Failed to fetch statistics:", statsResponse.status, statsResponse.statusText);
    }
    
    // Test users endpoint
    console.log("Testing /api/admin/users/ endpoint...");
    const usersResponse = await fetch("http://localhost:8000/api/admin/users/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("Users data:", usersData);
    } else {
      console.log("Failed to fetch users:", usersResponse.status, usersResponse.statusText);
    }
    
  } catch (error) {
    console.error("Error testing admin API:", error);
  }
};

// Run the test
testAdminAPI();