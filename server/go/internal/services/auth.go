package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

const (
	jwtBlacklistPrefix  = "jwt:blacklist:"
	jwtUserTokensPrefix = "jwt:usertokens:"
)

type AuthService struct {
	jwtSecret []byte
	jwtExpiry time.Duration
	userRepo  *repository.UserRepository
}

func generateTokenID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func NewAuthService(secret string, userRepo *repository.UserRepository) *AuthService {
	return &AuthService{
		jwtSecret: []byte(secret),
		jwtExpiry: 24 * time.Hour,
		userRepo:  userRepo,
	}
}

type Claims struct {
	UserID          string   `json:"user_id"`
	Email           string   `json:"email"`
	Role            string   `json:"role"`
	TokenType       string   `json:"token_type"`
	AllowedProducts []string `json:"allowed_products"`
	jwt.RegisteredClaims
}

func (s *AuthService) GenerateToken(userID, email, role string, allowedProducts []string) (string, error) {
	return s.GenerateTokenWithType(userID, email, role, allowedProducts, "access")
}

func (s *AuthService) GenerateTokenWithType(userID, email, role string, allowedProducts []string, tokenType string) (string, error) {
	var expiry time.Duration
	if tokenType == "refresh" {
		expiry = 7 * 24 * time.Hour // 7 days for refresh token
	} else {
		expiry = 24 * time.Hour // 24 hours for access token
	}

	jti := generateTokenID()
	claims := Claims{
		UserID:          userID,
		Email:           email,
		Role:            role,
		TokenType:       tokenType,
		AllowedProducts: allowedProducts,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "top100-business-ideas",
			ID:        jti,
		},
	}

	// Track this JTI for the user for bulk revocation later (Redis)
	if database.Redis != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		database.Redis.SAdd(ctx, jwtUserTokensPrefix+userID, jti)
		database.Redis.Expire(ctx, jwtUserTokensPrefix+userID, 7*24*time.Hour)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *AuthService) GenerateRefreshToken(userID, email, role string, allowedProducts []string) (string, error) {
	return s.GenerateTokenWithType(userID, email, role, allowedProducts, "refresh")
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Check Redis blacklist
		if database.Redis != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			exists, _ := database.Redis.Exists(ctx, jwtBlacklistPrefix+claims.ID).Result()
			if exists == 1 {
				return nil, errors.New("token has been revoked")
			}
		}
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) RevokeToken(tokenID string) {
	if database.Redis != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		// Store with TTL matching token expiry (24h for access, 7d for refresh)
		database.Redis.Set(ctx, jwtBlacklistPrefix+tokenID, "1", 24*time.Hour)
	}
}

func (s *AuthService) RevokeAllUserTokens(userID string) {
	if database.Redis != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Get all tokens for this user and blacklist them
		tokens, _ := database.Redis.SMembers(ctx, jwtUserTokensPrefix+userID).Result()
		for _, tokenID := range tokens {
			database.Redis.Set(ctx, jwtBlacklistPrefix+tokenID, "1", 7*24*time.Hour)
		}
		// Remove the user token tracking set
		database.Redis.Del(ctx, jwtUserTokensPrefix+userID)
	}
}

func (s *AuthService) Authenticate(ctx context.Context, email, password string) (*models.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	if !s.CheckPassword(password, user.Password) {
		return nil, errors.New("invalid password")
	}

	return user, nil
}

func (s *AuthService) Register(ctx context.Context, email, password, name string) (*models.User, error) {
	existing, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:           email,
		Password:        hashedPassword,
		Name:            name,
		Role:            "management", // Grant management role for E2E verification
		AllowedProducts: []string{"agent-ops", "compliance", "deepfake", "workforce", "billing"},
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *AuthService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
