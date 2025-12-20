"use client";

import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function LoginPage() {
  const auth = useContext(AuthContext);
  const [workEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!auth || auth.loading) return <p>Checking session…</p>;

  if (auth.authenticated) {
    return <p>Logged in as {auth.user.workEmail}</p>;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await auth.login(workEmail, password);
      }}
    >
      <input
        placeholder="Work Email"
        value={workEmail}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
