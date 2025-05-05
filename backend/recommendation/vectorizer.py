import numpy as np
from datetime import datetime
def convert_time_to_day_period(time_str: str) -> str:
    try:
        hour = int(time_str.split(':')[0])
    except:
        return "unknown"
    if 5 <= hour < 12:
        return "morning"
    if 12 <= hour < 17:
        return "day"
    if 17 <= hour <= 22:
        return "evening"
    return "unknown"

class EventVectorizer:
    def __init__(self):
        self.sport_types = []
        self.skill_levels = []
        self.times_of_day = []
        self.locations = []

    def fit(self, interactions):
        sport_set, skill_set, time_set, loc_set = set(), set(), set(), set()
        for entry in interactions:
            up = entry.get('user_profile', {})
            sport_set.update(up.get('sports', []))
            if (level := up.get('skillLevel')):
                skill_set.add(level)
            time_set.update(up.get('timeOfDay', []))
            if (loc := up.get('location')):
                loc_set.add(loc)
            ev = entry.get('event', {})
            if (st := ev.get('sportType')):
                sport_set.add(st)
            if (lvl := ev.get('skillLevel')):
                skill_set.add(lvl)
            tod = ev.get('timeOfDay') or convert_time_to_day_period(ev.get('time', ''))
            time_set.add(tod)
            city = ev.get('venue', {}).get('location', {}).get('city') or ev.get('location')
            if city:
                loc_set.add(city)
        self.sport_types = sorted(sport_set)
        self.skill_levels = sorted(skill_set)
        self.times_of_day = sorted(time_set)
        self.locations = sorted(loc_set)

    def transform_user_profile(self, user_profile):
        vec = []
        for s in self.sport_types:
            vec.append(6 if s in user_profile.get('sports', []) else 0)
        for lvl in self.skill_levels:
            vec.append(3 if user_profile.get('skillLevel') == lvl else 0)
        for tod in self.times_of_day:
            vec.append(2 if tod in user_profile.get('timeOfDay', []) else 0)
        for loc in self.locations:
            vec.append(1 if user_profile.get('location') == loc else 0)
        return np.array(vec, dtype=float)



    def transform_event(self, event):
        vec = []
        for s in self.sport_types:
            vec.append(1 if event.get('sportType') == s else 0)
        for lvl in self.skill_levels:
            vec.append(1 if event.get('skillLevel') == lvl else 0)
        tod = event.get('timeOfDay') or convert_time_to_day_period(event.get('time', ''))
        for t in self.times_of_day:
            vec.append(1 if tod == t else 0)
        city = event.get('venue', {}).get('location', {}).get('city') or event.get('location')
        for loc in self.locations:
            vec.append(1 if city == loc else 0)
        return np.array(vec, dtype=float)




    def transform_user_history(self, history):
        if not history:
            return np.zeros(self._vector_dim(), dtype=float)

        vecs, weights = [], []
        for ev in history:
            v = self.transform_event(ev)
            date_str = ev.get("date")
            try:
                delta = (datetime.now() - datetime.fromisoformat(date_str)).days
                weight = 1 / (1 + delta) if delta >= 0 else 1
            except:
                weight = 1
            vecs.append(v)
            weights.append(weight)

        weighted = np.average(vecs, axis=0, weights=weights)
        return weighted

    def _vector_dim(self):
        return len(self.sport_types) + len(self.skill_levels) + len(self.times_of_day) + len(self.locations)