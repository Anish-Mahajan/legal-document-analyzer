

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Calendar, AlertTriangle, CheckCircle, Trash2, Eye } from 'lucide-react';
import api from '../services/api';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);

  const fetchDocuments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getDocuments({ page, limit: 10 });
      setDocuments(response.data.documents);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.deleteDocument(id);
      toast.success('Document deleted successfully');
      fetchDocuments(currentPage);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getRiskBadge = (riskScore) => {
    if (riskScore >= 70) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">High Risk</span>;
    } else if (riskScore >= 40) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Medium Risk</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Low Risk</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
        <Link
          to="/"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Upload New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-6">Upload your first legal document to get started</p>
          <Link
            to="/"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Upload Document
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {document.originalName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {document.fileType.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(document.uploadedAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.isAnalyzed ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-800">Analyzed</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm text-yellow-800">Pending</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.isAnalyzed && document.analysis ? (
                          getRiskBadge(document.analysis.riskScore)
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/document/${document._id}`}
                            className="text-brand-600 hover:text-brand-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteDocument(document._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
