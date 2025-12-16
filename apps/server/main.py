from flask import Flask
from routes import pdf_bp
import os

app = Flask(__name__)
app.register_blueprint(pdf_bp, url_prefix='/api/pdf')

if __name__ == "__main__":
    if not os.path.exists('app/uploads'):
        os.makedirs('app/uploads')
    app.run(debug=True, port=5000)
