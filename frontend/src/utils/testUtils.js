import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Helper pour render avec Router
export const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Cleanup après chaque test
export const cleanupTestData = async () => {
  // Cleanup function for frontend tests
  // In a real implementation, this would clean up test data
  console.log('Cleaning up test data');
};