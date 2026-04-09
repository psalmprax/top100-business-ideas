# Performance Benchmark Script

## Overview

This directory contains a Python-based performance benchmark script for measuring latency across the Top100 Business Ideas API Gateway and Intelligence Hub.

## Usage

```bash
# Run with mock results (services not available)
python3 benchmark.py --mock --output benchmark-results.json

# Run against live services (requires services running)
python3 benchmark.py --api-gateway http://localhost:7001 --python-backend http://localhost:7002

# Custom iterations and concurrent levels
python3 benchmark.py --iterations 20 --concurrent "1,10,50,100" --threshold-ms 500
```

## Options

- `--api-gateway`: API Gateway URL (default: http://localhost:7001)
- `--python-backend`: Python Backend URL (default: http://localhost:7002)
- `--output`: Output file for results (default: benchmark-results.json)
- `--iterations`: Number of iterations per endpoint (default: 10)
- `--threshold-ms`: P95 latency threshold in ms (default: 500.0)
- `--concurrent`: Comma-separated concurrent levels (default: 1,10,50,100)
- `--mock`: Generate mock results without connecting to services

## Output

The benchmark outputs a JSON file containing:

- Endpoint latency summaries (min, max, avg, P50, P95, P99)
- Bottleneck identification (endpoints exceeding threshold)
- Overall pass/fail status

## Requirements

- Python 3.8+
- requests library

```bash
pip install requests
```
