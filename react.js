import App from './App';
import React from './react';
import { render } from './react-dom';

function flattenChildren(children) {
    let result = [];
    let buffer = '';

    children.forEach(child => {
        if (typeof child === 'string' || typeof child === 'number') {
            buffer += child; // Combine text nodes
        } else {
            if (buffer) {
                result.push(buffer);
                buffer = '';
            }
            result.push(child);
        }
    });

    if (buffer) {
        result.push(buffer);
    }

    return result;
}



const createElement = (type, props, ...children) => {
    const reactElement = {
        type,
        props: {
            ...props,
            children: flattenChildren(children), // 🔥 FLATTEN HERE
        }
    };

    return reactElement;
};


let states = [];
let stateIndex = 0;

export const useState = (initialState) => {
    states[stateIndex] = states[stateIndex] ?? initialState;
    let localIndex = stateIndex;

    const setState = (newState) => {
        states[localIndex] = newState;
        render(<App />, document.querySelector("#root"));
    };

    stateIndex++;

    return [states[localIndex], setState];
};

export const resetStateIndex = () => {
    stateIndex = 0;
};

export default {
    createElement
};