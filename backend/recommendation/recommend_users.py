import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from user_vectorizer import UserVectorizer

def recommend_users(profile, users, top_n=5):
    vectorizer = UserVectorizer()
    vectorizer.fit(users)

    profile_vec = vectorizer.transform_user(profile).reshape(1, -1)

    scored_users = []

    for user in users:
        user_vec = vectorizer.transform_user(user).reshape(1, -1)
        score = cosine_similarity(profile_vec, user_vec)[0][0]
        scored_users.append({
            "_id": user["_id"],
            "email": user.get("email"),
            "score": float(score)
        })

    scored_users.sort(key=lambda x: x["score"], reverse=True)
    return scored_users[:top_n]
