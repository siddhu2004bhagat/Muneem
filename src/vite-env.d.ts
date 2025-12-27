/// <reference types="vite/client" />


interface DocumentEventMap {
    "muneem:backup": CustomEvent;
    "muneem:restore": CustomEvent;
    "muneem:sync": CustomEvent;
    "muneem:open-pen-input": CustomEvent;
}

interface WindowEventMap {
    "muneem:open-pen-input": CustomEvent;
}
