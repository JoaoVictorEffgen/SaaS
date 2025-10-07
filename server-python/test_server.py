from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Cecilia@2020',
    'database': 'SaaS',
    'port': 3306
}

@app.route('/')
def home():
    return jsonify({
        'message': 'SaaS Agendamento API - Python',
        'status': 'running'
    })

@app.route('/api/test-db')
def test_db():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total FROM users")
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'total_users': result['total']
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print('🚀 Iniciando servidor Python de teste...')
    app.run(host='0.0.0.0', port=5000, debug=True)
