"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Login data:", data);
  };

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to your account
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}
