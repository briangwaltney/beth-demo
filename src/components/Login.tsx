import * as elements from "typed-html";
export const Login = () => {
  return (
    <div>
      <button onclick="Clerk.openSignUp()">Sign Up</button>
      <button onclick="Clerk.openSignIn()">Sign In</button>
    </div>
  );
};

export const Logout = () => {
  return (
    <div hx-get="/log-out" hx-swap="outerHTML">
      <button onclick="Clerk.signOut()">Log out</button>
    </div>
  );
};
