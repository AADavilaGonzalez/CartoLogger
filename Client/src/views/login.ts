
export function Login(root: HTMLElement): void {
    root.innerHTML = "Login";
}
/*
Form("app", "Login", "login", [
    {key: "identity", label: "Username or Email", type: "text"},
    {key: "password", label: "Password",          type: "password"}],
    async (formData: FormData) => {

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

        const userData = await response.json();

        if(!response.ok) {
            console.error(userData);
            return;
        }
 
        console.log(userData);

    }
)
*/
