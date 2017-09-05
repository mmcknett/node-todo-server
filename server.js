const http = require('http');
const fs = require('fs');

const todos = [
    // Uncomment to populate the server with some initial data...
    //
    // {
    //     isDone: false,
    //     text: "First todo"
    // },
    // {
    //     isDone: false,
    //     text: "Second todo"
    // }
];

const todoPage = "./pages/todo.html";
const todoCodeBehind = "./pages/react-bld/todo-bundled.js";
const todoCodebehindUrl = "/todo/todo.js";
const todoUrl = "/todo";
const todoApiUrl = "/api/todo";

http.createServer(main).listen(8081);

function main(request, response)
{
    console.log('Handling request...');

    request.on('error', onRequestError);
    route(request, response);
}

function onRequestError(err)
{
    console.error("Request error: " + err);
}

function route(request, response)
{
    const {method, url} = request;

    if (method === "GET")
    {
        console.log('Handling GET...');
        routeGet(request, response, url);
    }
    else if (method === "POST")
    {
        console.log('Handling POST...');
        routePost(request, response, url);
    }
    else if (method === "PUT")
    {
        console.log('Handling PUT...');
        routePut(request, response, url);
    }
    else
    {
        console.log('Ignoring other HTTP verbs');
        ignoreBodyAndHandleRequestEnd(request,
            () => { defaultResponse(response); }
        );
    }
}

function routeGet(request, response, url)
{
    ignoreBodyAndHandleRequestEnd(request,
        () => {
            response.on('error', onResponseError);

            if (url === todoUrl)
            {
                todoResponse(response);
            }
            else if (url == todoCodebehindUrl)
            {
                todoCodeBehindResponse(response);
            }
            else if (url === todoApiUrl)
            {
                todoApiResponse(response);
            }
            else
            {
                defaultResponse(response);
            }
        }
    );
}

function ignoreBodyAndHandleRequestEnd(request, handler)
{
    request.on('data', (chunk) => {});
    request.on('end', handler);
}

function onResponseError(err)
{
    console.error("Response error: " + err);
}

function todoResponse(response)
{
    console.log('Handling todo...');
    console.log('Reading the todo page');
    fs.readFile(todoPage, (err, fileData) => {
        respondWithFile(err, fileData, response);
    });
}

function todoCodeBehindResponse(response)
{
    console.log('Reading the transpiled, bundled todo codebehind.');
    fs.readFile(todoCodeBehind, (err, fileData) => {
        respondWithFile(err, fileData, response);
    });
}

function todoApiResponse(response)
{
    console.log('Returning the state of the todo list in memory.');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(todos));
}

function respondWithFile(err, fileData, response)
{
    if (err)
    {
        console.error("File load error: " + err);
        defaultResponse(response);
    }
    else
    {
        console.log('Returning file.  First 1024 characters: '
            + fileData.slice(0, 1024));
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(fileData);
    }
}

function defaultResponse(response)
{
    console.log('Handling default response with 404.');
    response.statusCode = 404;
    response.end();
}

function routePost(request, response, url)
{
    // Optimization: check if URL is supported before loading body.
    loadBodyAndHandleRequestEnd(request,
        (postData) =>
        {
            response.on('error', onResponseError);

            if (url.startsWith(todoApiUrl))
            {
                parseAndUpdateTodo(response, postData, url);
            }
            else
            {
                defaultResponse(response);
            }
        }
    );
}

function loadBodyAndHandleRequestEnd(request, handler)
{
    console.log('Loading body...');
    let body = [];
    request.on('data', (chunk) =>
    {
        body.push(chunk);
    });
    request.on('end', () =>
    {
        body = Buffer.concat(body).toString();

        console.log('Body loaded: ' + body);
        handler(body);
    });
}

function parseAndUpdateTodo(response, postData, url)
{
    console.log(`Parsing POST data: ${postData}`)
    const index = getIndexFromUrl(todoApiUrl, url);
    if (!validIndex(index))
    {
        console.error('Requested index is not a number.');
        return badRequestResponse(response);
    }

    const updatedState = tryParseDataAsJson(postData);
    if (!updatedState)
    {
        console.error('Invalid POST data.');
        return badRequestResponse(response);
    }

    updateTodo(index, updatedState)

    response.statusCode = 200;
    response.end(JSON.stringify(todos[index]));
}

function getIndexFromUrl(baseUrl, url)
{
    return parseInt(url.slice(baseUrl.length + 1));
}

function validIndex(index)
{
    return !isNaN(index) &&
        Number.isInteger(index) &&
        index < todos.length &&
        index >= 0;
}

function tryParseDataAsJson(data)
{
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function updateTodo(index, updatedState)
{
    console.log(todos[index].text + " was " +
        (todos[index].isDone ? "" : "not ") +
        "done and now is" +
        (updatedState.isDone ? "" : " not") + ".");

    todos[index].isDone = updatedState.isDone;
}

function badRequestResponse(response)
{
    console.log('Returning bad request.');
    response.statusCode = 400;
    response.end();
}

function routePut(request, response, url)
{
    // Optimization: check if URL is supported before loading body.
    loadBodyAndHandleRequestEnd(request,
        (putData) =>
        {
            response.on('error', onResponseError);

            if (url === todoApiUrl)
            {
                parseAndAddTodo(response, putData);
            }
            else
            {
                defaultResponse(response);
            }
        }
    );
}

function parseAndAddTodo(response, putData)
{
    const newEntry = tryParseDataAsJson(putData);
    if (!newEntry ||
        !('text' in newEntry))
    {
        console.error('Invalid PUT data.');
        return badRequestResponse(response);
    }

    addTodo(newEntry)

    // Respond as though GET was called on the todos api.
    todoApiResponse(response);
}

function addTodo(newEntry)
{
    todos.push(
        {
            isDone: newEntry.isDone,
            text: newEntry.text
        }
    );
}
