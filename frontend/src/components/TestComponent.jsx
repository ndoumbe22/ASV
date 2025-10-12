import React from "react";

function TestComponent() {
  return (
    <div className="p-4 bg-green-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-2">Test Component</h2>
      <p className="text-green-600">If you can see this styled text, Tailwind CSS is working correctly!</p>
      <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
}

export default TestComponent;