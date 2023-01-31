# Queries API Documentation

## Environment Built-up

- Install `pandas`, `django`, `nltk`, `django-cors-headers` on python

  ```shell
  $ pip3 install pandas django nltk django-cors-headers
  ```

- Download `test.db` from [test.db - Google Drive](https://drive.google.com/file/d/1_hkucDY6Z0nqH9V0PfWkxBR911mAVPHN/view) and place under `backend` directory

  ```shell
  - /TweeterDashboard
  	- /backend
  		- /backend
  		- /queries
  		- test.db <<<< copy to here
  		- db_init.py
  		- manage.py
      - /public
      - /src
      - ...
  ```

- Run the backend service

  ```shell
  $ python manage.py runserver
  ```

- Download Postman agent from here [Postman Agent: For Mac, Windows, & Linux](https://www.postman.com/downloads/postman-agent/) and install

- Go to the Postman collection @[New Collection - OSU AU22 CSE 5242 Twitter Dashboard Backend API (postman.co)](https://osu-cse-5242-team2.postman.co/workspace/OSU-AU22-CSE-5242-Twitter-Dashb~9ee1e8ed-1024-408a-a932-1aa0dc93f3c6/collection/24176168-ba69b131-694f-47e2-bd3f-75c5a6f654f8?ctx=documentation)

- Use the HTTP request I created in the collection to test

## API Entry Points

- `HTTP.GET('/queries/setQuery')`
  - First query should use this API

- `HTTP.GET('/queries/subsetQuery')`
  - The following advanced queries should use this API

## Request Body and Response Body

- Request Body

```json
{
    "keywords": ["keyword1", "keyword2"],
    "startTime": "Wed Nov 09 2022 21:37:30 GMT-0500",
    "endTime": "Wed Nov 09 2022 21:37:30 GMT-0500",
    "source": 1,
}
```

- The following is an unconditional search

```json
{
    "keywords": [],
    "startTime": "",
    "endTime": "",
    "source": 0,
}
```

---

- Response Body

```json
{
    "diskTime": 0.7179164886474609,
    "memTime": 0.7179164886474609,
    "first10Result": [
        {
            "text": "RT @Avengers: Welcome to the party, @RobertDowneyJr! #IronMan #AvengersEndgame https://t.co/vLttl0LCqE",
            "time": "2019-04-23 09:22:01",
            "favoriteCount": 0,
            "retweetCount": 10736,
            "source": 1,
            "priority": 10736
        },
        {
            "text": "RT @Avengers: Welcome to the party, @RobertDowneyJr! #IronMan #AvengersEndgame https://t.co/vLttl0LCqE",
            "time": "2019-04-23 09:22:54",
            "favoriteCount": 0,
            "retweetCount": 10736,
            "source": 1,
            "priority": 10736
        }, ...
    ],
    "histogramData": [
        {
            "date": "2019-04-07",
            "freq": 5
        },
        {
            "date": "2019-04-08",
            "freq": 8
        }, ...
    ],
    "lineChartData": [
        {
            "date": "00",
            "freq": 61
        },
        {
            "date": "01",
            "freq": 85
        },
        ...,
        {
            "date": "23",
            "freq": 51
        }
    ],
    "wordCloudData": [
        {
            "word": "welcome",
            "freq": 1413
        },
        {
            "word": "game",
            "freq": 947
        },
        {
            "word": "thrones",
            "freq": 846
        }, ...
    ],
}
```