import sys
import joblib
import numpy as np

# Load model
model = joblib.load('eco_model.pkl')

# Read inputs
items_posted = int(sys.argv[1])
exchanges_made = int(sys.argv[2])

# Predict
features = np.array([[items_posted, exchanges_made]])
predicted_points = model.predict(features)[0]

print(predicted_points)