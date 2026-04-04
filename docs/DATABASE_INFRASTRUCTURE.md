# Database Infrastructure & Dialect Agnosticism (Alembic)

The Alpha platform is built for **Enterprise Portability**. This means it is 100% agnostic to the underlying SQL provider. Whether your data lives in **PostgreSQL**, **SQLite**, **Oracle**, or **SQL Server**, the platform operates identically.

## 🏗️ The Agnostic Principle
To achieve 100% agnosticism, the platform uses **SQLModel** (SQLAlchemy + Pydantic) and **Alembic** as the abstraction layers. 

- **Manual SQL Redaction**: All manual, dialect-specific SQL strings (like `IF NOT EXISTS` for PostgreSQL) have been removed from the application layer.
- **Abstract Migrations**: Database schema changes are managed via Alembic's `op.add_column` and `op.create_table` functions, which automatically translate your high-level Python code into the correct SQL dialect for your current environment.

## 🛠️ The Migration Lifecycle (Alembic)

Alembic is our chosen tool for managing the evolution of the database schema across different states (Development, QA, and Production).

### Core Components:
- **`alembic.ini`**: The central configuration that maps the migration engine to your `DATABASE_URL`.
- **`alembic/env.py`**: The bridge that synchronizes your `SQLModel.metadata` and project models with the database instance.
- **`alembic/versions/`**: The history of your database schema. Each file is a "point-in-time" snapshot of your technical state.

### 🚀 Running Migrations
To upgrade your database to the "Latest Technical State" (Head), run the following command from the server root:

```bash
cd server/python
alembic upgrade head
```

### 🧬 Generating a New Migration
When you modify a file in `app/core/models.py`, generate a new "Difference Snapshot" with:

```bash
alembic revision --autogenerate -m "Description of change"
```

## 🛡️ Reliability Features

- **Dialect Detection**: Alembic automatically detects your provider (Postgres, SQLite, etc.) and picks the correct "Implementation Class" at runtime.
- **Inspector Checks**: Our initial migrations (e.g., `a1b2c3d4e5f6`) use a **Reflection Inspector** to check for the existence of columns before applying changes. This prevents "Schema Collisions" if a database was partially manually configured.
- **Atomic Operations**: All migrations run inside a database transaction (where supported). If a migration fails, the database is automatically rolled back to its previous "Healthy" state.

---

**Sovereignty Tip**: Always verify your `DATABASE_URL` in the `.env` file before running a migration to ensure you are targeting the correct environment (Staging vs. Production).
