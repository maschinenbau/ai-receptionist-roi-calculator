import React from 'react';

// A very simple component for testing Tailwind build
function App() {
  return (
    <div className="p-6 bg-blue-600 text-white rounded-lg shadow-lg m-10">
      {/* Using classes from the previous safelist test */}
      <h1 className="text-2xl font-semibold mb-4">Tailwind Test</h1>
      <p>If you see this with a blue background, white text, padding, rounded corners, and shadow, then the basic CSS build is working.</p>
    </div>
  );
}

export default App;