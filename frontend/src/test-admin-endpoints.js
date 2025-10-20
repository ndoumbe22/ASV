// Test script to debug admin API endpoints
const testAdminEndpoints = async () => {
  try {
    console.log("Testing admin API endpoints...");
    
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      console.log("No access token found. Please login first.");
      return;
    }
    
    console.log("Using token:", token.substring(0, 20) + "...");
    
    // Test user profile endpoint
    console.log("Testing /api/users/profile/ endpoint...");
    const profileResponse = await fetch("http://localhost:8000/api/users/profile/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Profile response status:", profileResponse.status);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("Profile data:", profileData);
    } else {
      const errorText = await profileResponse.text();
      console.log("Profile error:", profileResponse.status, errorText);
    }
    
    // Test admin statistics endpoint
    console.log("Testing /api/admin/statistics/ endpoint...");
    const statsResponse = await fetch("http://localhost:8000/api/admin/statistics/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Statistics response status:", statsResponse.status);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log("Statistics data:", statsData);
    } else {
      const errorText = await statsResponse.text();
      console.log("Statistics error:", statsResponse.status, errorText);
    }
    
    // Test admin users endpoint
    console.log("Testing /api/admin/users/ endpoint...");
    const usersResponse = await fetch("http://localhost:8000/api/admin/users/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Users response status:", usersResponse.status);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("Users data (first 3):", usersData.slice(0, 3));
    } else {
      const errorText = await usersResponse.text();
      console.log("Users error:", usersResponse.status, errorText);
    }
    
  } catch (error) {
    console.error("Error testing admin API:", error);
  }
};

// Run the test
testAdminEndpoints();