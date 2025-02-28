from flask import Blueprint, jsonify, request, render_template
from .models import db, Account, BalanceEntry
from datetime import datetime, timedelta

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/accounts', methods=['GET', 'POST'])
def accounts():
    if request.method == 'GET':
        accounts = Account.query.all()
        return jsonify([{'id': a.id, 'name': a.name} for a in accounts])
    elif request.method == 'POST':
        data = request.get_json()
        new_account = Account(name=data['name'])
        db.session.add(new_account)
        db.session.commit()
        return jsonify({'message': 'Account created'}), 201

@bp.route('/accounts/<int:account_id>/balances', methods=['GET', 'POST'])
def balances(account_id):
    if request.method == 'GET':
        balances = BalanceEntry.query.filter_by(account_id=account_id).all()
        return jsonify([{'id': b.id, 'entry_date': b.entry_date.isoformat(), 'balance': b.balance} for b in balances])
    elif request.method == 'POST':
        data = request.get_json()
        new_balance = BalanceEntry(account_id=account_id, entry_date=datetime.strptime(data['entry_date'], '%Y-%m-%d').date(), balance=data['balance'])
        db.session.add(new_balance)
        db.session.commit()
        return jsonify({'message': 'Balance added'}), 201

@bp.route('/accounts/currentbalances', methods=['GET'])
def current_balances():
    accounts = Account.query.all()
    current_balances = []
    for account in accounts:
        latest_balance = BalanceEntry.query.filter_by(account_id=account.id).order_by(BalanceEntry.entry_date.desc()).first()
        if latest_balance:
            current_balances.append({
                'account_name': account.name,
                'balance': latest_balance.balance,
                'last_updated': latest_balance.entry_date.isoformat()
            })
        else:
            current_balances.append({
                'account_name': account.name,
                'balance': 0,
                'last_updated': "No entries"
            })
    return jsonify(current_balances)

@bp.route('/accounts/<int:account_id>/balances/<int:entry_id>', methods=['PUT'])
def update_balance(account_id, entry_id):
    data = request.get_json()
    entry = BalanceEntry.query.get(entry_id)
    if entry:
        entry.balance = data['balance']
        entry.entry_date = datetime.strptime(data['entry_date'], '%Y-%m-%d').date()
        db.session.commit()
        return jsonify({'message': 'Balance updated'}), 200
    else:
        return jsonify({'message': 'Balance entry not found'}), 404
