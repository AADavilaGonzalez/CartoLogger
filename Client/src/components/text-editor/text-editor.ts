import "./text-editor.css";

function autoGrow(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px'; 
}

export class HTMLTextEditorElement extends HTMLElement {

    private titleContainer: HTMLTextAreaElement;
    private bodyContainer: HTMLTextAreaElement;

    constructor() {
        super();

        this.titleContainer = document.createElement('textarea');
        this.titleContainer.className = "title";
        this.titleContainer.placeholder = "Título del marcador";
        this.titleContainer.rows = 1;
        this.appendChild(this.titleContainer);

        this.bodyContainer = document.createElement('textarea');
        this.bodyContainer.className = "body";
        this.bodyContainer.placeholder = "Escribe una descripción...";
        this.appendChild(this.bodyContainer);

        const helpText = document.createElement('div');
        helpText.className = 'help-text';
        this.appendChild(helpText);

        this.titleContainer.addEventListener('input', () => autoGrow(this.titleContainer));
        this.bodyContainer.addEventListener('input', () => autoGrow(this.bodyContainer));
    }

    get titleTextContent(): string {
        return this.titleContainer.value;
    }
    set titleTextContent(content : string) {
        this.titleContainer.value = content; 
        autoGrow(this.titleContainer);
    }

    get bodyTextContent(): string {
        return this.bodyContainer.value;
    }
    set bodyTextContent(content : string) {
        this.bodyContainer.value = content;
        autoGrow(this.bodyContainer);
    }
}

customElements.define("text-editor", HTMLTextEditorElement);

export function TextEditor() {
    return new HTMLTextEditorElement();
}