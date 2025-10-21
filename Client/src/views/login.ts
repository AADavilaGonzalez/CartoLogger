import { state } from "../state";
import { setRoute } from "../routing";
import { Form } from "../components/form";

async function onLoginSubmit(formData: FormData): Promise<void> {
     
    const jsonString = JSON.stringify(
        Object.fromEntries(formData.entries())
    );

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' 
        },
        body: jsonString
    });

    if(response.ok) {
        const user = await response.json();
        state.set({userId: user.id, username: user.name});
        setRoute("/dashboard");
    } else {
        const error = (await response.json()).error;
        //anadir feedback visual para login fallido
        console.error(error);
    }

}

export function Login(root: HTMLElement): void {

    const form = Form(
        {titleText: "Login", submitText: "login",}, [
            {key: "identity", label: "Username or Email", type: "text"},
            {key: "password", label: "Password",          type: "password"}
        ], onLoginSubmit
    );
    root.appendChild(form);
    
}
