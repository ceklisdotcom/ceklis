"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState } from "react"
import { loginAction, type AuthState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Loader2 } from "lucide-react"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null as AuthState | null)

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-xs">
          <CheckCircle2 className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Masuk ke Ceklis</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Platform kolaborasi dan ceklis komunitas terpadu
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-destructive text-sm animate-in fade-in-50">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.message && !state.error && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in-50">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Alamat Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                autoComplete="email"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="pl-9 h-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 font-medium transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-border/40 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
