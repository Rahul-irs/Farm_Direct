from sqlalchemy import text
import os

from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.session.execute(text('SELECT 1'))
        print('Database connected successfully.')
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', '5000')),
        debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true',
    )
