"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Lock, Unlock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { loginAction } from "./action";
import { AuthData } from "@gws/api-client";

export default function LoginPage() {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const {
    form,
    action: { result },
    handleSubmitWithAction,
  } = useHookFormAction(loginAction, zodResolver(AuthData), {
    formProps: {
      defaultValues: {
        username: "",
        password: "",
        remember: false,
      },
    },
  });

  function changePasswordVisibility() {
    setIsPasswordHidden((prev) => !prev);
  }

  useEffect(() => {
    if (!result.serverError) {
      return;
    }

    if (result.serverError.kind === "Unauthorized") {
      form.setError("root", {
        type: "response",
        message: "Invalid credentials",
      });
    } else {
      form.setError("root", {
        type: "response",
        message:
          "Oops! An unexpected error occurred. Please refresh the page or try again later.",
      });
    }
  }, [form, result]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6">
      <header className="flex flex-col items-center">
        <h1 className="mb-4 text-4xl font-bold">Log In</h1>
        <h2 className="text-center text-lg text-muted-foreground">
          Welcome back to Galilei Web Services
        </h2>
        <p className="text-base text-muted-foreground">
          Enter your credentials to log in
        </p>
      </header>
      <Form {...form}>
        <form
          onSubmit={handleSubmitWithAction}
          className="w-full max-w-sm space-y-8"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 p-2">
                    <User />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={isPasswordHidden ? "password" : "text"}
                      autoComplete="off"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2"
                    onClick={changePasswordVisibility}
                  >
                    {isPasswordHidden ? <Lock /> : <Unlock />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            Login
          </Button>
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root?.message}
          </p>
        </form>
      </Form>
      <footer className="text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary underline">
          Register
        </Link>
      </footer>
    </div>
  );
}
