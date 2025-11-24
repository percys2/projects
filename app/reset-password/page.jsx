"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/src/lib/supabase/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code"); // VERY IMPORTANT

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      setError("Invalid or missing reset code.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    // Apply password change
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully!");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen flex items-center">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2 w-full rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button className="w-full bg-indigo-600 text-white p-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
}
