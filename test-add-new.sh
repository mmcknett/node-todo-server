#!/bin/bash
curl http://localhost:8081/api/todo -X PUT \
    -d '{"text":"Test data added!"}'

curl http://localhost:8081/api/todo -X PUT \
    -d '{"isDone":"true", "text":"Already complete test entry"}'
