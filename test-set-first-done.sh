#!/bin/bash
curl http://localhost:8081/api/todo/0 -X POST -d '{"isDone":"true"}'
