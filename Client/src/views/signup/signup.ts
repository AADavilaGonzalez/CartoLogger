import { setRoute } from "@/routing";

import "./signup.css";
import html from "./signup.html?raw";

async function onSignupSubmit(formData: FormData): Promise<void> {
   
    const jsonString = JSON.stringify(
        Object.fromEntries(formData.entries())
    );

    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: jsonString
    });

    if(response.ok) {
        setRoute("/login");
    } else {
        const error = await response.json();
        alert(error.detail);
    }

}

export function SignUp(root: HTMLElement): void {
    root.innerHTML = html;
    const form = root.querySelector<HTMLFormElement>("#signup-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        onSignupSubmit(new FormData(form));
    });
}
