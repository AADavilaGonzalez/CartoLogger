import "./form.css";

interface FormFieldData {
    key   : string;
    label : string;
    type  : string;
}

interface FormOptions {
    titleText?  : string;
    submitText? : string;
    className?  : string;
}

export function Form(
    options: FormOptions,
    fields: FormFieldData[],
    onSubmit: (data: FormData) => void
): HTMLFormElement {

    const title  = options.titleText ? `<h2>${options.titleText}</h2>` : "";
    const submit = options.submitText || "submit";

    const form = document.createElement('form');
    if(options.className) { form.className = options.className; }

    form.innerHTML = `
        ${title}
        ${fields.map((field) =>
        `<label>
            ${field.label}<br>
            <input name=${field.key} type=${field.type} >
        </label>`).join("")
        }
        <button type="submit">${submit}</button>
    `;
    
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        onSubmit(new FormData(form));
    });
    
    return form;
}
