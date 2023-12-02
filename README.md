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

### Elasticsearch Queries

1. Get all the PLANS
GET plan/_search
{
  "query": {
    "match_all": {}
  }
}

2. get information of each index in the cluster
GET _cat/indices

3. GET /plan/_doc/12xvxc345ssdsds-100

4. DELETE /plan

5. GET /plan/_settings

6. GET /plan/_mapping

7. POST /plan/_refresh

8. search text
GET /plan/_search
{
  "query": {
    "wildcard": {
      "_org": {
        "value": "example*"
      }
    }
  }
}

9. conditional search
GET /plan/_search
{
  "query": {
    "bool": {
      "must": {
        "bool": {
          "must": [
            {
              "match": {
                "copay": 175
              }
            },
            {
              "match": {
                "deductible": 10
              }
            }
          ]
        }
      }
    }
  }
}

10. search string
GET /plan/_search
{
  "query": {
    "bool": {
      "must": {
        "bool": {
          "must": [
            {
              "match": {
                "name": "well baby"
              }
            }
          ]
        }
      }
    }
  }
}

11. has_child search
GET /plan/_search
{
  "query": {
    "has_child": {
      "type": "linkedPlanServices",
      "query": {
        "match_all": {}
      }
    }
  }
}

12. GET /plan/_search
{
  "query": {
    "has_child": {
      "type": "planCostShares",  
      "query": {
        "match_all": {}
      }
    }
  }
}

13. has_child with Condition
GET /plan/_search
{
  "query": {
    "has_child": {
      "type": "planCostShares",
      "query": {
        "range": {
          "copay": {
            "gte": 1
          }
        }
      }
    }
  }
}

14. has_parent search
GET /plan/_search
{
  "query": {
    "has_parent": {
      "parent_type": "plan", 
      "query": {
        "match_all": {}
      }
    }
  }
}

15. has_parent with condition
GET /plan/_search
{
  "query": {
    "has_parent": {
      "parent_type": "linkedPlanServices",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "objectId": "27283xvx9asdff-105b"
              }
            }
          ]
        }
      }
    }
  }
}

16. has parent
GET /plan/_search
{
  "query": {
    "has_parent": {
      "parent_type": "linkedPlanServices",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "objectId": "27283xvx9asdff-205def"
              }
            }
          ]
        }
      }
    }
  }
}

17. falied query
GET /plan/_search
{
  "query": {
    "has_parent": {
      "parent_type": "planserviceCostShares",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "objectId": "27283xvx9asdff-503def"
              }
            }
          ]
        }
      }
    }
  }
}

18. falied query
GET /plan/_search
{
  "query": {
    "has_parent": {
      "parent_type": "planservice",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "objectId": "27283xvx9asdff-503def"
              }
            }
          ]
        }
      }
    }
  }
}




