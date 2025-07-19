import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FileText, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft, 
  Shield, Target, BookOpen, TrendingUp 
} from 'lucide-react';
import api from '../services/api';

const DocumentView = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await api.getDocument(id);
      setDocument(response.data);
    } catch (error) {
      console.error('Fetch document error:', error);
      toast.error('Failed to fetch document');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const response = await api.analyzeDocument(id);
      setDocument(prev => ({
        ...prev,
        analysis: response.data.analysis,
        isAnalyzed: true
      }));
      toast.success('Document analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze document');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReAnalyze = async () => {
    try {
      setAnalyzing(true);
      const response = await api.reAnalyzeDocument(id);
      setDocument(prev => ({
        ...prev,
        analysis: response.data.analysis,
        isAnalyzed: true
      }));
      toast.success('Document re-analyzed successfully!');
    } catch (error) {
      console.error('Re-analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to re-analyze document');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
        <Link to="/documents" className="text-brand-600 hover:text-brand-700">
          ← Back to documents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to="/documents"
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{document.originalName}</h1>
            <p className="text-gray-600 mt-1">
              Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {document.isAnalyzed ? (
            <button
              onClick={handleReAnalyze}
              disabled={analyzing}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {analyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              {analyzing ? 'Analyzing...' : 'Analyze Document'}
            </button>
          )}
        </div>
      </div>

      {!document.isAnalyzed ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Document Not Analyzed Yet
          </h3>
          <p className="text-yellow-700 mb-4">
            Click the "Analyze Document" button to get AI-powered insights and suspicious clause detection.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className={`h-8 w-8 ${getRiskScoreColor(document.analysis.riskScore)} mr-3`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(document.analysis.riskScore)}`}>
                    {document.analysis.riskScore}/100
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspicious Clauses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {document.analysis.suspiciousClauses?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Key Terms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {document.analysis.keyTerms?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {document.analysis.recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Document Summary</h2>
            <p className="text-gray-700 leading-relaxed">
              {document.analysis.summary}
            </p>
          </div>

          {/* Suspicious Clauses */}
          {document.analysis.suspiciousClauses && document.analysis.suspiciousClauses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Suspicious Clauses</h2>
              <div className="space-y-4">
                {document.analysis.suspiciousClauses.map((clause, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Clause {index + 1}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(clause.severity)}`}>
                        {clause.severity.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-gray-800 italic">"{clause.clause}"</p>
                    </div>
                    <p className="text-gray-700 mb-2">
                      <strong>Why this is concerning:</strong> {clause.reason}
                    </p>
                    {clause.location && (
                      <p className="text-sm text-gray-600">
                        <strong>Location:</strong> {clause.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Terms */}
          {document.analysis.keyTerms && document.analysis.keyTerms.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Legal Terms</h2>
              <div className="flex flex-wrap gap-2">
                {document.analysis.keyTerms.map((term, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {document.analysis.recommendations && document.analysis.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
              <ul className="space-y-3">
                {document.analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{recommendation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentView;