def extract_user_profile(user):
    return {
        "sports": user.get("preferences", {}).get("sports", []),
        "skillLevel": user.get("preferences", {}).get("skillLevel"),
        "timeOfDay": user.get("preferences", {}).get("timeOfDay", []),
        "location": user.get("preferences", {}).get("location")
    }