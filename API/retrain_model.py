import pandas as pd
import psycopg2
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname='reusecampus',
    user='reusecampus',
    password='(Dm)36921',
    host='localhost',
    port='5432'
)

# Load users and items
users_df = pd.read_sql("SELECT id, interests FROM users WHERE interests IS NOT NULL", conn)
items_df = pd.read_sql("SELECT id, category, title, description FROM items", conn)

conn.close()

# Preprocess text
users_df['interests'] = users_df['interests'].fillna('').astype(str)
items_df['category'] = items_df['category'].fillna('').astype(str)

# Combine item category, title, and description for better matching
items_df['text'] = items_df['category'] + ' ' + items_df['title'] + ' ' + items_df['description']

# Vectorize using TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
item_vectors = vectorizer.fit_transform(items_df['text'])

# Create a dictionary to store recommendations
recommendations = {}

for _, user in users_df.iterrows():
    user_vector = vectorizer.transform([user['interests']])
    similarity_scores = cosine_similarity(user_vector, item_vectors).flatten()
    top_indices = similarity_scores.argsort()[::-1][:10]  # Top 10 recommendations
    recommended_items = items_df.iloc[top_indices]['id'].tolist()
    recommendations[user['id']] = recommended_items

# Save the model and recommendations
joblib.dump({
    'vectorizer': vectorizer,
    'item_vectors': item_vectors,
    'items_df': items_df,
    'recommendations': recommendations
}, 'recommendation_model.joblib')

print("Model trained and saved as 'recommendation_model.joblib'")
