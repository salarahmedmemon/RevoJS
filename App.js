import React, { useState }  from './react';
import { render } from './react-dom';

export default function App() {
    const [count, setCount] = useState(0);

    return(
        <div className='app'>
            <h1>Count: { count }</h1>
            <button onclick={() => setCount(count+1)}>click me</button>
        </div>
    )
}

render( <App/> , document.querySelector("#root"));