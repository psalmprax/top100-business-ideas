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

        stage('Install Dependencies') {
            parallel {
               stage('Frontend') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend (Python)') {
                    steps {
                        dir('server/python') {
                            sh 'pip install -r requirements.txt'
                        }
                    }
                }
                stage('Backend (Go)') {
                    steps {
                        dir('server/go') {
                            sh 'go mod download'
                        }
                    }
                }
            }
        }

        stage('E2E Infrastructure Setup') {
            steps {
                // Ensure browsers are installed (if not using a pre-configured image)
                sh 'npx playwright install chromium'
            }
        }

        stage('Run Sentinel Functional Tests') {
            steps {
                script {
                    try {
                        // Run specifically the Sentinel functional suite
                        sh 'npx playwright test client/src/test/sentinel-functional.spec.ts --project=chromium --reporter=list'
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
                dir('client') {
                    sh 'npm run build'
                }
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
