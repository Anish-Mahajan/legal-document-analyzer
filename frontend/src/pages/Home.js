import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.uploadDocument(formData);
      
      toast.success('Document uploaded successfully!');
      navigate(`/document/${response.data.documentId}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Legal Document Analyzer
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your legal documents to get AI-powered analysis and identify suspicious clauses
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
            ${isDragActive && !isDragReject ? 'border-brand-500 bg-brand-50' : ''}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
            )}
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Uploading...' : 'Drop your document here'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {isDragReject 
                ? 'File type not supported' 
                : 'or click to browse files'
              }
            </p>
            
            <p className="text-sm text-gray-500">
              Supports PDF, DOCX, and TXT files (up to 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <FileText className="h-8 w-8 text-brand-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Document Analysis</h3>
          <p className="text-gray-600">
            AI-powered analysis that breaks down complex legal language into simple terms
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Suspicious Clauses</h3>
          <p className="text-gray-600">
            Automatically identifies potentially harmful or unfair clauses in your documents
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <p className="text-gray-600">
            Get actionable recommendations to protect your interests
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Upload</h3>
            <p className="text-sm text-gray-600">
              Upload your legal document (PDF, DOCX, or TXT)
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Process</h3>
            <p className="text-sm text-gray-600">
              AI analyzes the document for suspicious clauses and terms
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-gray-600">
              Get a detailed analysis with risk assessment
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">Act</h3>
            <p className="text-sm text-gray-600">
              Follow recommendations to protect yourself
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;