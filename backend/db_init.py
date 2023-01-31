import warnings, os
import pandas as pd
import random
from dateutil import parser


if __name__ == '__main__':
    warnings.filterwarnings("ignore")

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    django.setup()
    from queries.models import Tweet

    Tweet.objects.all().delete()

    tweets = []
    avengers_df = pd.read_csv(os.path.join('data', 'AvengersEndgame.csv'), encoding='cp1252')
    for index, row in avengers_df.iterrows():
        if index % 10000 == 0:
            print(index)
        tweets.append(Tweet(text=row['text'], time=parser.parse(row['created']), source=1))

    gamethrone_df = pd.read_csv(os.path.join('data', 'GameofThronesS8.csv'))
    for index, row in gamethrone_df.iterrows():
        if index % 10000 == 0:
            print(index)
        tweets.append(Tweet(text=row['text'], time=parser.parse(row['created_at']), source=2))

    squidgame_df = pd.read_csv(os.path.join('data', 'squidgame.csv'))
    for index, row in squidgame_df.iterrows():
        if index % 10000 == 0:
            print(index)
        tweets.append(Tweet(text=row['text'], time=parser.parse(row['date']), source=3))

    random.shuffle(tweets)
    Tweet.objects.bulk_create(tweets)