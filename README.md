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

```
curl -X GET "http://localhost:9200/"
sudo service elasticsearch start
brew services start elastic/tap/elasticsearch-full
```

### Commands to start Kibana
#### Kibana will run in http://localhost:5601/
1. Add the below to the kibana.yml file
    server.host: "localhost"
    elasticsearch.hosts: ["http://localhost:9200"]
2. go to /Downloads/kibana-8.11.1/bin and then run the below command
3. http://localhost:5601/app/dev_tools#/console
```
./kibana
```

Starting the RabbitMQ server
```
rabbitmq-server
```
### Reference Links

To solve error when installing elasticsearch using homebrew: https://github.com/elastic/homebrew-tap/issues/146