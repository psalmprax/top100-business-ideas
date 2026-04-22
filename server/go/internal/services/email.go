package services

import (
	"bytes"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"time"
)

// EmailService handles sending emails
type EmailService struct {
	SMTPHost  string
	SMTPPort  int
	Username  string
	Password  string
	FromEmail string
	FromName  string
}

// NewEmailService creates a new email service with environment variable support
func NewEmailService() *EmailService {
	portStr := getEnv("SMTP_PORT", "587")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 587
	}

	return &EmailService{
		SMTPHost:  getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:  port,
		Username:  os.Getenv("SMTP_USER"),
		Password:  os.Getenv("SMTP_PASS"),
		FromEmail: getEnv("SMTP_FROM", "noreply@alphahecta.com"),
		FromName:  getEnv("SMTP_NAME", "AlphaHecta"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// SendEmail sends an email via SMTP
func (e *EmailService) SendEmail(to, subject, htmlBody, textBody string) error {
	// Build email headers
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", e.FromName, e.FromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Build the email message
	var msg bytes.Buffer
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	// Set up SMTP auth
	auth := smtp.PlainAuth("", e.Username, e.Password, e.SMTPHost)

	// Connect and send
	addr := fmt.Sprintf("%s:%d", e.SMTPHost, e.SMTPPort)
	err := smtp.SendMail(addr, auth, e.FromEmail, []string{to}, msg.Bytes())
	if err != nil {
		log.Printf("Error sending email: %v", err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("Email sent successfully to %s", to)
	return nil
}

// SendWelcomeEmail sends a welcome email to new users
func (e *EmailService) SendWelcomeEmail(name, email, loginURL string) error {
	subject := "Welcome to AlphaHecta!"

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">AlphaHecta</h1>
    </div>
    <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 10px 10px;">
        <h2>Welcome, %s!</h2>
        <p>Thank you for signing up for AlphaHecta. We're excited to have you on board!</p>
        <p>Your account has been created with email: <strong>%s</strong></p>
        <p style="margin-top: 30px;">
            <a href="%s" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Log in to your account</a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact us at support@alphahecta.com
        </p>
    </div>
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>&copy; AlphaHecta. All rights reserved.</p>
    </div>
</body>
</html>`, name, email, loginURL)

	return e.SendEmail(email, subject, htmlBody, "")
}

// SendPasswordResetEmail sends a password reset email
func (e *EmailService) SendPasswordResetEmail(name, email, resetURL string, expiryMinutes int) error {
	subject := "Reset your password"

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset</h1>
    </div>
    <div style="background: #f9f9f9; padding: 40px 20px;">
        <h2>Reset your password</h2>
        <p>Hi %s,</p>
        <p>We received a request to reset your password. Click the button below:</p>
        <p style="margin-top: 30px;">
            <a href="%s" style="display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link will expire in %d minutes.
        </p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
</body>
</html>`, name, resetURL, expiryMinutes)

	return e.SendEmail(email, subject, htmlBody, "")
}

// SendInvoiceEmail sends an invoice email
func (e *EmailService) SendInvoiceEmail(name, email, invoiceID, amount, date, downloadURL string) error {
	subject := fmt.Sprintf("Invoice %s from AlphaHecta", invoiceID)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #333; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Invoice</h1>
    </div>
    <div style="background: #f9f9f9; padding: 40px 20px;">
        <h2>Invoice %s</h2>
        <p>Hi %s,</p>
        <p>Thank you for your business.</p>
        <table style="width: 100%%; margin: 20px 0;">
            <tr><td><strong>Invoice ID</strong></td><td>%s</td></tr>
            <tr><td><strong>Amount</strong></td><td>%s</td></tr>
            <tr><td><strong>Date</strong></td><td>%s</td></tr>
        </table>
        <p style="margin-top: 30px;">
            <a href="%s" style="display: inline-block; background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Download Invoice</a>
        </p>
    </div>
</body>
</html>`, invoiceID, name, invoiceID, amount, date, downloadURL)

	return e.SendEmail(email, subject, htmlBody, "")
}

// SendUsageAlertEmail sends a usage alert email
func (e *EmailService) SendUsageAlertEmail(name, email, productName, currentUsage, limit, percentage, upgradeURL string) error {
	subject := fmt.Sprintf("Usage Alert: You've used %s of your %s limit", percentage, productName)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ff9a9e 0%%, #fecfef 100%%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Usage Alert</h1>
    </div>
    <div style="background: #f9f9f9; padding: 40px 20px;">
        <h2>You've used %s of your %s limit</h2>
        <p>Hi %s,</p>
        <ul>
            <li>Current: %s</li>
            <li>Limit: %s</li>
        </ul>
        <p style="margin-top: 30px;">
            <a href="%s" style="display: inline-block; background: #ff9a9e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Upgrade Now</a>
        </p>
    </div>
</body>
</html>`, percentage, productName, name, currentUsage, limit, upgradeURL)

	return e.SendEmail(email, subject, htmlBody, "")
}

// ValidateEmail validates an email address
func ValidateEmail(email string) bool {
	if email == "" {
		return false
	}
	// Basic email validation
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return false
	}
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}
	if len(parts[0]) == 0 || len(parts[1]) == 0 {
		return false
	}
	return true
}

// SendBatchEmails sends multiple emails
func (e *EmailService) SendBatchEmails(emails []struct {
	To      string
	Subject string
	Body    string
}) error {
	for _, email := range emails {
		if err := e.SendEmail(email.To, email.Subject, email.Body, ""); err != nil {
			log.Printf("Failed to send email to %s: %v", email.To, err)
			// Continue sending other emails
		}
	}
	return nil
}

// ScheduleEmail schedules an email to be sent at a specific time
func (e *EmailService) ScheduleEmail(to, subject, body string, sendAt time.Time) {
	go func() {
		// Calculate delay
		delay := time.Until(sendAt)
		if delay > 0 {
			time.Sleep(delay)
		}

		// Send the email
		if err := e.SendEmail(to, subject, body, ""); err != nil {
			log.Printf("Failed to send scheduled email to %s: %v", to, err)
		}
	}()
}
