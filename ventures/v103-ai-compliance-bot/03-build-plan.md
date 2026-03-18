# Build Plan: ComplianceBot Infrastructure

## 🛠️ Tech Stack
- **Core Engine**: Python with AST parsing for code analysis.
- **LLM Integration**: GPT-4 for semantic vulnerability detection.
- **Database**: PostgreSQL for vulnerability rules and scan history.
- **CLI**: Rust for fast local scanning.

## 📋 MVP Core Requirements
1.  **Static Analyzer**: Parse Python/JavaScript for AI-specific patterns.
2.  **Rule Engine**: Configurable vulnerability rules (YAML-based).
3.  **CLI Output**: Terminal-friendly vulnerability reports.
4.  **Basic Dashboard**: Web UI for viewing scan results.

## 📦 Key Deliverables
- [ ] ComplianceBot CLI (pip install).
- [ ] GitHub Action for PR scanning.
- [ ] Web Dashboard.
- [ ] Slack integration.
