const http = require('http');
const fs = require('fs');

const todos = [
    {
        isDone: false,
        text: "First todo"
    },
    {
        isDone: false,
        text: "Second todo"
    }
];

const todoPage = "./pages/todo.html";
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
        console.log('Returning html: ' + fileData);
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
    const index = parseInt(url.slice(todoApiUrl.length + 1));
    if (isNaN(index))
    {
        console.error('Requested index is not a number.');
        return badRequestResponse(response);
    }

    let updatedState;
    try
    {
        updatedState = JSON.parse(postData);
    }
    catch (e)
    {
        console.error('Invalid POST data.');
        return badRequestResponse(response);
    }

    updateTodo(index, updatedState);

    response.statusCode = 200;
    response.end(JSON.stringify(todos[index]));
}

function updateTodo(index, updatedState)
{
    console.log(todos[index].text + " was " +
        (todos[index].isDone ? "" : "not ") +
        "done and now is" +
        (updatedState.isDone ? "" : "not") + ".");

    todos[index].isDone = updatedState.isDone;
}

function badRequestResponse(response)
{
    console.log('Returning bad request.');
    response.statusCode = 400;
    response.end();
}
