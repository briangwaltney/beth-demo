const publishableKey =
  "pk_test_YW1hemluZy1iZWFyLTU5LmNsZXJrLmFjY291bnRzLmRldiQ"; // <- Add Publishable Key here

const startClerk = async () => {
  const Clerk = window.Clerk;
  try {
    await Clerk.load();
    document.body.dispatchEvent(new Event("clerkLoaded"));
  } catch (err) {
    console.error("Error starting Clerk: ", err);
  }
};

(() => {
  const script = document.createElement("script");
  script.setAttribute("data-clerk-publishable-key", publishableKey);
  script.async = true;
  script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
  script.crossOrigin = "anonymous";
  script.addEventListener("load", startClerk);
  script.addEventListener("error", () => {
    document.getElementById("no-frontend-api-warning").hidden = false;
  });
  document.body.appendChild(script);
})();
