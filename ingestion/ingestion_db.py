import sqlite3 

class IngestionDB():

    def can_process_object(self, object):
        raise NotImplemented

    def process_object(self, object):
        raise NotImplemented

class SqliteIngestionDB(IngestionDB):

    def __init__(self, db_file, initialize=True):
        self.db_file = db_file
        if initialize:
            self.initialize()

    def initialize(self):
        con = sqlite3.connect(self.db_file)
        self.initialize_lines(con)
        self.initialize_quests(con)
        self.initialize_places(con)
        con.close()

    def initialize_lines(self, con):
        con.execute("""DROP TABLE IF EXISTS lines;""")
        con.execute("""CREATE TABLE lines (
        quest_id TEXT,
        speaker TEXT,
        text TEXT
        );
        """)
        con.execute("""CREATE INDEX quest_id ON lines (quest_id, speaker);""")
        con.execute("""CREATE INDEX speaker ON lines (speaker, quest_id);""")

    def initialize_quests(self, con):
        con.execute("""DROP TABLE IF EXISTS quests;""")
        con.execute("""CREATE TABLE quests (
        quest_id TEXT,
        quest_name TEXT,
        level INTEGER,
        place_id INTEGER
        );
        """)
        con.execute("""CREATE INDEX quest_id_quests ON quests (quest_id);""")
        con.execute("""CREATE INDEX level ON quests (level, place_id);""")
        con.execute("""CREATE INDEX place ON quests (place_id, level);""")

    def initialize_places(self, con):
        con.execute("""DROP TABLE IF EXISTS places;""")
        con.execute("""CREATE TABLE places (
        place_id INTEGER,
        place_name TEXT
        );
        """)
        con.execute("""CREATE INDEX place_id ON places (place_id);""")



    def upload_lines(self, db_values):
        con = sqlite3.connect(self.db_file)
        with con:
            con.executemany('INSERT OR REPLACE INTO lines (quest_id, speaker, text) VALUES (?, ?, ?)', db_values)
        con.close()

    def upload_quests(self, quest_values):
        con = sqlite3.connect(self.db_file)
        with con:
            con.executemany('INSERT OR REPLACE INTO quests (quest_id, quest_name, level, place_id) VALUES (?, ?, ?, ?)', quest_values)
        con.close()

    def upload_places(self, place_values):
        con = sqlite3.connect(self.db_file)
        with con:
            con.executemany('INSERT OR REPLACE INTO places (place_id, place_name) VALUES (?, ?)', place_values)
        con.close()


if __name__ == '__main__':
    con = sqlite3.connect('../query-service/ffxiv.db')

    lines_by_quest_id = 'select * from lines WHERE quest_id="clshrv530_02049" ORDER BY rowid'
    lines_by_speaker = 'select * from lines WHERE speaker="Lyse" ORDER BY rowid'
    lines_by_speaker_and_text = 'select * from lines WHERE speaker="Lyse" AND TEXT like "%charging about%" ORDER BY rowid'
    quests = 'select * from quests WHERE quest_id="clshrv530_02049" ORDER BY rowid'

    join_query = 'select * from lines, quests WHERE lines.quest_id = quests.quest_id and quests.quest_id="clshrv530_02049" ORDER BY lines.rowid LIMIT 10'
    results = con.execute(join_query).fetchall()
    print(results)
    
