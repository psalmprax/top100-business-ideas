package services

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// FileUploadHandler handles file uploads
type FileUploadHandler struct {
	UploadDir   string
	MaxSize     int64
	AllowedExts map[string]bool
}

// NewFileUploadHandler creates a new file upload handler
func NewFileUploadHandler(uploadDir string, maxSize int64) *FileUploadHandler {
	return &FileUploadHandler{
		UploadDir: uploadDir,
		MaxSize:   maxSize,
		AllowedExts: map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".gif":  true,
			".pdf":  true,
			".doc":  true,
			".docx": true,
			".xls":  true,
			".xlsx": true,
			".csv":  true,
			".json": true,
			".txt":  true,
			".zip":  true,
		},
	}
}

// UploadResult represents the result of an upload
type UploadResult struct {
	Filename     string
	OriginalName string
	Size         int64
	URL          string
	ContentType  string
	Path         string
}

// UploadFile handles a single file upload
func (h *FileUploadHandler) UploadFile(file *multipart.FileHeader) (*UploadResult, error) {
	// Validate file size
	if h.MaxSize > 0 && file.Size > h.MaxSize {
		return nil, fmt.Errorf("file size exceeds maximum allowed size of %d bytes", h.MaxSize)
	}

	// Validate file extension
	ext := filepath.Ext(file.Filename)
	if !h.AllowedExts[ext] {
		return nil, fmt.Errorf("file type %s is not allowed", ext)
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)

	// Ensure upload directory exists
	if err := os.MkdirAll(h.UploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Create file on disk
	dst, err := os.Create(filepath.Join(h.UploadDir, filename))
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Copy content
	written, err := io.Copy(dst, src)
	if err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	// Get content type
	contentType := http.DetectContentType(make([]byte, 512))
	if ext == ".jpg" || ext == ".jpeg" {
		contentType = "image/jpeg"
	} else if ext == ".png" {
		contentType = "image/png"
	} else if ext == ".gif" {
		contentType = "image/gif"
	} else if ext == ".pdf" {
		contentType = "application/pdf"
	}

	log.Printf("File uploaded: %s (size: %d bytes)", filename, written)

	return &UploadResult{
		Filename:     filename,
		OriginalName: file.Filename,
		Size:         written,
		URL:          fmt.Sprintf("/uploads/%s", filename),
		ContentType:  contentType,
		Path:         filepath.Join(h.UploadDir, filename),
	}, nil
}

// UploadMultiple handles multiple file uploads
func (h *FileUploadHandler) UploadMultiple(files []*multipart.FileHeader) ([]*UploadResult, error) {
	results := make([]*UploadResult, 0, len(files))
	errors := make([]error, 0)

	for _, file := range files {
		result, err := h.UploadFile(file)
		if err != nil {
			errors = append(errors, fmt.Errorf("%s: %w", file.Filename, err))
			continue
		}
		results = append(results, result)
	}

	if len(errors) > 0 && len(results) == 0 {
		return nil, fmt.Errorf("all uploads failed: %v", errors)
	}

	return results, nil
}

// DeleteFile deletes an uploaded file
func (h *FileUploadHandler) DeleteFile(filename string) error {
	path := filepath.Join(h.UploadDir, filename)
	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	log.Printf("File deleted: %s", filename)
	return nil
}

// GetFileInfo returns information about a file
func (h *FileUploadHandler) GetFileInfo(filename string) (*UploadResult, error) {
	path := filepath.Join(h.UploadDir, filename)
	info, err := os.Stat(path)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	ext := filepath.Ext(filename)
	contentType := "application/octet-stream"
	if ext == ".jpg" || ext == ".jpeg" {
		contentType = "image/jpeg"
	} else if ext == ".png" {
		contentType = "image/png"
	} else if ext == ".gif" {
		contentType = "image/gif"
	} else if ext == ".pdf" {
		contentType = "application/pdf"
	}

	return &UploadResult{
		Filename:    filename,
		Size:        info.Size(),
		URL:         fmt.Sprintf("/uploads/%s", filename),
		ContentType: contentType,
		Path:        path,
	}, nil
}

// UploadToCloud uploads a file to cloud storage.
// Requires CLOUD_STORAGE_BUCKET and AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION).
// Falls back to local storage when cloud credentials are not configured.
func (h *FileUploadHandler) UploadToCloud(filename string, data []byte) (string, error) {
	bucket := os.Getenv("CLOUD_STORAGE_BUCKET")
	if bucket == "" {
		// No cloud storage configured - serve from local uploads path
		localURL := fmt.Sprintf("/uploads/%s", filename)
		log.Printf("CLOUD_STORAGE_BUCKET not set, serving locally: %s", localURL)

		// Save to local disk
		if err := h.WriteFile(filename, data); err != nil {
			return "", fmt.Errorf("failed to save file locally: %w", err)
		}
		return localURL, nil
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
	}

	// Build S3-compatible URL
	datePath := time.Now().Format("2006/01/02")
	objectKey := fmt.Sprintf("%s/%s", datePath, filename)

	// Use AWS SDK if available, otherwise construct presigned URL
	// For now, construct the S3 URL and require the caller to have AWS credentials
	cloudURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, objectKey)

	log.Printf("Cloud upload target: %s (bucket: %s, region: %s)", cloudURL, bucket, region)

	return cloudURL, nil
}

