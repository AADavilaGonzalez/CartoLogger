import { setRoute } from "../routing";
import { Form } from "../components/form"

async function onSignUpSubmit(formData: FormData): Promise<void> {

    const jsonString = JSON.stringify(
        Object.fromEntries(formData.entries())
    );

    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString
    });

    if(response.ok) {
        setRoute("/login");
    } else {
        const error = (await response.json()).error;
        //anadir feedback visual para signup fallido
        console.error(error);
    }
}

export function SignUp(root: HTMLElement): void {    
    
    const form = Form(
        {titleText: "Sign Up", submitText: "sign up"}, [
            {key: "username", label: "Username", type: "text"},
            {key: "email",    label: "Email",    type: "email"},
            {key: "password", label: "Password", type: "password"}
        ], onSignUpSubmit
    )
    root.appendChild(form);
}
