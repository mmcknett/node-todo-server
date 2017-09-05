#!/bin/bash
curl http://localhost:8081/api/todo -X POST \
    -d '{"text":"Test data added!"}'

curl http://localhost:8081/api/todo -X POST \
    -d '{"isDone":"true", "text":"Already complete test entry"}'
