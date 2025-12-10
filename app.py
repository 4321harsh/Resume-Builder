from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import os, json, base64
from datetime import timedelta

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(APP_ROOT, 'users.json')
SAVE_DIR = os.path.join(APP_ROOT, 'saved_resumes')

app = Flask(__name__)
app.secret_key = 'change_this_to_a_random_secret'
app.permanent_session_lifetime = timedelta(days=7)

# Create required files and folders
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

os.makedirs(SAVE_DIR, exist_ok=True)

def load_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email','').strip().lower()
        password = request.form.get('password')

        users = load_users()
        user = users.get(email)

        if user and check_password_hash(user['pw_hash'], password):
            session.permanent = True
            session['user'] = email
            return redirect(url_for('welcome'))

        return render_template('login.html', error='Invalid email or password.')
    
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    name = request.form.get('name','').strip()
    email = request.form.get('email','').strip().lower()
    password = request.form.get('password')

    if not email or not password:
        return render_template('login.html', error='Email and password required.')

    users = load_users()

    if email in users:
        return render_template('login.html', error='User already exists.')

    users[email] = {
        'name': name,
        'pw_hash': generate_password_hash(password)
    }
    save_users(users)

    os.makedirs(os.path.join(SAVE_DIR, email), exist_ok=True)

    session['user'] = email
    return redirect(url_for('welcome'))

@app.route('/welcome')
def welcome():
    if 'user' not in session:
        return redirect(url_for('login'))

    email = session['user']
    user_dir = os.path.join(SAVE_DIR, email)
    os.makedirs(user_dir, exist_ok=True)

    files = sorted(os.listdir(user_dir), reverse=True)

    return render_template('welcome.html', files=files, user=email)

@app.route('/form')
def form_page():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('form.html', user=session['user'])

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route('/save_resume', methods=['POST'])
def save_resume():
    if 'user' not in session:
        return jsonify({'error':'Not logged in.'}), 401

    email = session['user']
    data = request.get_json()

    filename = data.get('filename', 'resume.pdf')
    pdf_b64 = data.get('pdf_base64', '')

    if ',' in pdf_b64:
        pdf_b64 = pdf_b64.split(',',1)[1]

    pdf_bytes = base64.b64decode(pdf_b64)

    user_dir = os.path.join(SAVE_DIR, email)
    os.makedirs(user_dir, exist_ok=True)

    safe_name = filename.replace('/', '_').replace('\\', '_')
    path = os.path.join(user_dir, safe_name)

    with open(path, 'wb') as f:
        f.write(pdf_bytes)

    return jsonify({'ok': True, 'filename': safe_name})

@app.route('/saved_resumes/<user>/<filename>')
def serve_resume(user, filename):
    if 'user' not in session:
        return redirect(url_for('login'))
    
    if session['user'] != user:
        return "Not allowed", 403

    return send_from_directory(os.path.join(SAVE_DIR, user), filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
