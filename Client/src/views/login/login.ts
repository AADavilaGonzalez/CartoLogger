import { state } from "@/state";
import { setRoute } from "@/routing";

import "./login.css";
import html from "./login.html?raw";

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
    root.innerHTML = html;
    const form = root.querySelector<HTMLFormElement>("#login-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        onLoginSubmit(new FormData(form));
    });
}
