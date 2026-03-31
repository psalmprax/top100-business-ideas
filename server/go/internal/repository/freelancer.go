package repository

import (
	"context"
	"fmt"

	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
)

type FreelancerRepository struct{}

func NewFreelancerRepository() *FreelancerRepository {
	return &FreelancerRepository{}
}

// Tasks
func (r *FreelancerRepository) ListTasks(ctx context.Context, userID string) ([]models.Task, error) {
	if database.Pool == nil {
		return nil, fmt.Errorf("database pool not initialized")
	}

	query := `SELECT id, user_id, title, status, priority, due_date, created_at, updated_at 
	          FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		err := rows.Scan(&t.ID, &t.UserID, &t.Title, &t.Status, &t.Priority, &t.DueDate, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, t)
	}

	return tasks, nil
}

func (r *FreelancerRepository) CreateTask(ctx context.Context, task *models.Task) error {
	query := `INSERT INTO tasks (user_id, title, status, priority, due_date) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at`
	
	return database.Pool.QueryRow(ctx, query, 
		task.UserID, task.Title, task.Status, task.Priority, task.DueDate,
	).Scan(&task.ID, &task.CreatedAt, &task.UpdatedAt)
}

// Clients
func (r *FreelancerRepository) ListClients(ctx context.Context, userID string) ([]models.Client, error) {
	query := `SELECT id, user_id, name, email, company, status, created_at, updated_at 
	          FROM clients WHERE user_id = $1 ORDER BY name ASC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list clients: %w", err)
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var c models.Client
		err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.Email, &c.Company, &c.Status, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan client: %w", err)
		}
		clients = append(clients, c)
	}
	return clients, nil
}

func (r *FreelancerRepository) CreateClient(ctx context.Context, client *models.Client) error {
	query := `INSERT INTO clients (user_id, name, email, company, status) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at`
	
	return database.Pool.QueryRow(ctx, query, 
		client.UserID, client.Name, client.Email, client.Company, client.Status,
	).Scan(&client.ID, &client.CreatedAt, &client.UpdatedAt)
}

// Events
func (r *FreelancerRepository) ListEvents(ctx context.Context, userID string) ([]models.CalendarEvent, error) {
	query := `SELECT id, user_id, title, start_time, end_time, description, created_at 
	          FROM calendar_events WHERE user_id = $1 ORDER BY start_time ASC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.CalendarEvent
	for rows.Next() {
		var e models.CalendarEvent
		err := rows.Scan(&e.ID, &e.UserID, &e.Title, &e.StartTime, &e.EndTime, &e.Description, &e.CreatedAt)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, nil
}

func (r *FreelancerRepository) CreateEvent(ctx context.Context, event *models.CalendarEvent) error {
	query := `INSERT INTO calendar_events (user_id, title, start_time, end_time, description) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	
	return database.Pool.QueryRow(ctx, query, 
		event.UserID, event.Title, event.StartTime, event.EndTime, event.Description,
	).Scan(&event.ID, &event.CreatedAt)
}

// Notes
func (r *FreelancerRepository) ListNotes(ctx context.Context, userID string) ([]models.AuditNote, error) {
	query := `SELECT id, user_id, content, created_at FROM audit_notes WHERE user_id = $1 ORDER BY created_at DESC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []models.AuditNote
	for rows.Next() {
		var n models.AuditNote
		err := rows.Scan(&n.ID, &n.UserID, &n.Content, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

func (r *FreelancerRepository) CreateNote(ctx context.Context, note *models.AuditNote) error {
	query := `INSERT INTO audit_notes (user_id, content) VALUES ($1, $2) RETURNING id, created_at`
	return database.Pool.QueryRow(ctx, query, note.UserID, note.Content).Scan(&note.ID, &note.CreatedAt)
}
