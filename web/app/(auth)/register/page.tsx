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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { RegisterSchema, Register } from "@/lib/schema";
import { register } from "@/lib/actions";
import Link from "next/link";
import { Lock, Unlock, User } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const form = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirm: "",
      remember: false,
    },
  });

  async function onSubmit(data: Register) {
    await register(data);
  }

  function changePasswordVisibility() {
    setIsPasswordHidden((prev) => !prev);
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6">
      <header className="flex flex-col items-center">
        <h1 className="mb-4 text-4xl font-bold">Register</h1>
        <h2 className="text-center text-lg text-muted-foreground">
          Welcome to Galilei Web Services
        </h2>
        <p className="text-base text-muted-foreground">
          Create an account to start
        </p>
      </header>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
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
            Create
          </Button>
        </form>
      </Form>
      <footer className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Log In
        </Link>
      </footer>
    </div>
  );
}
