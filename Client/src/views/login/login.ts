import { getUserData } from "@/api";
import { State } from "@/state";
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
            "Content-Type": "application/json" 
        },
        body: jsonString
    });

    if(response.ok) {
        const body = await response.json();
        const userData = await getUserData(body.id);
        State.set({
            userId: body.id,
            username: userData.username
        });
        setRoute("/dashboard");
    } else {
        const error = await response.json();
        alert(error.detail);
    }

}

export function Login(root: HTMLElement): void {
    console.log("login fired");
    root.innerHTML = html;
    const form = root.querySelector<HTMLFormElement>("#login-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        onLoginSubmit(new FormData(form));
    });
}
