import json
import joblib
from user_vectorizer import UserVectorizer

def train_user_vectorizer(user_profiles, output_path='user_vectorizer.pkl'):
    vectorizer = UserVectorizer()
    vectorizer.fit(user_profiles)
    joblib.dump(vectorizer, output_path)

if __name__ == "__main__":
    with open("user_profiles.json", "r") as f:
        users = json.load(f)
    train_user_vectorizer(users)
