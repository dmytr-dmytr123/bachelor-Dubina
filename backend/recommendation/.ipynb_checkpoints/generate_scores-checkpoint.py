import json
import numpy as np
from vectorizer import EventVectorizer

def compute_score(user_profile, user_history, event, vectorizer):
    profile_vec = vectorizer.transform_user_profile(user_profile)
    history_vec = vectorizer.transform_user_history(user_history)
    event_vec = vectorizer.transform_event(event)

    full_user_vec = profile_vec + history_vec
    norm_user = np.linalg.norm(full_user_vec)
    norm_event = np.linalg.norm(event_vec)

    if norm_user == 0 or norm_event == 0:
        return 0.0

    cosine_sim = float(np.dot(full_user_vec, event_vec)) / (norm_user * norm_event)
    return round(max(0.0, min(1.0, cosine_sim)), 4)

# Завантажуємо дані
with open("interactions.json", "r") as f:
    interactions = json.load(f)

# Створюємо і навчаємо векторизатор
vectorizer = EventVectorizer()
vectorizer.fit(interactions)

# Додаємо score
for entry in interactions:
    score = compute_score(entry["user_profile"], entry.get("user_history", []), entry["event"], vectorizer)
    entry["score"] = score

# Зберігаємо оновлений файл
with open("interactions_scored.json", "w") as f:
    json.dump(interactions, f, indent=2, ensure_ascii=False)

print("✅ interactions_scored.json готовий зі score від 0 до 1.")
