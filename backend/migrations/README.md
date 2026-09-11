# Database migrations

This project uses Flask-Migrate/Alembic. The application factory registers the database extension; migration commands should be run from the repository root with the project virtual environment active.

Initialize the migration directory once in a fresh checkout:

```powershell
$env:FLASK_APP = "backend.run:app"
flask db init
```

Create and apply migrations after model changes:

```powershell
$env:FLASK_APP = "backend.run:app"
flask db migrate -m "describe the schema change"
flask db upgrade
```

For local SQLite development, the database is created at `backend/instance/farmdirect_ai.db`. For PostgreSQL, set `DATABASE_URL` before running `flask db upgrade`. The seed script is separate and should only be used for development data:

```powershell
python backend/seed.py
```

Do not use `db.drop_all()` outside tests or the validation script.
