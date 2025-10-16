import {Form} from "../components/form"

export function SignUp(root: HTMLElement): void {    
    
    const form = Form(
        {titleText: "Sign Up", submitText: "sign up"}, [
            {key: "username", label: "Username", type: "text"},
            {key: "email",    label: "Email",    type: "text"},
            {key: "password", label: "Password", type: "password"}
        ],
        async (formData: FormData) => {
            
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

            const userData = await response.json();

            if(!response.ok) {
                console.error(userData);
                return;
            }

            console.log(userData);

        }
    )

    root.appendChild(form);
}
/*
*/
