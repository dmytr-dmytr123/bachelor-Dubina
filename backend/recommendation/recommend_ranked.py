import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import os
from event_vectorizer import EventVectorizer

model_path = os.path.join(os.path.dirname(__file__), "lgbm_model.pkl")
vectorizer, model, kmeans, scaler = joblib.load(model_path)

def recommend_events(profile, events, history=[], friends=[]):
    results = []

    try:
        p_vec = vectorizer.transform_user_profile(profile)
        if len(history) < 5:
            h_vec = np.zeros(388)
            cluster = [0]
            cold_start_mode = True
        else:
            h_vec = vectorizer.transform_user_history(history)
            user_cluster_input = np.concatenate([p_vec, h_vec])
            cluster = [kmeans.predict([user_cluster_input])[0]]
            cold_start_mode = False
    except Exception as e:
        raise ValueError(f"User vectorization error: {str(e)}")

    for ev in events:
        try:
            e_vec = vectorizer.transform_event(ev)

            if cold_start_mode:
                sim = cosine_similarity(p_vec.reshape(1, -1), e_vec[:len(p_vec)].reshape(1, -1))[0][0]
                score = float(sim)
            else:
                friend_vecs = [vectorizer.transform_event(fev) for fev in friends if fev]
                if friend_vecs:
                    avg_friend_vec = np.mean(friend_vecs, axis=0).reshape(1, -1)
                    sim = cosine_similarity(avg_friend_vec, e_vec.reshape(1, -1))[0][0]
                else:
                    sim = 0.0

                full_vec = np.concatenate([
                    p_vec * 5,
                    h_vec * 4,
                    e_vec * 2,
                    [sim * 2],
                    cluster
                ])

                if -1 in full_vec:
                    continue

                full_vec_scaled = scaler.transform([full_vec])
                score = model.predict(full_vec_scaled)[0]

            results.append({
                "event_id": ev.get("_id", ev.get("title", "?")),
                "score": float(score)
            })
        except Exception as e:
            continue

    results = sorted(results, key=lambda x: x["score"], reverse=True)[:5]
    return results
