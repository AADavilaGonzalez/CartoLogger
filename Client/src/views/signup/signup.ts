import { getUserData } from "@/api";
import { state } from "@/state";
import { setRoute } from "@/routing";

import "./signup.css";
import html from "./signup.html?raw";

async function onSignupSubmit(formData: FormData): Promise<void> {
   
    console.log("Dentro de OnSignupSubmit"); 

    const jsonString = JSON.stringify(
        Object.fromEntries(formData.entries())
    );

    console.log(jsonString); 

    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: jsonString
    });

    if(response.ok) {
        const body = await response.json();
        const userData = await getUserData(body.id);
        state.set({
            userId: body.id,
            username: userData.username
        });
        setRoute("/dashboard");
    } else {
        const error = await response.json();
        alert(error);
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
