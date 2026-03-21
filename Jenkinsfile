pipeline {
    agent any

    environment {
        // Enforce demo mode for stable E2E testing in CI
        CI = 'true'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                script {
                    // Dynamically resolve the host path to handle DinD volume mounting
                    env.HOST_WORKSPACE = WORKSPACE.replace("/var/jenkins_home", "/home/ubuntu/jenkins_home")
                    echo "Host Workspace resolved to: ${env.HOST_WORKSPACE}"
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
               stage('Frontend') {
                    steps {
                        sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app/client node:20-alpine npm install --legacy-peer-deps'
                    }
                }
                stage('Backend (Python)') {
                    steps {
                        sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app/server/python python:3.11-slim pip install --no-cache-dir -r requirements.txt'
                    }
                }
                stage('Backend (Go)') {
                    steps {
                        sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app/server/go golang:1.24-alpine go mod download'
                    }
                }
            }
        }

        stage('E2E Infrastructure Setup') {
            steps {
                // Ensure browsers are installed in the playwright-ready container
                sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app mcr.microsoft.com/playwright:v1.58.2-jammy npx playwright install chromium'
            }
        }

        stage('Run Sentinel Functional Tests') {
            steps {
                script {
                    try {
                        // Clean up any stale containers
                        sh 'docker rm -f e2e-test-runner 2>/dev/null || true'

                        // Start all services and Playwright tests in a single container
                        // This avoids Docker-in-Docker networking issues
                        sh '''
                            docker run -d --rm --name e2e-test-runner \
                                -v ${HOST_WORKSPACE}:/app \
                                -w /app \
                                -p 7000:7000 -p 7002:7002 \
                                mcr.microsoft.com/playwright:v1.58.2-jammy bash -c "
                                    # Install curl for health checks
                                    apt-get update && apt-get install -y curl

                                    # Start backend in background
                                    cd /app/server/python
                                    nohup python -m uvicorn main:app --host 0.0.0.0 --port 7002 > /tmp/backend.log 2>&1 &
                                    BACKEND_PID=$!

                                    # Wait for backend to be ready
                                    echo 'Waiting for backend...'
                                    for i in $(seq 1 30); do
                                        if curl -s http://localhost:7002/health > /dev/null 2>&1; then
                                            echo 'Backend ready!'
                                            break
                                        fi
                                        sleep 2
                                    done

                                    # Start frontend in background
                                    cd /app/client
                                    nohup npm run dev -- --host 0.0.0.0 --port 7000 > /tmp/frontend.log 2>&1 &
                                    FRONTEND_PID=$!

                                    # Wait for frontend to be ready
                                    echo 'Waiting for frontend...'
                                    for i in $(seq 1 30); do
                                        if curl -s http://localhost:7000 > /dev/null 2>&1; then
                                            echo 'Frontend ready!'
                                            break
                                        fi
                                        sleep 2
                                    done

                                    # Run Playwright tests
                                    cd /app
                                    npx playwright test client/src/test/sentinel-functional.spec.ts --project=chromium --reporter=list

                                    # Cleanup
                                    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
                                "
                        '''

                        // Wait for tests to complete
                        echo "Waiting for E2E tests to complete..."
                        sleep 120
                    } finally {
                        // Cleanup
                        sh 'docker stop e2e-test-runner 2>/dev/null || true'
                    }
                }
            }
        }

        stage('Build Artifacts') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app/client node:20-alpine npm run build'
            }
        }
    }

    post {
        always {
            // Cleanup any remaining containers
            sh 'docker rm -f e2e-test-runner 2>/dev/null || true'
        }
        success {
            echo 'Sentinel Platform E2E Validation PASSED'
        }
        failure {
            echo 'Sentinel Platform E2E Validation FAILED - Check Playwright reports'
        }
    }
}
