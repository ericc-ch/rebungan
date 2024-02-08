import { LoaderFunction, redirect } from "@remix-run/node";
import { storage } from "~/lib/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  const hasIdToken = session.has("idToken");

  if (!hasIdToken) return redirect("/auth/login");

  return null;
};

export default function AppHome() {
  return (
    <div>
      <h1>You need to be authenticated to see this</h1>
    </div>
  );
}
