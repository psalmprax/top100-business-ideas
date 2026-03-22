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

                        // Start all services and Playwright tests in a single container using the script
                        // Run synchronously and capture output
                        sh '''
                            docker run --rm --name e2e-test-runner \
                                -v ${HOST_WORKSPACE}:/app \
                                -w /app \
                                -p 7000:7000 -p 7002:7002 \
                                mcr.microsoft.com/playwright:v1.58.2-jammy bash /app/e2e-test.sh
                        '''
                    } finally {
                        // Container is automatically removed when it exits since we used --rm
                    }
                }
            }
        }

        stage('Build Artifacts') {
            when {
                branch 'master'
            }
            steps {
                sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app/client node:20-alpine npm run build'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo "Redeploying Sentinel Platform to production..."
                    // Use the host's docker-compose to redeploy. 
                    // Since we mount docker.sock, this affects the host system.
                    sh 'docker compose -f docker-compose.yml down --remove-orphans'
                    sh 'docker compose -f docker-compose.yml up -d --build'
                    echo "Deployment successful!"
                }
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
