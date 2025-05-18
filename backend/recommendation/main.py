import json
import sys
import os
from recommend_ranked import recommend_events
from recommend_users import recommend_users

def main():
    try:
        input_str = sys.stdin.read()
        if not input_str.strip():
            raise ValueError("Empty input")
        data = json.loads(input_str)
    except Exception as e:
        print(json.dumps({"error": f"Failed to parse input: {str(e)}"}))
        sys.exit(1)

    mode = data.get("mode", "events")

    #choses mode(users or events)
    if mode == "users":
        try:
            profile = data.get("profile", {})
            users = data.get("events", []) 
            result = recommend_users(profile, users)
            print(json.dumps({ "recommended_users": result }))
        except Exception as e:
            print(json.dumps({"error": f"User recommendation error: {str(e)}"}))
            sys.exit(1)

    elif mode == "events":
        try:
            profile = data.get("profile", {})
            events = data.get("events", [])
            history = data.get("history", [])
            friends = data.get("friends", [])
            result = recommend_events(profile, events, history, friends)
            print(json.dumps({ "recommendations": result }))
        except Exception as e:
            print(json.dumps({"error": f"Event recommendation error: {str(e)}"}))
            sys.exit(1)

    else:
        print(json.dumps({"error": f"unsupported mode: {mode}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
