interface FormFieldData {
    key: string;
    label: string;
    type: string;
}

export default function Form(
    container_id: string,
    title: string,
    submit: string,
    fields: FormFieldData[],
    onSubmit: (data: FormData) => void
) {

    const container = document.querySelector<HTMLDivElement>(`#${container_id}`);
    if(!container) {
        console.error(`Form: Could not find container with 
            id ${container_id} to create form ${title}`);
        return;
    }

    const form_container = document.createElement('div');
    form_container.className = "form-container";

    form_container.innerHTML = `
        ${title ? `<h2 class="form-title">${title}</h2>` : ""}
        <form>
            ${fields.map((field) =>
            `<label>
                ${field.label}<br>
                <input name=${field.key} type=${field.type} >
            </label>`).join("")
            }
            <button type="submit">${submit}</button>
        </form>
    `
    container.appendChild(form_container);
    
    const form = form_container.querySelector("form");
    if(!form) {
        console.error(`Form: Something went wrong while finding the
            form node within the form-container`);
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        onSubmit(new FormData(form));
    });
}
