import pandas as pd
import psycopg2
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

# PostgreSQL connection settings
DB_SETTINGS = {
    'dbname': 'reusecampus',
    'user': 'reusecampus',
    'password': '(Dm)36921',
    'host': 'localhost',
    'port': '5432'
}

def fetch_items():
    conn = psycopg2.connect(**DB_SETTINGS)
    query = "SELECT id, title, description, category FROM items WHERE category IS NOT NULL"
    items_df = pd.read_sql(query, conn)
    conn.close()
    return items_df

def train_item_categorization_model():
    items_df = fetch_items()

    # TF-IDF vectorization of categories
    vectorizer = TfidfVectorizer()
    category_matrix = vectorizer.fit_transform(items_df['category'])

    # Save model and data
    model_data = {
        'vectorizer': vectorizer,
        'items_df': items_df
    }

    joblib.dump(model_data, 'item_categorization_model.joblib')
    print("✅ item_categorization_model.joblib trained and saved successfully.")

if __name__ == "__main__":
    train_item_categorization_model()