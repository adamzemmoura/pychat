import uuid

class Message:

    def __init__(self, timestamp, body, author):
        self.timestamp = timestamp
        self.body = body
        self.author = author
        self.uuid = str(uuid.uuid4())

    def get_id(self):
        return self.uuid

    def get_body(self):
        return self.body

    def get_author(self):
        return self.author

    def get_timestamp(self):
        return self.timestamp

    def convert_to_dict(self):
        dict = {
            'id': self.uuid,
            'timestamp': self.timestamp,
            'body': self.body,
            'author': self.author,
        }
        return dict
