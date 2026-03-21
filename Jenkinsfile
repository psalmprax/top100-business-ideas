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
                        // Run specifically the Sentinel functional suite inside Playwright container
                        sh 'docker run --rm -v ${HOST_WORKSPACE}:/app -w /app mcr.microsoft.com/playwright:v1.58.2-jammy npx playwright test client/src/test/sentinel-functional.spec.ts --project=chromium --reporter=list'
                    } finally {
                        // Always collect results
                        junit 'client/src/test-results/**/*.xml'
                        archiveArtifacts artifacts: 'client/src/test-results/**', allowEmptyArchive: true
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
            cleanWs()
        }
        success {
            echo 'Sentinel Platform E2E Validation PASSED'
        }
        failure {
            echo 'Sentinel Platform E2E Validation FAILED - Check Playwright reports'
        }
    }
}
