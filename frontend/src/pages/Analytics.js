import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  BarChart3, FileText, AlertTriangle, CheckCircle, 
  TrendingUp, Shield, Target, Activity 
} from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getAnalyticsStats();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-gray-900' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${color} mr-3`} />
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const SeverityCard = ({ severity, count, color }) => (
    <div className={`p-4 rounded-lg border-2 ${color}`}>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{count}</p>
        <p className="text-sm font-medium text-gray-600 capitalize">{severity} Risk</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Upload and analyze some documents to see insights here.</p>
      </div>
    );
  }

  const analysisRate = stats.totalDocuments > 0 
    ? Math.round((stats.analyzedDocuments / stats.totalDocuments) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Overview of your document analysis activity and risk assessments
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          title="Total Documents"
          value={stats.totalDocuments}
          subtitle="All uploaded files"
          color="text-blue-600"
        />
        
        <StatCard
          icon={CheckCircle}
          title="Analyzed Documents"
          value={stats.analyzedDocuments}
          subtitle={`${analysisRate}% completion rate`}
          color="text-green-600"
        />
        
        <StatCard
          icon={Activity}
          title="Pending Analysis"
          value={stats.pendingAnalysis}
          subtitle="Awaiting processing"
          color="text-yellow-600"
        />
        
        <StatCard
          icon={TrendingUp}
          title="Average Risk Score"
          value={Math.round(stats.riskStatistics.avgRiskScore || 0)}
          subtitle="Out of 100"
          color="text-red-600"
        />
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Score Range</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Minimum Risk Score</span>
              <span className="text-lg font-bold text-green-600">
                {Math.round(stats.riskStatistics.minRiskScore || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Average Risk Score</span>
              <span className="text-lg font-bold text-yellow-600">
                {Math.round(stats.riskStatistics.avgRiskScore || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Maximum Risk Score</span>
              <span className="text-lg font-bold text-red-600">
                {Math.round(stats.riskStatistics.maxRiskScore || 0)}
              </span>
            </div>
          </div>
          
          {/* Risk Score Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full"
                style={{ width: `${Math.min(stats.riskStatistics.avgRiskScore || 0, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>

        {/* Suspicious Clauses by Severity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Suspicious Clauses by Severity</h2>
          <div className="grid grid-cols-3 gap-4">
            <SeverityCard
              severity="high"
              count={stats.suspiciousClausesBySeverity.high || 0}
              color="border-red-200 bg-red-50"
            />
            <SeverityCard
              severity="medium"
              count={stats.suspiciousClausesBySeverity.medium || 0}
              color="border-yellow-200 bg-yellow-50"
            />
            <SeverityCard
              severity="low"
              count={stats.suspiciousClausesBySeverity.low || 0}
              color="border-blue-200 bg-blue-50"
            />
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Suspicious Clauses Found:</span>
              <span className="font-bold text-gray-900">
                {(stats.suspiciousClausesBySeverity.high || 0) + 
                 (stats.suspiciousClausesBySeverity.medium || 0) + 
                 (stats.suspiciousClausesBySeverity.low || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Document Security</h3>
                <p className="text-gray-600 text-sm">
                  {stats.analyzedDocuments > 0 
                    ? `${stats.analyzedDocuments} documents have been thoroughly analyzed for potential risks.`
                    : 'No documents analyzed yet. Upload documents to get security insights.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Target className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                <p className="text-gray-600 text-sm">
                  {stats.riskStatistics.avgRiskScore > 0
                    ? `Average risk level is ${Math.round(stats.riskStatistics.avgRiskScore)}%, ${
                        stats.riskStatistics.avgRiskScore >= 70 ? 'indicating high attention needed' :
                        stats.riskStatistics.avgRiskScore >= 40 ? 'showing moderate risk levels' :
                        'suggesting relatively low risks'
                      }.`
                    : 'Complete document analysis to see risk assessment trends.'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Suspicious Clauses</h3>
                <p className="text-gray-600 text-sm">
                  {(stats.suspiciousClausesBySeverity.high || 0) > 0
                    ? `${stats.suspiciousClausesBySeverity.high} high-risk clauses require immediate attention.`
                    : 'No high-risk clauses detected in analyzed documents.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Analysis Progress</h3>
                <p className="text-gray-600 text-sm">
                  {stats.pendingAnalysis > 0
                    ? `${stats.pendingAnalysis} documents are pending analysis. Process them for complete insights.`
                    : 'All uploaded documents have been analyzed successfully.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {(stats.pendingAnalysis > 0 || (stats.suspiciousClausesBySeverity.high || 0) > 0) && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">Recommended Actions</h2>
          <ul className="space-y-2">
            {stats.pendingAnalysis > 0 && (
              <li className="flex items-center text-yellow-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Analyze {stats.pendingAnalysis} pending document{stats.pendingAnalysis > 1 ? 's' : ''} 
                to get complete risk assessment
              </li>
            )}
            {(stats.suspiciousClausesBySeverity.high || 0) > 0 && (
              <li className="flex items-center text-yellow-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review {stats.suspiciousClausesBySeverity.high} high-risk clause{stats.suspiciousClausesBySeverity.high > 1 ? 's' : ''} 
                that require immediate attention
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analytics;