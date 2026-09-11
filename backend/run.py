from sqlalchemy import text

from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.session.execute(text('SELECT 1'))
        print('Database connected successfully.')
    app.run(host='0.0.0.0', port=5000, debug=True)
