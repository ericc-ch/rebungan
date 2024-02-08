import { ServiceAccount, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { singleton } from "../utils/singleton.server";
import serviceAccount from "./service-account.json";

export const adminApp = singleton("firebase-admin", () =>
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  })
);

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
