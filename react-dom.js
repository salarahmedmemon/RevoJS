import { resetStateIndex } from './react';

let oldVirtualDOM = null;

export const render = (reactElement, rootElement) => {
    resetStateIndex();

    reactElement = resolveVNode(reactElement);

    if (!oldVirtualDOM) {
        const dom = createDOMElement(reactElement);
        rootElement.appendChild(dom);
    } else {
        updateDOM(rootElement, oldVirtualDOM, reactElement);
    }

    oldVirtualDOM = reactElement;
};

function createDOMElement(reactElement) {
    reactElement = resolveVNode(reactElement);

    if (typeof reactElement === 'string' || typeof reactElement === 'number') {
        return document.createTextNode(reactElement);
    }

    const { type, props = {} } = reactElement;
    const DOMElement = document.createElement(type);

    Object.entries(props).forEach(([key, value]) => {
        if (key === 'children') return;

        if (key.startsWith('on') && typeof value === 'function') {
            DOMElement.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleName, styleValue]) => {
                DOMElement.style[styleName] = styleValue;
            });
        } else {
            DOMElement[key] = value;
        }
    });

    const children = Array.isArray(props.children) ? props.children : [props.children];
    children.forEach((child) => {
        if (Array.isArray(child)) {
            DOMElement.append(...child.map((el) => createDOMElement(el)));
        } else if (typeof child === 'string' || typeof child === 'number') {
            DOMElement.append(document.createTextNode(child));
        } else if (child != null) {
            DOMElement.append(createDOMElement(child));
        }
    });

    return DOMElement;
}

function updateDOM(parent, oldNode, newNode, index = 0) {
    const existingDOM = parent.childNodes[index];

    oldNode = resolveVNode(oldNode);
    newNode = resolveVNode(newNode);

    if (!oldNode) {
        parent.appendChild(createDOMElement(newNode));
        return;
    }

    if (!newNode) {
        if (existingDOM) parent.removeChild(existingDOM);
        return;
    }

    if (typeof oldNode === 'string' || typeof oldNode === 'number' ||
        typeof newNode === 'string' || typeof newNode === 'number') {
        if (oldNode !== newNode) {
            const newTextNode = createDOMElement(newNode);
            parent.replaceChild(newTextNode, existingDOM);
        }
        return;
    }

    if (oldNode.type !== newNode.type) {
        parent.replaceChild(createDOMElement(newNode), existingDOM);
        return;
    }

    updateProps(existingDOM, oldNode.props, newNode.props);

    const oldChildren = Array.isArray(oldNode.props.children) ? oldNode.props.children : [oldNode.props.children];
    const newChildren = Array.isArray(newNode.props.children) ? newNode.props.children : [newNode.props.children];

    const maxLength = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLength; i++) {
        updateDOM(existingDOM, oldChildren[i], newChildren[i], i);
    }
}

function updateProps(domElement, oldProps, newProps) {
    Object.keys(oldProps).forEach(name => {
        if (name === 'children') return;

        if (!(name in newProps)) {
            domElement[name] = '';
        }

        if (name.startsWith('on') && typeof oldProps[name] === 'function') {
            domElement.removeEventListener(name.substring(2).toLowerCase(), oldProps[name]);
        }
    });

    Object.keys(newProps).forEach(name => {
        if (name === 'children') return;

        if (name.startsWith('on') && typeof newProps[name] === 'function') {
            domElement.addEventListener(name.substring(2).toLowerCase(), newProps[name]);
        } else {
            domElement[name] = newProps[name];
        }
    });
}

function resolveVNode(vnode) {
    while (typeof vnode?.type === 'function') {
        vnode = vnode.type(vnode.props || {});
    }
    return vnode;
}
