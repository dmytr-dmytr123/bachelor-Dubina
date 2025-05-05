import sys
import os
import json
import joblib
import numpy as np
import warnings

from vectorizer import EventVectorizer
warnings.filterwarnings("ignore")

import numpy as np

def cosine_similarity_score(a, b):
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a, b)) / (norm_a * norm_b)


def recommend_events(user_profile, events, user_history, vectorizer, model=None, top_n=5):
    scored_events = []

    user_vec = vectorizer.transform_user_profile(user_profile)
    hist_vec = vectorizer.transform_user_history(user_history)
    has_history = np.any(hist_vec)

    for event in events:
        ev_vec = vectorizer.transform_event(event)

        if model and has_history:
            features = np.concatenate([user_vec, hist_vec, ev_vec])
            score = model.predict([features])[0]
        else:
            score = cosine_similarity_score(user_vec + hist_vec, ev_vec)

        scored_events.append({"event": event, "score": float(score)})

    scored_events.sort(key=lambda x: x["score"], reverse=True)
    return scored_events[:top_n]

def main():
    data = json.load(sys.stdin)
    user_profile = data.get("user_profile", {})
    events = data.get("events", [])
    user_history = data.get("user_history", [])

    if not events:
        print("No 'events' found in input.", file=sys.stderr)
        sys.exit(1)

    model = None
    vectorizer = None
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')

    if os.path.exists(model_path):
        try:
            vectorizer, model = joblib.load(model_path)
        except Exception as e:
            print(f"failed to load model: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        vectorizer = EventVectorizer()
        vectorizer.fit([{"user_profile": user_profile, "event": e} for e in events])

    user_profile_copy = dict(user_profile)
    attended = {ev.get("sportType") for ev in user_history if ev.get("sportType")}
    user_profile_copy["sports"] = list(set(user_profile_copy.get("sports", [])) | attended)

    recs = recommend_events(user_profile_copy, events, user_history, vectorizer, model)
    print(json.dumps({'recommendations': recs}, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
