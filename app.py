from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    """Get a list of all account names."""
    try:
        accounts = []
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".json"):
                accounts.append(filename[:-5])
        return jsonify(accounts)
    except FileNotFoundError:
        os.makedirs(DATA_DIR, exist_ok=True) 
        return jsonify([]) 

@app.route('/api/account', methods=['POST'])
def create_account():
    """Create a new account."""
    data = request.get_json()
    account_name = data['accountName']
    file_path = os.path.join(DATA_DIR, f"{account_name}.json")

    if os.path.exists(file_path):
        return jsonify({"error": "Account already exists"}), 400 

    with open(file_path, 'w') as f:
        json.dump([], f)  # Initialize with an empty list

    return jsonify({"message": "Account created"}), 201

@app.route('/api/balance/<account>', methods=['POST'])
def add_balance(account):
    """Add a new balance to the specified account."""
    data = request.get_json()
    date = data["date"]
    balance = data["balance"]
    file_path = os.path.join(DATA_DIR, f"{account}.json")

    try:
        with open(file_path, "r") as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        existing_data = []

    existing_data.append({"date": date, "balance": balance})

    with open(file_path, "w") as f:
        json.dump(existing_data, f, indent=2)

    return jsonify({"message": "Balance added"}), 201  # Created success code

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
