from dateutil import parser
from queries.models import Tweet
import sqlite3
import pandas as pd
from collections import OrderedDict

import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

nltk.download('stopwords')
nltk.download('punkt')
stopWordsSet = set(stopwords.words('english'))
stopWordsSet.add('&amp;')
stopWordsSet.add('&amp;')

def sqliteQueryByFilter(conn, filters):
    """
        Using django SQLite integration to filter the result
        parameters:
            sqliteQueryResult: django QuerySet or None
            filter: list of maps with 4 rules:
                                    {
                                        'keywords': [str1, str2],
                                        'startTime': datetime.datetime(),
                                        'endTime': datetime.datetime(),
                                        'source': integer
                                    }
        return:
            pandas dataframe
    """
    whereClauses = []
    for filter in filters:
        if len(filter['keywords']) > 0:
            for keyword in filter['keywords']:
                whereClauses.append("text LIKE \'%%%s%%\'"%(keyword))
        if len(filter['startTime']) > 0:
            whereClauses.append("time >= \'%s\'"%(filter['startTime']))
        if len(filter['endTime']) > 0:
            whereClauses.append("time <= \'%s\'"%(filter['endTime']))
        if filter['source'] != 0:
            whereClauses.append("source = \'%d\'"%(filter['source']))
    sqlCommand = 'SELECT *, favoriteCount + retweetCount AS priority FROM twitter_dataset'
    if len(whereClauses) > 0:
        whereClause = " AND ".join(whereClauses)
        sqlCommand += ' WHERE ' + whereClause
    sqlCommand += ' ORDER BY priority DESC, time ASC;'
    print(sqlCommand)
    return pd.read_sql(sqlCommand, conn)


def buildMemoryDB(conn_memoryDB, sqliteQueryResult):
    """
        Insert dataframe into sqlite3 connection
        parameters:
            conn_memoryDB: sqlite3 connection
            sqliteQueryResult: pandas dataframe with columns = [text, time, favoriteCount, retweetCount, source]
    """
    sqliteQueryResult.to_sql('twitter_dataset', conn_memoryDB, if_exists='replace', index=False)

def getHistogramData(sqliteQueryResult):
    """
        provide date v.s. frequency data
        parameters:
            sqliteQueryResult: pandas dataframe
        return:
            result: list of dicts, [{"date": "2021-10-21", "freq": 1}, 
                                    {"date": "2021-10-22", "freq": 10}, 
                                    {"date": "2021-10-23", "freq": 100}, ... ]
    """
    freqDict = {}
    for index, row in sqliteQueryResult.iterrows():
        date = row['time'].split()[0]
        if date not in freqDict:
            freqDict[date] = 0
        freqDict[date] += 1
    result = []
    for date in sorted(freqDict.keys()):
        result.append({'date': date, 'freq': freqDict[date]})
    return result

def getLineChartData(sqliteQueryResult):
    """
        provide daytime v.s. frequency data
        parameters:
            sqliteQueryResult: pandas dataframe
        return:
            result: list of dicts, [{"daytime": "23:56", "freq": 1}, 
                                    {"daytime": "23:57", "freq": 10}, 
                                    {"daytime": "23:58", "freq": 100}, ... ]
    """
    freqDict = {}
    for index, row in sqliteQueryResult.iterrows():
        daytime = row['time'].split()[1].split(':')[0]
        if daytime not in freqDict:
            freqDict[daytime] = 0
        freqDict[daytime] += 1
    result = []
    for daytime in sorted(freqDict.keys()):
        result.append({'date': daytime, 'freq': freqDict[daytime]})
    return result

def getWordCloudData(sqliteQueryResult):
    """
        provide word v.s. frequency data
        parameters:
            sqliteQueryResult: pandas dataframe
        return:
            result: list of dicts, [{"word": "apple", "freq": 1}, 
                                    {"word": "book", "freq": 10}, 
                                    {"word": "cat", "freq": 100}, ... ]
    """
    freqDict = {}
    for index, row in sqliteQueryResult.iterrows():
        for word in row['text'].replace(':', '').replace('.', '').replace(',', '').replace('/','').replace('\\','').split():
            if word.startswith('http'):
                continue
            word = word.lower()
            if word not in freqDict:
                freqDict[word] = 0
            freqDict[word] += 1
    result = []
    sortedFreqDict = dict(sorted(freqDict.items(), key=lambda x: x[1], reverse=True))
    cnt = 0
    for word in sortedFreqDict.keys():
        if word not in stopWordsSet:
            # print(word)
            result.append({'word': word, 'freq': freqDict[word]})
            cnt += 1
            if cnt == 100:
                break
    return result