import numpy as np

class UserVectorizer:
    def __init__(self):
        self.sport_types = []
        self.skill_levels = []
        self.times_of_day = []
        self.locations = []

    def fit(self, users):
        sport_set, level_set, time_set, loc_set = set(), set(), set(), set()
        for u in users:
            sport_set.update(u.get("sports", []))
            if (lvl := u.get("skillLevel")):
                level_set.add(lvl)
            time_set.update(u.get("timeOfDay", []))
            if (loc := u.get("location")):
                loc_set.add(loc)

        self.sport_types = sorted(sport_set)
        self.skill_levels = sorted(level_set)
        self.times_of_day = sorted(time_set)
        self.locations = sorted(loc_set)

    def transform_user(self, user):
        vec = []
        for s in self.sport_types:
            vec.append(5 if s in user.get("sports", []) else 0)
        for lvl in self.skill_levels:
            vec.append(3 if user.get("skillLevel") == lvl else 0)
        for tod in self.times_of_day:
            vec.append(2 if tod in user.get("timeOfDay", []) else 0)
        for loc in self.locations:
            vec.append(1 if user.get("location") == loc else 0)
        return np.array(vec, dtype=float)
