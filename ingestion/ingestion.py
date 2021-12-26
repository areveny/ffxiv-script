import csv
import os
import glob
import ingestion_db

class Ingestion():

    def __init__(self, ingestion_db: ingestion_db.SqliteIngestionDB):
        self.ingestion_db = ingestion_db

    def get_quest_files(self):
        files = glob.glob('raw-data/quest/*/*.csv')
        files.sort()

        quest_files = list()
        for path in files:
            _, _, dir, filename = path.split(os.path.sep)
            quest_files.append((path, dir, filename))

        return quest_files

    def process_file(self, quest_file):
        path, dir, filanme = quest_file
        with open(path, 'r') as f:
            reader = csv.reader(f, delimiter=',', quotechar='"')
            cur_row = next(reader)
            while cur_row[0] != '0':
                cur_row = next(reader)
                
            data_rows = list()
            for row in reader:
                id, label, text = row
                split_label = label.split('_')
                if len(split_label) == 6:
                    text_type, quest_label, quest_id, speaker, _, text_line = split_label
                    full_quest_id = '_'.join((quest_label.lower(), quest_id))
                    speaker = speaker.capitalize()
                    data_rows.append((full_quest_id, speaker, text))
                elif len(split_label) == 5:
                    continue # Character response
        self.ingestion_db.upload_lines(data_rows)

if __name__ == '__main__':
    ingestion_db = ingestion_db.SqliteIngestionDB('../query-service/ffxiv.db')
    ingest = Ingestion(ingestion_db)
    quest_files = ingest.get_quest_files()
    for quest_file in quest_files:
        ingest.process_file(quest_file)