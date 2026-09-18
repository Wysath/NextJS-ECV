import { createAuthClient } from "better-auth/react";

// No baseURL: the client calls /api/auth on the origin serving the page
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
