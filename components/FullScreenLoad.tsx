import React from 'react';

interface FullScreenLoaderProps {
  message: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message }) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex flex-col items-center justify-center">
    <div className="spinner mb-4 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <div className="text-xl font-semibold text-gray-700">{message}</div>
  </div>
);

export default FullScreenLoader;

// CSS to be added to your global styles or as a styled component
const styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
`;