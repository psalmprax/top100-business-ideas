require 'faraday'
require 'json'
require 'time'

module AgentOpsSdk
  # Agent Ops Sentinel SDK - Ruby Client
  # AI Agent Monitoring & Management Platform
  class Client
    attr_reader :agent_id

    def initialize(api_key, endpoint: 'https://api.agentops.dev')
      @api_key = api_key
      @endpoint = endpoint
      @agent_id = nil

      @connection = Faraday.new(url: @endpoint) do |f|
        f.headers['Authorization'] = "Bearer #{@api_key}"
        f.headers['Content-Type'] = 'application/json'
        f.adapter Faraday.default_adapter
      end
    end

    # Register an agent with Agent Ops
    def register_agent(name, agent_type)
      response = post('/agents', {
        name: name,
        type: agent_type
      })

      @agent_id = response['id']
      response
    end

    # Send a heartbeat to indicate the agent is alive
    def heartbeat
      raise 'Agent not registered' unless @agent_id

      post("/agents/#{@agent_id}/heartbeat", {
        timestamp: Time.now.utc.iso8601
      })
    end

    # Report a task completion
    def report_task_complete(task_id, metadata: {})
      raise 'Agent not registered' unless @agent_id

      post("/agents/#{@agent_id}/tasks", {
        taskId: task_id,
        status: 'completed',
        metadata: metadata
      })
    end

    # Report a task failure
    def report_task_failed(task_id, error)
      raise 'Agent not registered' unless @agent_id

      post("/agents/#{@agent_id}/tasks", {
        taskId: task_id,
        status: 'failed',
        error: error
      })
    end

    # Log an event
    def log(level, message, metadata: {})
      raise 'Agent not registered' unless @agent_id

      post("/agents/#{@agent_id}/logs", {
        level: level,
        message: message,
        metadata: metadata
      })
    end

    # Get all agents
    def get_agents
      get('/agents')
    end

    # Get a specific agent
    def get_agent(agent_id)
      get("/agents/#{agent_id}")
    end

    # Get dashboard metrics
    def get_dashboard_metrics
      get('/dashboard/metrics')
    end

    # Get alerts
    def get_alerts(agent_id: nil)
      path = agent_id ? "/alerts?agentId=#{agent_id}" : '/alerts'
      get(path)
    end

    # Acknowledge an alert
    def acknowledge_alert(alert_id)
      patch("/alerts/#{alert_id}", { acknowledged: true })
    end

    private

    def get(path)
      response = @connection.get(path)
      JSON.parse(response.body)
    end

    def post(path, data)
      response = @connection.post(path) do |req|
        req.body = data.to_json
      end
      JSON.parse(response.body)
    end

    def patch(path, data)
      response = @connection.patch(path) do |req|
        req.body = data.to_json
      end
      JSON.parse(response.body)
    end
  end
end
