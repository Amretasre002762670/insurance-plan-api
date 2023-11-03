# insurance-plan-api

An insurance api built using nodejs and expressjs framework. It uses the redis key-value store for backend. This app does JSON schema validation before storing the data in the database. This app has also the ability to authorize the user using OAuth 2.0 and Google IDP.

## Commmands needed for redis server

Command to start the redis server
```
redis-server
```

Command to get into redis-cli
```
redis-cli
```

Command to delete all the records in redis
```
flushall
```
Command to display all the keys in redis
```
keys *
```