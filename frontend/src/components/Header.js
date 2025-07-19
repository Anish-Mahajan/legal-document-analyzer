import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, FileText, BarChart3, Upload } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">
              Legal Analyzer
            </span>
          </Link>
          
          <nav className="flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            
            <Link
              to="/documents"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/documents') 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </Link>
            
            <Link
              to="/analytics"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analytics') 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;