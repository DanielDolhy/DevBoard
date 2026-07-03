"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Register data:", data);
  };

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join us and start your journey
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </>
  );
}
