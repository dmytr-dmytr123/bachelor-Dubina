import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer

class EventVectorizer:
    def __init__(self):
        self.sports = []
        self.skill_levels = ["beginner", "intermediate", "advanced"]
        self.times_of_day = ["morning", "day", "evening"]
        self.locations = []
        self.genders = ["male", "female", "other"]
        self.embedding_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")
        self.category_maps = {}

    def fit(self, interactions):
        self.sports = sorted(list({entry['event']['sportType'] for entry in interactions}))
        self.locations = sorted(list({entry['event']['location'] for entry in interactions}))
        self.category_maps = {
            "sportType": {v: i for i, v in enumerate(self.sports)},
            "skillLevel": {v: i for i, v in enumerate(self.skill_levels)},
            "timeOfDay": {v: i for i, v in enumerate(self.times_of_day)},
            "location": {v: i for i, v in enumerate(self.locations)},
            "gender": {v: i for i, v in enumerate(self.genders)}
        }

    def category_index(self, value, name):
        return self.category_maps[name].get(value, -1)

    def scale_age(self, age):
        return age / 100.0

    def time_to_period(self, time_str):
        try:
            hour = int(time_str.split(":")[0])
            if 5 <= hour < 12:
                return "morning"
            elif 12 <= hour < 17:
                return "day"
            elif 17 <= hour <= 22:
                return "evening"
        except:
            pass
        return "unknown"

    def embed_text(self, text):
        return self.embedding_model.encode(text) if text else np.zeros(384)

    def transform_event(self, event):
        vec = [
            self.category_index(event["sportType"], "sportType"),
            self.category_index(event["skillLevel"], "skillLevel"),
            self.category_index(self.time_to_period(event["time"]), "timeOfDay"),
            self.category_index(event["location"], "location"),
        ]

        description = event.get("description", "") or event.get("title", "")
        embedding = self.embed_text(description)

        vec += list(embedding)
        return np.array(vec)


    def transform_user_profile(self, profile):
        gender_value = None
        if isinstance(profile.get("gender"), list):
            gender_value = profile["gender"][0] if profile["gender"] else "unknown"
        else:
            gender_value = profile.get("gender", "unknown")
        vec = [
            self.category_index(profile["sports"][0] if profile["sports"] else "", "sportType"),
            self.category_index(profile["skillLevel"], "skillLevel"),
            self.category_index(profile["timeOfDay"][0] if profile["timeOfDay"] else "", "timeOfDay"),
            self.category_index(profile["location"], "location"),
            self.category_index(gender_value, "gender"),
            self.scale_age(profile["age"]),
        ]
        return np.array(vec)

    def transform_user_history(self, history):
        if len(history) < 5:
            return np.zeros(388)
        now = datetime.now()
        vecs = []
        for ev in history:
            days_ago = (now - datetime.strptime(ev["date"], "%Y-%m-%d")).days
            weight = 1 / (1 + days_ago)
            vecs.append(self.transform_event(ev) * weight)
        return np.mean(vecs, axis=0)

    def transform_friends(self, event, friends_attended):
        from sklearn.metrics.pairwise import cosine_similarity

        target_vec = self.transform_event(event).reshape(1, -1)

        sims = []
        for i, ev in enumerate(friends_attended):
            try:
                f_vec = self.transform_event(ev).reshape(1, -1)
                if -1 in f_vec:
                    print(f"invalid friend event #{i} with -1s: {ev}", file=sys.stderr)
                    continue

                sim = cosine_similarity(target_vec, f_vec)[0][0]
                print(f"FriendSim sim with event {ev.get('title', '?')}: {sim:.4f}", file=sys.stderr)
                sims.append(sim)
            except Exception as e:
                print(f"FriendSim ERROR friend event #{i} failed: {str(e)}", file=sys.stderr)

        avg_sim = np.mean(sims) if sims else 0.0
        print(f"FriendSim avg similarity: {avg_sim:.4f}", file=sys.stderr)
        return [avg_sim]

