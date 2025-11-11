from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import os
SECRET_KEY = os.getenv('JWT_SECRET_KEY')
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from sqlalchemy import create_engine
import jwt  # Make sure you have PyJWT installed
  # Adjust as needed

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Load models
model_dir = os.path.dirname(__file__)
location_model = joblib.load(os.path.join(model_dir, 'location_model.joblib'))


# Data placeholders
user_item_matrix = pd.DataFrame()
item_details = pd.DataFrame()
locations = pd.DataFrame(columns=['item_id', 'latitude', 'longitude'])


# PostgreSQL connection settings


DB_SETTINGS = {
    'dbname': 'reusecampus',
    'user': 'reusecampus',
    'password': '(Dm)36921',
    'host': 'localhost',
    'port': '5432'
}

def get_sqlalchemy_engine():
    db_url = f"postgresql://{DB_SETTINGS['user']}:{DB_SETTINGS['password']}@{DB_SETTINGS['host']}:{DB_SETTINGS['port']}/{DB_SETTINGS['dbname']}"
    return create_engine(db_url)



try:
    model_data = joblib.load('item_categorization_model.joblib')
    items_df = model_data['items_df']
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    items_df = None  # fallback to avoid crash

@app.route('/categorized-items', methods=['GET'])
def get_categorized_items():
    if items_df is None:
        return jsonify({"error": "Model data not available"}), 500

    grouped = items_df.sort_values(by='category').groupby('category')
    result = {
        category: group[['id', 'title', 'description']].to_dict(orient='records')
        for category, group in grouped
    }
    return jsonify(result)




@app.route('/recommendations', methods=['GET'])
def recommend():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Missing token'}), 401

    try:
        token = token.split(" ")[1] if " " in token else token
        decoded = jwt.decode(token, 'supersecretkey', algorithms=['HS256'])
        user_id = decoded.get('id')

        print("Token received:", token)
        print("Decoded user ID:", user_id)

        if not user_id:
            return jsonify({'error': 'Invalid token: missing user ID'}), 400

        # Connect to DB
        engine = get_sqlalchemy_engine()

        # Get user interests
        user_query = "SELECT interests FROM users WHERE id = %s LIMIT 1"
        user_df = pd.read_sql(user_query, engine, params=(user_id,))
        if user_df.empty or not user_df.iloc[0]['interests']:
            return jsonify({'error': 'User interests not found'}), 404

        interests_text = user_df.iloc[0]['interests']

        # Load trained model
        model_data = joblib.load(os.path.join(model_dir, 'recommendation_model.joblib'))
        vectorizer = model_data['vectorizer']

        # ✅ Use only live items from DB
        live_items_query = "SELECT id AS item_id, title, description, category FROM items"
        items_df = pd.read_sql(live_items_query, engine)

        # Transform interests and item categories
        interest_vector = vectorizer.transform([interests_text])
        item_vectors = vectorizer.transform(items_df['category'])

        # Compute similarity scores
        similarity_scores = cosine_similarity(interest_vector, item_vectors).flatten()

        # Filter based on similarity
        matching_indices = [i for i, score in enumerate(similarity_scores) if score > 0.01]
        recommended_items = items_df.iloc[matching_indices].drop_duplicates(subset=['item_id'])

        print("User interests:", interests_text)
        print("Matched items count:", len(recommended_items))

        return jsonify({'items': recommended_items.to_dict(orient='records')})
    except Exception as e:
        print("Recommendation error:", str(e))
        return jsonify({'error': str(e)}), 500

    
@app.route('/nearby', methods=['POST'])
def nearby():
    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')

    if lat is None or lon is None:
        return jsonify({'error': 'Missing coordinates'}), 400

    try:
        distances, indices = location_model.kneighbors([[lat, lon]])
        nearby_items = locations.iloc[indices[0]]['item_id'].tolist()
        return jsonify({'items': nearby_items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/items', methods=['POST'])
def post_item():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Missing token'}), 401
        token = token.split(" ")[1] if " " in token else token
        decoded = jwt.decode(token, 'supersecretkey', algorithms=['HS256'])
        user_id = decoded.get('id')
        poster_name = decoded.get('full_name')

        title = request.form.get('title')
        description = request.form.get('description')
        exchange_condition = request.form.get('exchangeCondition')
        category = request.form.get('category')
        location = request.form.get('location')
        image = request.files.get('image')

        if not all([title, description, exchange_condition, category, location, image]):
            return jsonify({'error': 'Missing required fields'}), 400

        filename = secure_filename(image.filename)
        image = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        image.save(image)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO items (title, description, exchange_condition, category, location, image, user_id, poster_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (title, description, exchange_condition, category, location, image, user_id, poster_name))
        item_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Item posted successfully!', 'item_id': item_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/log_item', methods=['POST'])
def log_item():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        category = data.get('category')
        location = data.get('location')
        description = data.get('description')
        title = data.get('title')
        exchange_condition = data.get('exchange_condition')
        poster_name = data.get('poster_name')

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO item_logs (user_id, item_id, category, location, description, title, exchange_condition, poster_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, item_id, category, location, description, title, exchange_condition, poster_name))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Item log saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/items', methods=['GET'])
def get_all_items():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Missing token'}), 401

        token = token.split(" ")[1] if " " in token else token
        decoded = jwt.decode(token, 'supersecretkey', algorithms=['HS256'])
        user_id = decoded.get('id')

        print("Token received:", token)
        print("Decoded user ID:", user_id)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all items from the database
        cursor.execute("""
            SELECT id, title, description, exchange_condition, category, location, image, poster_name
            FROM items
        """)
        rows = cursor.fetchall()

        # Convert rows to dictionaries
        columns = [desc[0] for desc in cursor.description]
        items = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        conn.close()

        return jsonify({'items': items})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Internal server error'}), 500
    
if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True, port=5001)