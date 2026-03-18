Gem::Specification.new do |spec|
  spec.name          = "agentops_sdk"
  spec.version       = "1.0.0"
  spec.summary       = "Agent Ops Sentinel SDK - AI Agent Monitoring & Management"
  spec.description   = "Ruby SDK for Agent Ops Sentinel - AI Agent Monitoring & Management Platform"
  spec.authors       = ["Agent Ops Team"]
  spec.email         = "dev@agentops.dev"
  spec.license       = "MIT"
  spec.files         = Dir["lib/**/*.rb"]
  spec.require_paths = ["lib"]
  spec.required_ruby_version = ">= 2.7"

  spec.add_runtime_dependency "faraday", "~> 2.0"
  spec.add_runtime_dependency "json", "~> 2.0"
end
