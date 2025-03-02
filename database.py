import sqlite3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)

        if path == '/accounts':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            accounts = self.get_accounts()
            self.wfile.write(json.dumps(accounts).encode())
        elif path.startswith('/accounts/') and path.endswith('/balances'):
            account_id = path.split('/')[2]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            balances = self.get_balances(account_id)
            self.wfile.write(json.dumps(balances).encode())
        elif path == '/currentbalances':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            current_balances = self.get_current_balances()
            self.wfile.write(json.dumps(current_balances).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def get_accounts(self):
        conn = sqlite3.connect('balancebuddy.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name FROM accounts')
        accounts = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
        conn.close()
        return accounts

    def get_balances(self, account_id):
        conn = sqlite3.connect('balancebuddy.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, entry_date, balance FROM balance_entries WHERE account_id = ?', (account_id,))
        balances = [{'id': row[0], 'entry_date': str(row[1]), 'balance': row[2]} for row in cursor.fetchall()]
        conn.close()
        return balances

    def get_current_balances(self):
        conn = sqlite3.connect('balancebuddy.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT a.name, b.balance, b.entry_date
            FROM accounts a
            LEFT JOIN (
                SELECT account_id, balance, entry_date
                FROM balance_entries
                WHERE (account_id, entry_date) IN (
                    SELECT account_id, MAX(entry_date)
                    FROM balance_entries
                    GROUP BY account_id
                )
            ) b ON a.id = b.account_id
        ''')
        current_balances = [{'account_name': row[0], 'balance': row[1] if row[1] is not None else 0, 'last_updated': str(row[2]) if row[2] is not None else "No entries"} for row in cursor.fetchall()]
        conn.close()
        return current_balances

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
