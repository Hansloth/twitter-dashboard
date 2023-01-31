import json, time
import sqlite3
import pandas as pd

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .utils import getHistogramData, getLineChartData, getWordCloudData, sqliteQueryByFilter, buildMemoryDB

from django.views.decorators.csrf import csrf_exempt

conn = sqlite3.connect('test.db', check_same_thread=False)
setFilter = None
conn_memoryDB = None
mem_db_size = None

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

@csrf_exempt 
def setQuery(request):
    """set query API entrypoin"""
    # fetch the global variables
    global conn, setFilter, conn_memoryDB, mem_db_size

    # get the filter from the request body
    filter = json.loads(request.body)
    print(filter)

    # fetch the result and time
    queryStartTime = time.time()
    # conn = sqlite3.connect('test.db')
    sqliteQueryResult = sqliteQueryByFilter(conn, [filter])
    # conn.close()
    queryEndTime = time.time()

    # build in-memory database
    if conn_memoryDB is not None:
        conn_memoryDB.close()
    conn_memoryDB = sqlite3.connect(":memory:", check_same_thread=False)
    buildMemoryDB(conn_memoryDB, sqliteQueryResult)
    setFilter = filter

    # create the return json
    size = sqliteQueryResult.shape[0]
    mem_db_size = size
    # print("norm disk time =", (queryEndTime - queryStartTime) /size)
    # print("norm mem time =", (queryEndTime - queryStartTime) /size) 
    resultDict = {}
    resultDict['diskTime'] = queryEndTime - queryStartTime
    resultDict['memTime'] = queryEndTime - queryStartTime
    resultDict['first10Result'] = sqliteQueryResult[:min(10, size)].to_dict('records')
    resultDict['histogramData'] = getHistogramData(sqliteQueryResult)
    resultDict['lineChartData'] = getLineChartData(sqliteQueryResult)
    resultDict['wordCloudData'] = getWordCloudData(sqliteQueryResult)
    return JsonResponse(resultDict)
    
@csrf_exempt 
def subsetQuery(request):
    """subset query API entrypoint"""
    # fetch the globle variables
    global setFilter, conn_memoryDB, mem_db_size
    
    # get the subset filter from the request body
    subsetFilter = json.loads(request.body)

    # fetch the result from disk and time
    queryDiskStartTime = time.time()
    conn = sqlite3.connect('test.db')
    sqliteQueryResult = sqliteQueryByFilter(conn, [setFilter, subsetFilter])
    conn.close()
    queryDistEndTime = time.time()

    # fetch the result from memory and time
    queryMemStartTime = time.time()
    subsetdf = sqliteQueryByFilter(conn_memoryDB, [subsetFilter])
    queryMemEndTime = time.time()

    # create the return json
    size = sqliteQueryResult.shape[0]
    print("size =", size)
    print("norm disk time =", (queryDistEndTime - queryDiskStartTime) / 855679)
    print("norm mem time =", (queryMemEndTime - queryMemStartTime) / mem_db_size)   
    print("speed up =", ((queryDistEndTime - queryDiskStartTime) / 855679) / ((queryMemEndTime - queryMemStartTime) / mem_db_size))

    resultDict = {}
    resultDict['diskTime'] = queryDistEndTime - queryDiskStartTime
    resultDict['memTime'] = queryMemEndTime - queryMemStartTime
    resultDict['first10Result'] = sqliteQueryResult[:min(10, size)].to_dict('records')
    resultDict['histogramData'] = getHistogramData(sqliteQueryResult)
    resultDict['lineChartData'] = getLineChartData(sqliteQueryResult)
    resultDict['wordCloudData'] = getWordCloudData(sqliteQueryResult)
    return JsonResponse(resultDict)
