import csv
import os
import glob
import ingestion_db

class Ingestion():

    def __init__(self, ingestion_db: ingestion_db.SqliteIngestionDB):
        self.ingestion_db = ingestion_db
        # self.process_quests('raw-data/quest/*/*.csv')
        # self.process_quest_dir('raw-data/Quest.csv')
        # self.process_place_dir('raw-data/PlaceName.csv')

    def process_quests(self, quest_glob):
        quest_files = self.get_quest_files(quest_glob)
        processed = 0
        for quest_file in quest_files:
            self.process_file(quest_file)
            processed = processed + 1
            print('Ingested ({}/{}) quest CSVs into DB.'.format(processed, len(quest_files)), end='\r', flush=True)
        print('\nDone processing individual quest texts.')

    def get_quest_files(self, quest_glob_string):
        files = glob.glob(quest_glob_string)
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
                    text_type, quest_label, quest_id, speaker, _, text_id = split_label
                    full_quest_id = '_'.join((quest_label.lower(), quest_id))
                    speaker = speaker.capitalize()
                    if text:
                        data_rows.append((full_quest_id, text_id, speaker, text))
                elif len(split_label) == 5:
                    continue # Character response
        self.ingestion_db.upload_lines(data_rows)

    def process_quest_dir(self, quest_dir_filename):
        with open(quest_dir_filename) as f:
            reader = csv.reader(f, delimiter=",", quotechar='"')
            row = next(reader)
            while row[0] != '65536':
                row = next(reader)

            quest_values = list()
            for row in reader:
                quest_numerical_id, quest_name, full_quest_id, expansion, class_job_category, quest_level = row[:6] # pylint: disable=unused-variable
                place_name = row[-11]
                quest_values.append((full_quest_id.lower(), quest_name, quest_level, int(place_name)))
        ingestion_db.upload_quests(quest_values)
        print('Done processing quest lookup table.')

    def process_place_dir(self, place_dir_filename):
        with open(place_dir_filename) as f:
            reader = csv.reader(f, delimiter=",", quotechar='"')
            row = next(reader)
            while row[0] != '0':
                row = next(reader)
            
            place_values = list()
            for row in reader:
                place_id = row[0]
                place_name = row[1]
                if place_name:
                    place_values.append((int(place_id), place_name))
        ingestion_db.upload_places(place_values)
        print('Done processing place lookup table.')


if __name__ == '__main__':
    ingestion_db = ingestion_db.SqliteIngestionDB('../query-service/ffxiv.db', initialize=False)
    ingest = Ingestion(ingestion_db)
    quest_files = ingest.get_quest_files('raw-data/quest/*/*.csv')