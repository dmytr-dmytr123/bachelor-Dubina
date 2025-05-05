import os
import json
import joblib
import numpy as np
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

from vectorizer import EventVectorizer
from time_decay import get_time_weight

def train_model(interactions, model_path='model.pkl'):
    vectorizer = EventVectorizer()
    vectorizer.fit(interactions)

    X, y = [], []

    for entry in interactions:
        user_profile = entry['user_profile']
        history = entry.get('user_history', [])
        event = entry['event']
        label = entry.get('score', 0)

        up_vec = vectorizer.transform_user_profile(user_profile)
        hist_vec = vectorizer.transform_user_history(history)
        ev_vec = vectorizer.transform_event(event)

        feature = np.concatenate([up_vec, hist_vec, ev_vec])
        X.append(feature)
        y.append(label)

    X, y = np.array(X), np.array(y)
    print(f"Training on {len(X)} samples with vector size {X.shape[1]}")

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LGBMRegressor(n_estimators=500, learning_rate=0.05)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_val)
    mse = mean_squared_error(y_val, y_pred)

    print(f"Saving model to {model_path}")
    joblib.dump((vectorizer, model), model_path)
    print(f"Model trained. MSE: {mse:.4f}")
    return mse

if __name__ == "__main__":
    data_path = "interactions.json"

    if not os.path.exists(data_path):
        print(f"error file '{data_path}' not found.")
        exit(1)

    with open(data_path, "r", encoding="utf-8") as f:
        interactions = json.load(f)

    print(f"loaded {len(interactions)} interaction samples")
    train_model(interactions)
