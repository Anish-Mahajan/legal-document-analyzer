    const express = require('express');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const Document = require('../models/Document');

    const router = express.Router();

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Helper function to analyze document with Google AI
    async function analyzeWithAI(content) {
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

        const prompt = `
        You are a legal expert analyzing a document. Please provide a comprehensive analysis in the following JSON format:

        {
        "summary": "Brief summary of the document in simple, non-legal language",
        "suspiciousClauses": [
            {
            "clause": "exact text of suspicious clause",
            "reason": "why this clause is suspicious or potentially harmful",
            "severity": "low|medium|high",
            "location": "approximate location in document"
            }
        ],
        "keyTerms": ["list", "of", "important", "legal", "terms", "found"],
        "recommendations": ["actionable recommendations for the reader"],
        "riskScore": 0-100
        }

        Focus on identifying:
        1. Unfair terms or clauses
        2. Hidden fees or penalties
        3. Ambiguous language that could be exploited
        4. Unusual liability assignments
        5. Restrictive cancellation policies
        6. Automatic renewal clauses
        7. Indemnification clauses
        8. Limitation of liability clauses
        9. Arbitration clauses that may limit legal rights
        10. Data privacy concerns

        Document content:
        ${content}

        Please respond with only the JSON object, no additional text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response and parse JSON
        const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error('AI Analysis error:', error);
        throw new Error('Failed to analyze document with AI');
    }
    }

    // Analyze document
    router.post('/:id/analyze', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
        return res.status(404).json({ error: 'Document not found' });
        }

        if (document.isAnalyzed) {
        return res.json({
            message: 'Document already analyzed',
            analysis: document.analysis
        });
        }

        // Analyze with AI
        const analysis = await analyzeWithAI(document.content);
        
        // Update document with analysis
        document.analysis = {
        ...analysis,
        analyzedAt: new Date()
        };
        document.isAnalyzed = true;

        await document.save();

        res.json({
        message: 'Document analyzed successfully',
        analysis: document.analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
        error: 'Failed to analyze document',
        details: error.message 
        });
    }
    });

    // Get analysis for a document
    router.get('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
        return res.status(404).json({ error: 'Document not found' });
        }

        if (!document.isAnalyzed) {
        return res.status(400).json({ error: 'Document has not been analyzed yet' });
        }

        res.json({
        documentId: document._id,
        filename: document.filename,
        analysis: document.analysis
        });

    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({ error: 'Failed to fetch analysis' });
    }
    });

    // Re-analyze document (force new analysis)
    router.post('/:id/re-analyze', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
        return res.status(404).json({ error: 'Document not found' });
        }

        // Force new analysis
        const analysis = await analyzeWithAI(document.content);
        
        document.analysis = {
        ...analysis,
        analyzedAt: new Date()
        };
        document.isAnalyzed = true;

        await document.save();

        res.json({
        message: 'Document re-analyzed successfully',
        analysis: document.analysis
        });

    } catch (error) {
        console.error('Re-analysis error:', error);
        res.status(500).json({ 
        error: 'Failed to re-analyze document',
        details: error.message 
        });
    }
    });

    // Get analytics/statistics
    router.get('/stats/overview', async (req, res) => {
    try {
        const totalDocuments = await Document.countDocuments();
        const analyzedDocuments = await Document.countDocuments({ isAnalyzed: true });
        
        const riskStats = await Document.aggregate([
        { $match: { isAnalyzed: true } },
        {
            $group: {
            _id: null,
            avgRiskScore: { $avg: '$analysis.riskScore' },
            maxRiskScore: { $max: '$analysis.riskScore' },
            minRiskScore: { $min: '$analysis.riskScore' }
            }
        }
        ]);

        const suspiciousClauseStats = await Document.aggregate([
        { $match: { isAnalyzed: true } },
        { $unwind: '$analysis.suspiciousClauses' },
        {
            $group: {
            _id: '$analysis.suspiciousClauses.severity',
            count: { $sum: 1 }
            }
        }
        ]);

        res.json({
        totalDocuments,
        analyzedDocuments,
        pendingAnalysis: totalDocuments - analyzedDocuments,
        riskStatistics: riskStats[0] || { avgRiskScore: 0, maxRiskScore: 0, minRiskScore: 0 },
        suspiciousClausesBySeverity: suspiciousClauseStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, { low: 0, medium: 0, high: 0 })
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    });

    module.exports = router;