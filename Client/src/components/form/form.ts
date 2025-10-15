import "./style/form.css";

interface FormFieldData {
    key: string;
    label: string;
    type: string;
}

export function Form(
    titleText: string,
    submitText: string,
    fields: FormFieldData[],
    onSubmit: (data: FormData) => void
): HTMLFormElement {

    const form = document.createElement('form');
    form.className = "component";

    form.innerHTML = `
        ${titleText ? `<h2>${titleText}</h2>` : ""}
        ${fields.map((field) =>
        `<label>
            ${field.label}<br>
            <input name=${field.key} type=${field.type} >
        </label>`).join("")
        }
        <button type="submit">${submitText}</button>
    `;
    
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        onSubmit(new FormData(form));
    });
    
    return form;
}
