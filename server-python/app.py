from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import jwt
import json
from datetime import datetime, timedelta
import os
from functools import wraps

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

JWT_SECRET = 'seu_jwt_secret_muito_seguro_aqui_2024'

def get_db_connection():
    """Criar conexão com o banco de dados"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao banco: {err}")
        return None

def token_required(f):
    """Decorator para verificar token JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Token mal formatado'}), 401
        
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = data['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/')
def home():
    """Rota inicial da API"""
    return jsonify({
        'message': 'SaaS Agendamento API - Python',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth',
            'empresas': '/api/empresas',
            'users': '/api/users',
            'agendamentos': '/api/agendamentos'
        }
    })

@app.route('/api/users/login', methods=['POST'])
def login():
    """Login do usuário"""
    try:
        data = request.get_json()
        identifier = data.get('identifier')
        senha = data.get('senha')
        tipo = data.get('tipo', 'cliente')
        
        print(f'🔍 Tentativa de login: {identifier}, tipo: {tipo}')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Buscar usuário
        query = """
        SELECT * FROM users 
        WHERE (email = %s OR telefone = %s OR cnpj = %s) 
        AND tipo = %s
        LIMIT 1
        """
        
        cursor.execute(query, (identifier, identifier, identifier, tipo))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        print(f'👤 Usuário encontrado: {user["id"]}')
        
        # Verificar senha
        if user['senha'] != senha:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        print('✅ Senha confere!')
        
        # Gerar token JWT
        token = jwt.encode({
            'userId': user['id'],
            'tipo': user['tipo'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, JWT_SECRET, algorithm='HS256')
        
        print(f'🎫 Token JWT gerado')
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'user': {
                'id': user['id'],
                'nome': user['nome'],
                'email': user['email'],
                'telefone': user['telefone'],
                'tipo': user['tipo'],
                'cpf': user['cpf'],
                'cnpj': user['cnpj'],
                'empresa_id': user['empresa_id'],
                'cargo': user['cargo'],
                'foto_url': user['foto_url']
            },
            'token': token
        })
        
    except Exception as e:
        print(f'❌ Erro no login: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/empresas', methods=['GET'])
def get_empresas():
    """Buscar todas as empresas"""
    try:
        print('🔍 Buscando todas as empresas...')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM empresas"
        cursor.execute(query)
        empresas = cursor.fetchall()
        
        print(f'📊 Empresas encontradas: {len(empresas)}')
        
        cursor.close()
        connection.close()
        
        return jsonify(empresas)
        
    except Exception as e:
        print(f'❌ Erro ao buscar empresas: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/empresas/<int:empresa_id>', methods=['GET'])
def get_empresa(empresa_id):
    """Buscar empresa por ID"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM empresas WHERE id = %s"
        cursor.execute(query, (empresa_id,))
        empresa = cursor.fetchone()
        
        if not empresa:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Empresa não encontrada'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify(empresa)
        
    except Exception as e:
        print(f'❌ Erro ao buscar empresa: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Buscar perfil do usuário"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM users WHERE id = %s"
        cursor.execute(query, (current_user,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'id': user['id'],
            'nome': user['nome'],
            'email': user['email'],
            'telefone': user['telefone'],
            'tipo': user['tipo'],
            'cpf': user['cpf'],
            'cnpj': user['cnpj'],
            'empresa_id': user['empresa_id'],
            'cargo': user['cargo'],
            'foto_url': user['foto_url']
        })
        
    except Exception as e:
        print(f'❌ Erro ao buscar perfil: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/users/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Atualizar perfil do usuário"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Verificar se é empresa ou funcionário
        query = "SELECT tipo FROM users WHERE id = %s"
        cursor.execute(query, (current_user,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Atualizar dados
        if user['tipo'] == 'empresa':
            # Atualizar logo na tabela empresas
            if 'logo_url' in data:
                update_query = "UPDATE empresas SET logo_url = %s WHERE user_id = %s"
                cursor.execute(update_query, (data['logo_url'], current_user))
        else:
            # Atualizar foto na tabela users
            if 'foto_url' in data:
                update_query = "UPDATE users SET foto_url = %s WHERE id = %s"
                cursor.execute(update_query, (data['foto_url'], current_user))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Perfil atualizado com sucesso'})
        
    except Exception as e:
        print(f'❌ Erro ao atualizar perfil: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/users/funcionarios/<int:empresa_id>', methods=['GET'])
def get_funcionarios(empresa_id):
    """Buscar funcionários de uma empresa"""
    try:
        print(f'🔍 Buscando funcionários da empresa: {empresa_id}')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Erro de conexão com o banco'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT id, nome, email, telefone, cpf, cargo, foto_url, ativo, created_at
        FROM users 
        WHERE tipo = 'funcionario' AND empresa_id = %s
        """
        cursor.execute(query, (empresa_id,))
        funcionarios = cursor.fetchall()
        
        print(f'👥 Funcionários encontrados: {len(funcionarios)}')
        
        cursor.close()
        connection.close()
        
        return jsonify(funcionarios)
        
    except Exception as e:
        print(f'❌ Erro ao buscar funcionários: {e}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    print('🚀 Iniciando servidor Python...')
    print('🔗 API: http://localhost:5000/api')
    app.run(host='0.0.0.0', port=5000, debug=True)
