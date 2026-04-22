package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/services"
)

// WearableHandler handles wearable device operations for Deepfake Defense
type WearableHandler struct {
	proxyService *services.ProxyService
}

func NewWearableHandler(proxyService *services.ProxyService) *WearableHandler {
	return &WearableHandler{
		proxyService: proxyService,
	}
}

// ListDevices returns all wearable devices
func (h *WearableHandler) ListDevices(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/wearables", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch wearables", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// RegisterDevice registers a new wearable device
func (h *WearableHandler) RegisterDevice(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/wearables", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to register wearable", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

// PairDevice pairs a wearable device for biometric verification
func (h *WearableHandler) PairDevice(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/wearables/%s/pair", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to pair device", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// CryptoHandler handles crypto wallet operations for Deepfake Defense
type CryptoHandler struct {
	proxyService *services.ProxyService
}

func NewCryptoHandler(proxyService *services.ProxyService) *CryptoHandler {
	return &CryptoHandler{
		proxyService: proxyService,
	}
}

// ListWallets returns all protected crypto wallets
func (h *CryptoHandler) ListWallets(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/crypto/wallets", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch wallets", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// ProtectWallet adds biometric protection to a wallet
func (h *CryptoHandler) ProtectWallet(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/crypto/wallets", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to protect wallet", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

// VerifyTransaction verifies a crypto transaction with biometric
func (h *CryptoHandler) VerifyTransaction(c *gin.Context) {
	walletID := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/crypto/wallets/%s/verify", walletID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to verify transaction", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// TravelKioskHandler handles travel/border kiosk operations
type TravelKioskHandler struct {
	proxyService *services.ProxyService
}

func NewTravelKioskHandler(proxyService *services.ProxyService) *TravelKioskHandler {
	return &TravelKioskHandler{
		proxyService: proxyService,
	}
}

// ListKiosks returns all travel kiosks
func (h *TravelKioskHandler) ListKiosks(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/travel/kiosks", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch kiosks", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// VerifyTraveler verifies a traveler at a kiosk
func (h *TravelKioskHandler) VerifyTraveler(c *gin.Context) {
	kioskID := c.Param("id")
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/travel/kiosks/%s/verify", kioskID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to verify traveler", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// EdgeHandler handles Edge AI operations for Compliance
type EdgeHandler struct {
	proxyService *services.ProxyService
}

func NewEdgeHandler(proxyService *services.ProxyService) *EdgeHandler {
	return &EdgeHandler{
		proxyService: proxyService,
	}
}

// ListDeployments returns edge AI deployments
func (h *EdgeHandler) ListDeployments(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/edge/deployments", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch deployments", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// SyncWeights syncs model weights to an edge deployment
func (h *EdgeHandler) SyncWeights(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/edge/deployments/%s/sync", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to sync weights", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetEdgeLogs returns logs for an edge deployment
func (h *EdgeHandler) GetEdgeLogs(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "GET", fmt.Sprintf("/edge/deployments/%s/logs", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch edge logs", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// VendorHandler handles vendor compliance operations
type VendorHandler struct {
	proxyService *services.ProxyService
}

func NewVendorHandler(proxyService *services.ProxyService) *VendorHandler {
	return &VendorHandler{
		proxyService: proxyService,
	}
}

// ListVendors returns all vendors
func (h *VendorHandler) ListVendors(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/vendors", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch vendors", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// AddVendor adds a new vendor
func (h *VendorHandler) AddVendor(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	response, err := h.proxyService.Forward(c, "POST", "/vendors", req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to add vendor", Details: err.Error()})
		return
	}
	c.Data(http.StatusCreated, "application/json", response)
}

// DeleteVendor removes a vendor
func (h *VendorHandler) DeleteVendor(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "DELETE", fmt.Sprintf("/vendors/%s", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete vendor", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// AuditVendor triggers a compliance audit for a vendor
func (h *VendorHandler) AuditVendor(c *gin.Context) {
	id := c.Param("id")
	response, err := h.proxyService.Forward(c, "POST", fmt.Sprintf("/vendors/%s/audit", id), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to audit vendor", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}

// GetRiskReport returns the comprehensive supply chain risk report
func (h *VendorHandler) GetRiskReport(c *gin.Context) {
	response, err := h.proxyService.Forward(c, "GET", "/vendors/report", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch risk report", Details: err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", response)
}
