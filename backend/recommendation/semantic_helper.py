import numpy as np
from sentence_transformers import SentenceTransformer

class SemanticEmbeddingHelper:
    def __init__(self, model_name='paraphrase-multilingual-MiniLM-L12-v2'):
        self.model = SentenceTransformer(model_name)

    def encode_event(self, event):
        return self.model.encode(event.get('description', ''))

    def encode_joint_user_event(self, user_profile, event):
        user_desc = user_profile.get("description", "")
        event_desc = event.get("description", "")
        joint_text = f"{user_desc} [SEP] {event_desc}"
        return self.model.encode(joint_text)
