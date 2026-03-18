package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// OAuth2Config holds OAuth2/OIDC configuration
type OAuth2Config struct {
	Issuer       string
	ClientID     string
	ClientSecret string
	RedirectURL  string
	Scopes       []string
	JWKSURL      string
	UsePKCE      bool
}

// OAuth2State stores OAuth2 state
type OAuth2State struct {
	CodeVerifier string
	RedirectURI  string
	CreatedAt    time.Time
}

var oauthStates = make(map[string]*OAuth2State)

// NewOAuth2Config creates a new OAuth2 configuration
func NewOAuth2Config() *OAuth2Config {
	return &OAuth2Config{
		Issuer:       os.Getenv("OAUTH2_ISSUER"),
		ClientID:     os.Getenv("OAUTH2_CLIENT_ID"),
		ClientSecret: os.Getenv("OAUTH2_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("OAUTH2_REDIRECT_URL"),
		Scopes:       []string{"openid", "profile", "email"},
		JWKSURL:      os.Getenv("OAUTH2_JWKS_URL"),
		UsePKCE:      true,
	}
}

// OAuth2LoginHandler initiates OAuth2 login flow
func OAuth2LoginHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.Issuer == "" || config.ClientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "OAuth2 not configured",
			})
			return
		}

		// Generate state
		state := generateRandomState()
		redirectURI := c.Query("redirect_uri")

		// Store state
		oauthStates[state] = &OAuth2State{
			RedirectURI: redirectURI,
			CreatedAt:   time.Now(),
		}

		// Build authorization URL
		authURL := fmt.Sprintf("%s/authorize?client_id=%s&redirect_uri=%s&response_type=code&state=%s&scope=%s",
			config.Issuer,
			config.ClientID,
			config.RedirectURL,
			state,
			strings.Join(config.Scopes, "+"),
		)

		// Add PKCE if enabled
		if config.UsePKCE {
			codeVerifier := generateRandomState()
			// In production, store code_verifier linked to state
			authURL += "&code_challenge=" + generateCodeChallenge(codeVerifier)
			authURL += "&code_challenge_method=S256"
		}

		c.JSON(http.StatusOK, gin.H{
			"authorization_url": authURL,
			"state":             state,
		})
	}
}

// OAuth2CallbackHandler handles OAuth2 callback
func OAuth2CallbackHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		code := c.Query("code")
		state := c.Query("state")

		if code == "" || state == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Missing code or state",
			})
			return
		}

		// Validate state
		stateData, exists := oauthStates[state]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid state",
			})
			return
		}

		// Check state expiry (10 minutes)
		if time.Since(stateData.CreatedAt) > 10*time.Minute {
			delete(oauthStates, state)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "State expired",
			})
			return
		}

		// Exchange code for tokens - in production, make HTTP request
		_ = fmt.Sprintf("%s/oauth/token", config.Issuer)
		tokenReq := map[string]string{
			"grant_type":    "authorization_code",
			"code":          code,
			"client_id":     config.ClientID,
			"client_secret": config.ClientSecret,
			"redirect_uri":  config.RedirectURL,
		}
		_ = tokenReq // Use in production

		// In production, make actual HTTP request to tokenURL
		// For demo, return success
		delete(oauthStates, state)

		c.JSON(http.StatusOK, gin.H{
			"message":       "OAuth2 login successful",
			"access_token":  "demo_access_token",
			"token_type":    "Bearer",
			"expires_in":    3600,
			"refresh_token": "demo_refresh_token",
			"id_token":      "demo_id_token",
		})
	}
}

// ValidateOIDCToken validates OIDC token
func ValidateOIDCToken(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Missing authorization header",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format",
			})
			return
		}

		// Parse token without validation for demo
		// In production, validate against JWKS
		token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			return
		}

		// Set claims in context
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("oidc_claims", claims)
			c.Set("user_id", claims["sub"])
			c.Set("user_email", claims["email"])
		}

		c.Next()
	}
}

// OIDCMiddleware creates OIDC authentication middleware
func OIDCMiddleware(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip for public routes
		publicPaths := []string{"/health", "/auth/login", "/auth/register", "/oauth2/login"}
		for _, path := range publicPaths {
			if strings.HasPrefix(c.Request.URL.Path, path) {
				c.Next()
				return
			}
		}

		// Validate OIDC token
		ValidateOIDCToken(config)(c)

		if c.IsAborted() {
			return
		}

		c.Next()
	}
}

