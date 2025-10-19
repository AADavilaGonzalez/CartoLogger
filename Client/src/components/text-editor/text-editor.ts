import "./text-editor.css";

export class HTMLTextEditorElement extends HTMLElement {

    private titleContainer: HTMLTextAreaElement;
    private bodyContainer: HTMLTextAreaElement;

    constructor() {
        super();

        this.titleContainer = document.createElement('textarea');
        this.titleContainer.className = "title";
        this.titleContainer.placeholder = "Place title here"; 
        this.appendChild(this.titleContainer);

        this.bodyContainer = document.createElement('textarea');
        this.bodyContainer.className = "body";
        this.bodyContainer.placeholder = "And everything else here";
        this.appendChild(this.bodyContainer);

    }

    get titleTextContent(): string {
        return this.titleContainer.value;
    }
    set titleTextContent(content : string) {
        this.titleContainer.value = content; 
    }

    get bodyTextContent(): string {
        return this.bodyContainer.value;
    }
    set bodyTextContent(content : string) {
        this.bodyContainer.value = content;
    }
}

customElements.define("text-editor", HTMLTextEditorElement);

export function TextEditor() {
    return new HTMLTextEditorElement();
}
