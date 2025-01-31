from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)

DATA_DIR = 'data'

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

@app.route('/add_account', methods=['POST'])
def add_account():
    account_name = request.json['account_name']
    initial_balance = request.json['initial_balance']
    account_file = os.path.join(DATA_DIR, f'{account_name}.json')
    if os.path.exists(account_file):
        return jsonify({'error': 'Account already exists'}), 400
    with open(account_file, 'w') as f:
        json.dump({'balance': initial_balance, 'history': []}, f)
    return jsonify({'message': 'Account created successfully'}), 201

@app.route('/update_balance', methods=['POST'])
def update_balance():
    account_name = request.json['account_name']
    new_balance = request.json['new_balance']
    account_file = os.path.join(DATA_DIR, f'{account_name}.json')
    if not os.path.exists(account_file):
        return jsonify({'error': 'Account does not exist'}), 404
    with open(account_file, 'r+') as f:
        data = json.load(f)
        data['history'].append({'balance': data['balance'], 'timestamp': request.json['timestamp']})
        data['balance'] = new_balance
        f.seek(0)
        json.dump(data, f)
        f.truncate()
    return jsonify({'message': 'Balance updated successfully'}), 200

@app.route('/get_data', methods=['GET'])
def get_data():
    account_name = request.args.get('account_name')
    account_file = os.path.join(DATA_DIR, f'{account_name}.json')
    if not os.path.exists(account_file):
        return jsonify({'error': 'Account does not exist'}), 404
    with open(account_file, 'r') as f:
        data = json.load(f)
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True)
