import { ActionFunction, json, redirect } from "@remix-run/node";
import { useFetcher, useRouteError } from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useState } from "react";
import { z } from "zod";
import {
  adminAuth,
  adminFirestore,
} from "~/lib/firebase/firebase-admin.server";
import { auth } from "~/lib/firebase/firebase.client";
import { createUserSession, storage } from "~/lib/utils/session.server";
import {
  ValidateResult,
  createValidationResult,
  validateForm,
} from "~/lib/utils/validation";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const idToken = formData.get("idToken") as string;

  const decodedToken = await adminAuth.verifyIdToken(idToken);

  const allowedUsersDocs = await adminFirestore.collection("users").get();
  const allowedUsersIds = allowedUsersDocs.docs.map((doc) => doc.id);

  if (!allowedUsersIds.includes(decodedToken.uid)) {
    return json(
      createValidationResult<z.infer<typeof schema>>({
        email: ["Sorry but this app is for internal use only."],
      }),
      { status: 403 }
    );
  }

  console.log(decodedToken.uid);
  console.log(allowedUsersIds);

  const session = await createUserSession(idToken);

  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export default function Login() {
  const fetcher = useFetcher<
    ValidateResult<z.infer<typeof schema>> | undefined
  >();

  const [clientFormResult, setClientFormResult] =
    useState<ValidateResult<z.infer<typeof schema>>>();

  const formResult = fetcher.data ?? clientFormResult;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const result = validateForm(formData, schema);

    if (!result.isValid) return setClientFormResult(result);

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
        setClientFormResult(
          createValidationResult<z.infer<typeof schema>>({
            email: [error.message],
          })
        );
      } else {
        setClientFormResult(
          createValidationResult<z.infer<typeof schema>>({
            email: [JSON.stringify(error)],
          })
        );
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email" name="email" />
        {formResult?.errors.email?.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
        <input type="password" placeholder="Password" name="password" />

        <button>Login</button>
      </form>
    </div>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div>
      <h1>Error</h1>
      <p>{JSON.stringify(error)}</p>
    </div>
  );
};
