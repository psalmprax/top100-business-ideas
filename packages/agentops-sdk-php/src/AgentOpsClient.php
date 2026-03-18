<?php

namespace AgentOps;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Agent Ops Sentinel SDK - PHP Client
 * AI Agent Monitoring & Management Platform
 */
class AgentOpsClient
{
    private string $apiKey;
    private string $endpoint;
    private Client $httpClient;
    private ?string $agentId = null;

    public function __construct(string $apiKey, ?string $endpoint = null)
    {
        $this->apiKey = $apiKey;
        $this->endpoint = $endpoint ?? 'https://api.agentops.dev';

        $this->httpClient = new Client([
            'base_uri' => $this->endpoint,
            'headers' => [
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Register an agent with Agent Ops
     */
    public function registerAgent(string $name, string $agentType): array
    {
        $response = $this->post('/agents', [
            'name' => $name,
            'type' => $agentType,
        ]);

        $this->agentId = $response['id'] ?? null;
        return $response;
    }

    /**
     * Send a heartbeat to indicate the agent is alive
     */
    public function heartbeat(): void
    {
        if (!$this->agentId) {
            throw new \RuntimeException('Agent not registered');
        }

        $this->post("/agents/{$this->agentId}/heartbeat", [
            'timestamp' => (new \DateTime('UTC'))->format(\DateTime::ATOM),
        ]);
    }

    /**
     * Report a task completion
     */
    public function reportTaskComplete(string $taskId, array $metadata = []): void
    {
        if (!$this->agentId) {
            throw new \RuntimeException('Agent not registered');
        }

        $this->post("/agents/{$this->agentId}/tasks", [
            'taskId' => $taskId,
            'status' => 'completed',
            'metadata' => $metadata,
        ]);
    }

    /**
     * Report a task failure
     */
    public function reportTaskFailed(string $taskId, string $error): void
    {
        if (!$this->agentId) {
            throw new \RuntimeException('Agent not registered');
        }

        $this->post("/agents/{$this->agentId}/tasks", [
            'taskId' => $taskId,
            'status' => 'failed',
            'error' => $error,
        ]);
    }

    /**
     * Log an event
     */
    public function log(string $level, string $message, array $metadata = []): void
    {
        if (!$this->agentId) {
            throw new \RuntimeException('Agent not registered');
        }

        $this->post("/agents/{$this->agentId}/logs", [
            'level' => $level,
            'message' => $message,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get all agents
     */
    public function getAgents(): array
    {
        return $this->get('/agents');
    }

    /**
     * Get a specific agent
     */
    public function getAgent(string $agentId): array
    {
        return $this->get("/agents/{$agentId}");
    }

    /**
     * Get dashboard metrics
     */
    public function getDashboardMetrics(): array
    {
        return $this->get('/dashboard/metrics');
    }

    /**
     * Get alerts
     */
    public function getAlerts(?string $agentId = null): array
    {
        $path = $agentId ? "/alerts?agentId={$agentId}" : '/alerts';
        return $this->get($path);
    }

    /**
     * Acknowledge an alert
     */
    public function acknowledgeAlert(string $alertId): void
    {
        $this->patch("/alerts/{$alertId}", ['acknowledged' => true]);
    }

    private function get(string $path): array
    {
        try {
            $response = $this->httpClient->get($path);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (GuzzleException $e) {
            throw new \RuntimeException("API request failed: " . $e->getMessage());
        }
    }

    private function post(string $path, array $data): array
    {
        try {
            $response = $this->httpClient->post($path, ['json' => $data]);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (GuzzleException $e) {
            throw new \RuntimeException("API request failed: " . $e->getMessage());
        }
    }

    private function patch(string $path, array $data): array
    {
        try {
            $response = $this->httpClient->patch($path, ['json' => $data]);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (GuzzleException $e) {
            throw new \RuntimeException("API request failed: " . $e->getMessage());
        }
    }
}
