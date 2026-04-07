package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	jwtSecret   []byte
	jwtExpiry   time.Duration
	userRepo    *repository.UserRepository
	blacklist   map[string]bool
	blacklistMu sync.RWMutex
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
		blacklist: make(map[string]bool),
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
			ID:        generateTokenID(),
		},
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
		s.blacklistMu.RLock()
		blacklisted := s.blacklist[claims.ID]
		s.blacklistMu.RUnlock()
		if blacklisted {
			return nil, errors.New("token has been revoked")
		}
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) RevokeToken(tokenID string) {
	s.blacklistMu.Lock()
	s.blacklist[tokenID] = true
	s.blacklistMu.Unlock()
}

func (s *AuthService) RevokeAllUserTokens(userID string) {
	s.blacklistMu.Lock()
	for key := range s.blacklist {
		delete(s.blacklist, key)
	}
	s.blacklistMu.Unlock()
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
		Role:            "user",
		AllowedProducts: []string{"agent-ops"},
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