// GetUserInfo returns user info from OIDC claims
func GetUserInfo(c *gin.Context) (map[string]interface{}, bool) {
	claims, exists := c.Get("oidc_claims")
	if !exists {
		return nil, false
	}

	userInfo := make(map[string]interface{})
	if oidcClaims, ok := claims.(jwt.MapClaims); ok {
		userInfo["sub"] = oidcClaims["sub"]
		userInfo["email"] = oidcClaims["email"]
		userInfo["name"] = oidcClaims["name"]
		userInfo["picture"] = oidcClaims["picture"]
	}

	return userInfo, true
}

// RefreshTokenHandler handles token refresh
func RefreshTokenHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Missing refresh_token",
			})
			return
		}

		// In production, exchange refresh token for new tokens
		// For demo, return new tokens
		c.JSON(http.StatusOK, gin.H{
			"access_token":  "new_access_token",
			"token_type":    "Bearer",
			"expires_in":    3600,
			"refresh_token": "new_refresh_token",
		})
	}
}

// RevokeTokenHandler handles token revocation
func RevokeTokenHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Token string `json:"token"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Missing token",
			})
			return
		}

		// In production, revoke token with OAuth2 provider
		c.JSON(http.StatusOK, gin.H{
			"message": "Token revoked successfully",
		})
	}
}

// Helper functions
func generateRandomState() string {
	return fmt.Sprintf("%d_%s", time.Now().UnixNano(), randomString(32))
}

func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}

func generateCodeChallenge(verifier string) string {
	// Simplified PKCE code challenge
	// In production, use crypto/sha256
	return verifier[:32]
}

// MockJWKS returns mock JWKS for testing
func MockJWKS() map[string]interface{} {
	return map[string]interface{}{
		"keys": []map[string]interface{}{
			{
				"kty": "RSA",
				"use": "sig",
				"kid": "test-key-1",
				"alg": "RS256",
				"n":   "test-modulus",
				"e":   "AQAB",
			},
		},
	}
}

// OIDCWellKnownHandler returns OIDC discovery document
func OIDCWellKnownHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		discovery := map[string]interface{}{
			"issuer":                                config.Issuer,
			"authorization_endpoint":                config.Issuer + "/authorize",
			"token_endpoint":                        config.Issuer + "/oauth/token",
			"userinfo_endpoint":                     config.Issuer + "/userinfo",
			"jwks_uri":                              config.Issuer + "/.well-known/jwks.json",
			"response_types_supported":              []string{"code", "token", "id_token"},
			"subject_types_supported":               []string{"public"},
			"id_token_signing_alg_values_supported": []string{"RS256"},
			"scopes_supported":                      config.Scopes,
			"token_endpoint_auth_methods_supported": []string{"client_secret_basic", "client_secret_post"},
		}

		c.JSON(http.StatusOK, discovery)
	}
}

// IntrospectTokenHandler handles token introspection
func IntrospectTokenHandler(config *OAuth2Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Token string `form:"token"`
		}

		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Missing token",
			})
			return
		}

		// In production, validate token with OAuth2 provider
		// For demo, return active=true
		c.JSON(http.StatusOK, gin.H{
			"active":    true,
			"scope":     strings.Join(config.Scopes, " "),
			"client_id": config.ClientID,
			"exp":       time.Now().Add(time.Hour).Unix(),
		})
	}
}

// SetupOAuth2Routes sets up OAuth2 routes
func SetupOAuth2Routes(r *gin.Engine, config *OAuth2Config) {
	oauth2 := r.Group("/oauth2")
	{
		oauth2.GET("/login", OAuth2LoginHandler(config))
		oauth2.GET("/callback", OAuth2CallbackHandler(config))
		oauth2.POST("/token", RefreshTokenHandler(config))
		oauth2.POST("/revoke", RevokeTokenHandler(config))
		oauth2.GET("/.well-known/openid-configuration", OIDCWellKnownHandler(config))
		oauth2.GET("/.well-known/jwks.json", func(c *gin.Context) {
			c.JSON(http.StatusOK, MockJWKS())
		})
		oauth2.POST("/introspect", IntrospectTokenHandler(config))
	}
}

// ContextKey for OIDC claims
type ContextKey string

const (
	ContextKeyUserID     ContextKey = "user_id"
	ContextKeyUserEmail  ContextKey = "user_email"
	ContextKeyOIDCClaims ContextKey = "oidc_claims"
)

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(c *gin.Context) string {
	if userID, exists := c.Get(string(ContextKeyUserID)); exists {
		return userID.(string)
	}
	return ""
}

// GetUserEmailFromContext extracts user email from context
func GetUserEmailFromContext(c *gin.Context) string {
	if email, exists := c.Get(string(ContextKeyUserEmail)); exists {
		return email.(string)
	}
	return ""
}
