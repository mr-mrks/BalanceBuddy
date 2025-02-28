from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class BalanceEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    entry_date = db.Column(db.Date, nullable=False)
    balance = db.Column(db.Float, nullable=False)
