import os
import joblib
import json
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

from vectorizer import EventVectorizer
from semantic_helper import SemanticEmbeddingHelper
from time_decay import get_time_weight

def train_model(interactions, model_path='model.pkl'):
    vectorizer = EventVectorizer()
    vectorizer.fit(interactions)

    semantic = SemanticEmbeddingHelper()

    X, y = [], []
    for entry in interactions:
        user_profile = entry['user_profile']
        history = entry.get('user_history', [])
        event = entry['event']
        label = entry.get('score', 0)

        up_vec = vectorizer.transform_user_profile(user_profile)
        hist_vec = vectorizer.transform_user_history(history)
        ev_vec = vectorizer.transform_event(event)

        ev_sem = semantic.encode_event(event)
        joint_sem = semantic.encode_joint_user_event(user_profile, event)
        
        #attended time weight
        desc_vecs, weights = [], []
        for ev in history:
            desc_vec = semantic.encode_event(ev)
            w = get_time_weight(ev.get("date", ""))
            desc_vecs.append(desc_vec)
            weights.append(w)
        hist_sem = np.average(desc_vecs, axis=0, weights=weights) if desc_vecs else np.zeros_like(ev_sem)

        feature = np.concatenate([up_vec, hist_vec, ev_vec, ev_sem, joint_sem, hist_sem])
        X.append(feature)
        y.append(label)

    X = np.array(X)
    y = np.array(y)

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    model = lgb.LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.03,
        num_leaves=128,
        max_depth=-1,
        reg_lambda=1.0,
        random_state=42
    )

    model.fit(X_train, y_train)

    try:
        y_pred = model.predict(X_val)
        mse = mean_squared_error(y_val, y_pred)
    except:
        mse = None

    print(f"Sample feature vector length: {len(X[0])}")
    joblib.dump((vectorizer, semantic, model), model_path)
    return mse
