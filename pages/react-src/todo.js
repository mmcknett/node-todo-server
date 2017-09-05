import React from 'react';
import ReactDOM from 'react-dom';

class TodoAddBox extends React.Component {
    constructor() {
        super();
        this.state = {
            text: ""
        }
    }

    textUpdated(event) {
        this.setState({
            text: event.target.value
        });
    }

    keyPressed(event) {
        const chCode = ('charCode' in event) ? event.charCode : event.keyCode;
        if (chCode == 13 /* Enter */)
        {
            this.setState({
                text: ""
            });
            this.props.onAddEntry(this.state.text);
        }
    }

    render() {
        return (
            <div>
            Add an item:
            <input type="text"
                value={this.state.text}
                onChange={ (event) => { this.textUpdated(event); } }
                onKeyPress={ (event) => { this.keyPressed(event); } } />
            </div>
        )
    }
}

function TodoEntry(todoListEntry, index, onClicked) {
    return (
        <li key={index}>
            <input type="checkbox"
                checked={todoListEntry.isDone}
                onChange={onClicked}/>
            {todoListEntry.text}
        </li>
    )
}

class Todo extends React.Component {
    constructor() {
        super();
        this.state = {
            todoList: [] // Start with an empty todo list.
            };
    }

    todoEntryClicked(index)
    {
        const newIsDone = !this.state.todoList[index].isDone;
        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == XMLHttpRequest.DONE &&
                xmlhttp.status == 200)
            {
                const todoEntryForIndex = JSON.parse(xmlhttp.responseText);
                const todoList = this.state.todoList.slice();
                todoList[index] = todoEntryForIndex;
                this.setState({
                    todoList
                });
            }
        }

        xmlhttp.open("POST", `api/todo/${index}`, true);
        xmlhttp.send(JSON.stringify({isDone: newIsDone}));
    }

    todoAdded(text)
    {
        const newEntry = {
            isDone: false,
            text
        };
        console.log(`Adding "${newEntry.text}", isDone is ${newEntry.isDone}`);

        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == XMLHttpRequest.DONE &&
                xmlhttp.status == 200)
            {
                const todoList = JSON.parse(xmlhttp.responseText);
                this.setState({
                    todoList
                });
            }
        }

        xmlhttp.open("PUT", "api/todo", true);
        xmlhttp.send(JSON.stringify(newEntry));
    }

    componentDidMount() {
        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == XMLHttpRequest.DONE &&
                xmlhttp.status == 200) {
                const todoList = JSON.parse(xmlhttp.responseText);
                this.setState({
                    todoList
                })
            }
        }

        xmlhttp.open("GET", "api/todo", true);
        xmlhttp.send();
    }

    render() {
        return (
            <div>
                <TodoAddBox
                    onAddEntry={ (text) => { this.todoAdded(text); } }/>
                <div>
                Existing items:
                <ul>
                    { this.state.todoList.map(
                        (todoListEntry, index) => {
                            return TodoEntry(todoListEntry, index,
                                () => { this.todoEntryClicked(index); });
                        }
                    ) }
                </ul>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
  <Todo/>,
  document.getElementById('todoRoot')
);
