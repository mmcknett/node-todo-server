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

http.createServer(main).listen(8080);

function main(request, response)
{
    console.log('Handling request...');
    const {method, url} = request;

    request.on('error', onRequestError);
    route(request, response, method, url);
}

function onRequestError(err)
{
    console.error("Request error: " + err);
}

function route(request, response, method, url)
{
    if (method === "GET")
    {
        console.log('Handling GET...');
        routeGet(request, response, url);
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
