import React from 'react';
import ReactDOM from 'react-dom';

class Todo extends React.Component {
    constructor() {
        super();
        this.state = {
        };
    }

    render() {
        return (
            <div>This is generated by React...
            <ul>
                <li>Thing 1</li>
                <li>Thing 2</li>
            </ul>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
  <Todo/>,
  document.getElementById('todoRoot')
);
