
import pandas as pd
import joblib
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# --- Database Configuration ---
DB_USER = 'reusecampus'
DB_PASSWORD = '(Dm)36921)'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'reusecampus'

# Create SQLAlchemy engine
DATABASE_URL = f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(DATABASE_URL)

# --- SQL Query ---
query = """
SELECT 
    u.id AS user_id,
    COUNT(DISTINCT i.id) AS items_posted,
    COUNT(DISTINCT ex.id) AS exchanges_made,
    COUNT(CASE WHEN ex.status = 'completed' THEN 1 END) AS completed_exchanges,
    COALESCE(p.total_points, 0) AS total_points
FROM users u
LEFT JOIN items i ON u.id = i.user_id
LEFT JOIN (
    SELECT 
        e.id, 
        i.user_id AS owner_id, 
        e.requester_id, 
        e.status        
    FROM exchanges e
    JOIN items i ON e.item_id = i.id::uuid
) ex ON u.id = ex.requester_id OR u.id = ex.owner_id
LEFT JOIN eco_points p ON u.id = p.user_id
GROUP BY u.id, p.total_points;
"""

# --- Load Data into DataFrame and Train Model ---
try:
    df = pd.read_sql(query, engine)
    print("Training data loaded successfully:")
    print(df.head())

    # Prepare features and target
    X = df[['items_posted', 'exchanges_made', 'completed_exchanges']]
    y = df['total_points']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train regression model
    model = RandomForestRegressor(random_state=42)
    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f"Model trained. Mean Squared Error on test set: {mse:.2f}")

    # Save model
    joblib.dump(model, 'eco_model.joblib')
    print("Model saved to 'eco_model.joblib'.")

except Exception as e:
    print("Error during model training:", e)
