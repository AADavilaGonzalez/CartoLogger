import "./quick-form.css";

interface QuickFormFieldData {
  key: string;
  label: string;
  type: string;
}

interface QuickFormOptions {
    titleText?: string;
    submitText?: string;
}

export class HTMLQuickFormElement extends HTMLElement {
    
    public titleText: string = "Form";
    public submitText: string = "Submit";
    public onSubmit: (data: FormData) => void = 
        (_) => {console.log(`quick-from ${self} submitted`)};
    public fields: QuickFormFieldData[] = [];

    constructor() {
        super();
    }

    connectedCallback() { 
        
        const form = document.createElement("form");
        form.innerHTML = `
            <h2>${this.titleText}</h2>
            ${this.fields.map((field) => `
                <label>
                ${field.label}
                <input name="${field.key}" type="${field.type}">
                </label>`
            ).join("")}
            <button type="submit">${this.submitText}</button>
        `;

        this.appendChild(form);
       
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          this.onSubmit(new FormData(form));
        });
    }
}

customElements.define("quick-form", HTMLQuickFormElement);

export function QuickForm(
    options: QuickFormOptions,
    fields: QuickFormFieldData[],
    onSubmit: (formData: FormData) => void
): HTMLQuickFormElement {
    const quickForm = new HTMLQuickFormElement();
    if(options.titleText) { quickForm.titleText = options.titleText; }
    if(options.submitText) { quickForm.submitText = options.submitText; }
    quickForm.fields = fields;
    quickForm.onSubmit = onSubmit;
    return quickForm;
}
