import sqlite3 

class IngestionDB():

    def can_process_object(self, object):
        raise NotImplemented

    def process_object(self, object):
        raise NotImplemented

class SqliteIngestionDB(IngestionDB):

    def __init__(self, db_file):
        self.db_file = db_file
        self.initialize()

    def initialize(self):
        con = sqlite3.connect(self.db_file)
        with con:
            con.execute("""DROP TABLE IF EXISTS lines;""")
            con.execute("""CREATE TABLE lines (
            quest_id TEXT,
            speaker TEXT,
            text TEXT
            );
            """)
            con.execute("""CREATE INDEX quest_id ON lines (quest_id, speaker);""")
            con.execute("""CREATE INDEX speaker ON lines (speaker, quest_id);""")
        con.close()

    def upload_lines(self, db_values):
        con = sqlite3.connect(self.db_file)
        with con:
            con.executemany('INSERT OR REPLACE INTO lines (quest_id, speaker, text) VALUES (?, ?, ?)', db_values)
        con.close()

if __name__ == '__main__':
    con = sqlite3.connect('../query-service/ffxiv.db')
    
