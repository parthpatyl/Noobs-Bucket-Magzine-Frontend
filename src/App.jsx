import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VirtualMagazine from './components/VirtualMagazine';
import ArticleDetail from './components/ArticleDetail'; // Ensure this path is correct

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route to VirtualMagazine */}
          <Route path="/" element={<VirtualMagazine />} />

          {/* Route to ArticleDetail */}
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
