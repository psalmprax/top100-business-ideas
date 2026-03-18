# Alpha Products SDK Packages

This directory contains the official SDK packages for the Alpha Products platform in multiple programming languages.

## Available SDKs (7 Languages)

| # | Language | Package Name | Location |
|---|----------|--------------|----------|
| 1 | JavaScript/TypeScript | `@agentops/sdk` | [`packages/agentops-sdk/`](packages/agentops-sdk/) |
| 2 | Python | `agentops` | [`packages/agentops-sdk-python/`](packages/agentops-sdk-python/) |
| 3 | Go | `agentops-go` | [`packages/agentops-sdk-go/`](packages/agentops-sdk-go/) |
| 4 | Java | `agentops-sdk` | [`packages/agentops-sdk-java/`](packages/agentops-sdk-java/) |
| 5 | C# / .NET | `AgentOpsSdk` | [`packages/agentops-sdk-csharp/`](packages/agentops-sdk-csharp/) |
| 6 | Ruby | `agentops_sdk` | [`packages/agentops-sdk-ruby/`](packages/agentops-sdk-ruby/) |
| 7 | PHP | `agentops/sdk` | [`packages/agentops-sdk-php/`](packages/agentops-sdk-php/) |

## Installation

### JavaScript/TypeScript
```bash
npm install @agentops/sdk @regulens/sdk @livenesslink/sdk
```

### Python
```bash
pip install agentops regulens livenesslink
```

### Go
```bash
go get github.com/agentops/sdk-go
```

### Java
```xml
<dependency>
    <groupId>dev.agentops</groupId>
    <artifactId>agentops-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### C# / .NET
```bash
dotnet add package AgentOpsSdk
```

### Ruby
```bash
gem install agentops_sdk
```

### PHP
```bash
composer require agentops/sdk
```

## Quick Start Examples

### JavaScript/TypeScript
```typescript
import { AgentOpsClient } from '@agentops/sdk';

const client = new AgentOpsClient({ apiKey: 'your-key' });
const agent = await client.registerAgent('my-agent', 'chatbot');
await client.reportTaskComplete('task-123', { duration: 1500 });
```

### Python
```python
from agentops import AgentOpsClient

client = AgentOpsClient(api_key='your-key')
agent = client.register_agent('my-agent', 'chatbot')
client.report_task_complete('task-123', metadata={'duration': 1500})
```

### Go
```go
import "github.com/agentops/sdk-go/agentops"

client := agentops.NewClient("your-key", "")
agent, _ := client.RegisterAgent("my-agent", "chatbot")
client.ReportTaskComplete("task-123", nil)
```

### Java
```java
import agentops.AgentOpsClient;

AgentOpsClient client = new AgentOpsClient("your-key");
Agent agent = client.registerAgent("my-agent", "chatbot");
client.reportTaskComplete("task-123", new HashMap<>());
```

### C#
```csharp
using AgentOpsSdk;

var client = new AgentOpsClient("your-key");
var agent = await client.RegisterAgentAsync("my-agent", "chatbot");
await client.ReportTaskCompleteAsync("task-123");
```

### Ruby
```ruby
require 'agentops_sdk'

client = AgentOpsSdk::Client.new('your-key')
agent = client.register_agent('my-agent', 'chatbot')
client.report_task_complete('task-123')
```

### PHP
```php
use AgentOps\AgentOpsClient;

$client = new AgentOpsClient('your-key');
$agent = $client->registerAgent('my-agent', 'chatbot');
$client->reportTaskComplete('task-123');
```

## License

MIT