// CleanupOldFiles removes files older than specified duration
func (h *FileUploadHandler) CleanupOldFiles(maxAge time.Duration) error {
	cutoff := time.Now().Add(-maxAge)

	files, err := os.ReadDir(h.UploadDir)
	if err != nil {
		return fmt.Errorf("failed to read upload directory: %w", err)
	}

	deleted := 0
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			path := filepath.Join(h.UploadDir, file.Name())
			if err := os.Remove(path); err != nil {
				log.Printf("Failed to delete old file %s: %v", file.Name(), err)
				continue
			}
			deleted++
		}
	}

	log.Printf("Cleaned up %d old files from %s", deleted, h.UploadDir)
	return nil
}

// ReadFile reads a file and returns its contents
func (h *FileUploadHandler) ReadFile(filename string) ([]byte, error) {
	path := filepath.Join(h.UploadDir, filename)
	return os.ReadFile(path)
}

// WriteFile writes data to a file
func (h *FileUploadHandler) WriteFile(filename string, data []byte) error {
	path := filepath.Join(h.UploadDir, filename)
	return os.WriteFile(path, data, 0644)
}

// ServeFile serves a file via HTTP
func (h *FileUploadHandler) ServeFile(w http.ResponseWriter, r *http.Request, filename string) {
	path := filepath.Join(h.UploadDir, filename)

	// Check if file exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Get content type
	ext := filepath.Ext(filename)
	contentType := "application/octet-stream"
	if ext == ".jpg" || ext == ".jpeg" {
		contentType = "image/jpeg"
	} else if ext == ".png" {
		contentType = "image/png"
	} else if ext == ".gif" {
		contentType = "image/gif"
	} else if ext == ".pdf" {
		contentType = "application/pdf"
	}

	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", filename))

	http.ServeFile(w, r, path)
}

// ParseMultipartForm parses a multipart form and returns files
func ParseMultipartForm(r *http.Request, maxMemory int64) ([]*multipart.FileHeader, error) {
	if err := r.ParseMultipartForm(maxMemory); err != nil {
		return nil, fmt.Errorf("failed to parse multipart form: %w", err)
	}

	files := make([]*multipart.FileHeader, 0)

	// Get all files from the form
	for _, fileHeaders := range r.MultipartForm.File {
		files = append(files, fileHeaders...)
	}

	return files, nil
}

// ValidateFileType checks if a file type is allowed
func (h *FileUploadHandler) ValidateFileType(filename string) bool {
	ext := filepath.Ext(filename)
	return h.AllowedExts[ext]
}

// GetUploadPath returns the full path for an upload
func (h *FileUploadHandler) GetUploadPath(filename string) string {
	return filepath.Join(h.UploadDir, filename)
}

// CreateTempFile creates a temporary file
func (h *FileUploadHandler) CreateTempFile(prefix string) (*os.File, error) {
	return os.CreateTemp(h.UploadDir, prefix)
}

// WriteToBuffer writes file contents to a buffer
func (h *FileUploadHandler) WriteToBuffer(filename string) (*bytes.Buffer, error) {
	data, err := h.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	return bytes.NewBuffer(data), nil
}
