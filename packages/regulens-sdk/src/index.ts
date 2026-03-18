/**
 * Regulens AI Compliance Hub SDK
 * EU AI Act Compliance Tools
 * 
 * @package @regulens/sdk
 * @version 1.0.0
 */

import axios, { AxiosInstance } from 'axios';

// Types
export interface ComplianceConfig {
    apiKey: string;
    endpoint?: string;
}

export interface AIArticle {
    id: string;
    number: number;
    title: string;
    description: string;
    requirements: string[];
    riskLevel?: 'unacceptable' | 'high' | 'limited' | 'minimal';
}

export interface ComplianceScan {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: Date;
    completedAt?: Date;
    results: ComplianceResult[];
}

export interface ComplianceResult {
    articleId: string;
    articleNumber: number;
    status: 'compliant' | 'non_compliant' | 'needs_review';
    score: number;
    findings: Finding[];
    recommendations: string[];
}

export interface Finding {
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location?: string;
    remediation?: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    version: string;
    riskCategory: 'unacceptable' | 'high' | 'limited' | 'minimal';
    lastTrained: Date;
    trainingData?: TrainingDataInfo;
}

export interface TrainingDataInfo {
    size: number;
    sources: string[];
    dateRange: { start: Date; end: Date };
    biasAssessment?: string;
}

export interface IntegrationConfig {
    type: 'cicd' | 'training_data' | 'model_registry' | 'monitoring';
    provider: string;
    config: Record<string, string>;
}

export interface ComplianceReport {
    id: string;
    generatedAt: Date;
    summary: {
        totalArticles: number;
        compliant: number;
        nonCompliant: number;
        needsReview: number;
        overallScore: number;
    };
    articles: ComplianceResult[];
}

/**
 * RegulensClient
 * Main SDK client for interacting with AI Compliance Hub
 */
export class RegulensClient {
    private client: AxiosInstance;

    constructor(config: ComplianceConfig) {
        const baseURL = config.endpoint || 'https://api.regulens.dev';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('[Regulens] API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get all EU AI Act articles
     */
    async getArticles(): Promise<AIArticle[]> {
        const response = await this.client.get('/compliance/articles');
        return response.data;
    }

    /**
     * Get specific article by number
     */
    async getArticle(articleNumber: number): Promise<AIArticle> {
        const response = await this.client.get(`/compliance/articles/${articleNumber}`);
        return response.data;
    }

    /**
     * Run compliance scan on a model or system
     */
    async runScan(modelId: string, options?: { articles?: number[] }): Promise<ComplianceScan> {
        const response = await this.client.post('/compliance/scans', {
            modelId,
            articles: options?.articles,
        });
        return response.data;
    }

    /**
     * Get scan results
     */
    async getScanResults(scanId: string): Promise<ComplianceScan> {
        const response = await this.client.get(`/compliance/scans/${scanId}`);
        return response.data;
    }

    /**
     * List all scans
     */
    async listScans(): Promise<ComplianceScan[]> {
        const response = await this.client.get('/compliance/scans');
        return response.data;
    }

    /**
     * Register a model for compliance tracking
     */
    async registerModel(model: Omit<ModelInfo, 'id' | 'lastTrained'>): Promise<ModelInfo> {
        const response = await this.client.post('/models', model);
        return response.data;
    }

    /**
     * Get model information
     */
    async getModel(modelId: string): Promise<ModelInfo> {
        const response = await this.client.get(`/models/${modelId}`);
        return response.data;
    }

    /**
     * List all registered models
     */
    async listModels(): Promise<ModelInfo[]> {
        const response = await this.client.get('/models');
        return response.data;
    }

    /**
     * Update model training data info
     */
    async updateTrainingData(modelId: string, trainingData: TrainingDataInfo): Promise<void> {
        await this.client.patch(`/models/${modelId}/training-data`, trainingData);
    }

    /**
     * Configure integration
     */
    async configureIntegration(config: IntegrationConfig): Promise<void> {
        await this.client.post('/integrations', config);
    }

    /**
     * List integrations
     */
    async listIntegrations(): Promise<IntegrationConfig[]> {
        const response = await this.client.get('/integrations');
        return response.data;
    }

    /**
     * Test integration
     */
    async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
        const response = await this.client.post(`/integrations/${integrationId}/test`);
        return response.data;
    }

    /**
     * Generate compliance report
     */
    async generateReport(modelId: string): Promise<ComplianceReport> {
        const response = await this.client.post(`/reports/generate`, { modelId });
        return response.data;
    }

    /**
     * Get compliance summary dashboard
     */
    async getComplianceSummary(): Promise<{
        totalModels: number;
        compliantModels: number;
        highRiskModels: number;
        overallScore: number;
    }> {
        const response = await this.client.get('/compliance/summary');
        return response.data;
    }

    /**
     * Get risk assessment for a model
     */
    async getRiskAssessment(modelId: string): Promise<{
        category: 'unacceptable' | 'high' | 'limited' | 'minimal';
        factors: string[];
        mitigationSuggestions: string[];
    }> {
        const response = await this.client.get(`/models/${modelId}/risk-assessment`);
        return response.data;
    }
}

// Convenience function to create client
export function createRegulensClient(config: ComplianceConfig): RegulensClient {
    return new RegulensClient(config);
}

export default RegulensClient;
