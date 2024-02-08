import { ActionFunction, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent } from "react";
import {
  adminAuth,
  adminFirestore,
} from "~/lib/firebase/firebase-admin.server";
import { auth } from "~/lib/firebase/firebase.client";
import { createUserSession, storage } from "~/lib/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const idToken = formData.get("idToken") as string;

  const decodedToken = await adminAuth.verifyIdToken(idToken);

  const allowedUsersDocs = await adminFirestore.collection("users").get();
  const allowedUsersIds = allowedUsersDocs.docs.map((doc) => doc.id);

  if (!allowedUsersIds.includes(decodedToken.uid)) {
    return redirect("/", {
      status: 403,
    });
  }

  console.log(decodedToken.uid);
  console.log(allowedUsersIds);

  adminAuth.setCustomUserClaims(decodedToken.uid, {});

  const session = await createUserSession(idToken);

  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export default function Login() {
  const fetcher = useFetcher();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await credential.user.getIdToken();

      fetcher.submit(
        { idToken },
        {
          method: "POST",
        }
      );
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.log(error.message);
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Email" name="email" />
        <input type="password" placeholder="Password" name="password" />

        <button>Login</button>
      </form>
    </div>
  );
}
