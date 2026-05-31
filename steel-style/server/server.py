import json
import os
import hashlib
import secrets
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory, session, make_response

app = Flask(__name__, static_folder='public', static_url_path='')
app.secret_key = 'steel-style-admin-secret-2025'

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
ADMIN_PASS = 'admin123'

with open(os.path.join(DATA_DIR, 'products.json'), encoding='utf-8') as f:
    products = json.load(f)

with open(os.path.join(DATA_DIR, 'paints.json'), encoding='utf-8') as f:
    paints = json.load(f)


def load_messages():
    path = os.path.join(DATA_DIR, 'messages.json')
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_messages(messages):
    path = os.path.join(DATA_DIR, 'messages.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


@app.route('/api/products')
def get_products():
    result = list(products)
    series = request.args.get('series')
    sort = request.args.get('sort')
    if series and series != 'all':
        result = [p for p in result if p.get('series') == series]
    if sort == 'name-asc':
        result.sort(key=lambda p: p['name'])
    elif sort == 'name-desc':
        result.sort(key=lambda p: p['name'], reverse=True)
    return jsonify(result)


@app.route('/api/products/<int:pid>')
def get_product(pid):
    for p in products:
        if p['id'] == pid:
            return jsonify(p)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/paints')
def get_paints():
    return jsonify(paints)


@app.route('/api/contact', methods=['POST'])
def post_contact():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    if not name or not phone:
        return jsonify({'error': 'Name and phone required'}), 400
    entry = {
        'name': name,
        'phone': phone,
        'email': email if email else '-',
        'message': data.get('message', data.get('msg', '-')),
        'product': data.get('product', '-'),
        'date': datetime.now().isoformat(),
    }
    messages = load_messages()
    messages.append(entry)
    save_messages(messages)
    print(f'[CONTACT] {name} - {phone}' + (f' [PRODUCT: {entry["product"]}]' if entry['product'] != '-' else ''))
    return jsonify({'success': True, 'message': 'Спасибо! Мы свяжемся с вами в ближайшее время.'})


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if data and data.get('password') == ADMIN_PASS:
        session['admin'] = True
        return jsonify({'success': True})
    return jsonify({'error': 'Неверный пароль'}), 403


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('admin', None)
    return jsonify({'success': True})


@app.route('/api/messages')
def api_messages():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(load_messages())


def send_page(name):
    resp = make_response(send_from_directory(app.static_folder, name))
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return resp


@app.route('/')
def index():
    return send_page('index.html')


@app.route('/catalog')
def catalog_page():
    return send_page('catalog.html')


@app.route('/about')
def about_page():
    return send_page('about.html')


@app.route('/painting')
def painting_page():
    return send_page('painting.html')


@app.route('/dealers')
def dealers_page():
    return send_page('dealers.html')


@app.route('/contacts')
def contacts_page():
    return send_page('contacts.html')


@app.route('/product')
def product_page():
    return send_page('product.html')


@app.route('/admin')
def admin_page():
    return send_page('admin.html')


@app.route('/pvkh-plenki')
def pvkh_page():
    return send_page('pvkh-plenki.html')


@app.route('/naruzhnaya-otdelka')
def naruzhnaya_page():
    return send_page('naruzhnaya-otdelka.html')


@app.route('/dveri-na-zakaz')
def dveri_page():
    return send_page('dveri-na-zakaz.html')


@app.route('/garantiya')
def garantiya_redirect():
    return send_page('about.html')


@app.route('/vnutrennyaya-otdelka')
def inner_finish_redirect():
    return send_page('painting.html')


@app.route('/vidy-pokraski')
def vidy_pokraski_redirect():
    return send_page('painting.html')


@app.route('/proizvodstvo')
def proizvodstvo_redirect():
    return send_page('about.html')


@app.route('/vakansii')
def vakansii_redirect():
    return send_page('about.html')


@app.route('/sertifikat')
def sertifikat_redirect():
    return send_page('about.html')


@app.route('/o-kompanii')
def o_kompanii_redirect():
    return send_page('about.html')


@app.route('/dileram')
def dileram_redirect():
    return send_page('dealers.html')


@app.route('/kontakty')
def kontakty_redirect():
    return send_page('contacts.html')


@app.route('/katalog')
def katalog_redirect():
    return send_page('catalog.html')


@app.route('/<path:path>')
def static_files(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        resp = make_response(send_from_directory(app.static_folder, path))
        if path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp')):
            resp.headers['Cache-Control'] = 'public, max-age=86400'
        elif path.endswith(('.css', '.js')):
            resp.headers['Cache-Control'] = 'public, max-age=3600'
        else:
            resp.headers['Cache-Control'] = 'no-cache'
        return resp
    return send_page('index.html')


if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    print('\n  [OK] Стальной Стиль — сервер запущен')
    print('  ' + '-' * 31)
    print('  >> http://localhost:3000')
    print('  >> API:  http://localhost:3000/api')
    print('  >> Admin: http://localhost:3000/admin')
    print('\n  Страницы: /catalog /about /painting /pvkh-plenki /naruzhnaya-otdelka /dveri-na-zakaz /dealers /contacts /product')
    print('  Старые URL: /garantiya /vidy-pokraski /proizvodstvo /vakansii /sertifikat /o-kompanii /dileram /kontakty /vnutrennyaya-otdelka')
    print('\n  Нажмите Ctrl+C для остановки\n')
    app.run(host='0.0.0.0', port=3000, debug=True)
