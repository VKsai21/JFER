"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

export default function LoginPage() {
  const router =
    useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* ==========================================================
     LOGIN
  ========================================================== */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    try {
      /* ========================================================
         STEP 1
         FIREBASE AUTHENTICATION
      ======================================================== */

      await setPersistence(
        auth,
        browserSessionPersistence
      );

      const credential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

      const loggedInUser =
        credential.user;

      /* ========================================================
         STEP 2
         GET FRESH FIREBASE ID TOKEN

         The token is sent to the server.
         The server verifies it using Firebase Admin.
      ======================================================== */

      const idToken =
        await loggedInUser.getIdToken(
          true
        );

      /* ========================================================
         STEP 3
         CREATE SECURE SERVER SESSION

         Server verifies:

         Firebase user
              ↓
         Firestore role
              ↓
         account status
              ↓
         mustChangePassword
              ↓
         HTTP-only session cookie
      ======================================================== */

      const sessionResponse =
        await fetch(
          "/api/auth/session",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              idToken,
            }),
          }
        );

      let sessionData:
        | {
            success?: boolean;
            role?: string;
            status?: string;
            mustChangePassword?: boolean;
            message?: string;
          }
        | null = null;

      try {
        sessionData =
          await sessionResponse.json();
      } catch {
        sessionData = null;
      }

      /* ========================================================
         STEP 4
         SESSION CREATION FAILED
      ======================================================== */

      if (
        !sessionResponse.ok ||
        !sessionData?.success
      ) {
        await signOut(auth);

        setError(
          sessionData?.message ||
            "Unable to establish a secure login session."
        );

        return;
      }

      /* ========================================================
         STEP 5
         ACCOUNT STATUS

         The server should already validate this,
         but we also check the returned value here.
      ======================================================== */

      if (
        sessionData.status &&
        sessionData.status !==
          "active"
      ) {
        await signOut(auth);

        setError(
          "Your account is currently inactive. Please contact the administrator."
        );

        return;
      }

      /* ========================================================
         STEP 6
         FORCE REVIEWER TO CHANGE TEMPORARY PASSWORD

         This is the important addition.

         When admin approves a reviewer:

         users/{uid}
           mustChangePassword: true

         The reviewer can authenticate using the
         temporary password, but cannot enter the
         reviewer dashboard until it is changed.
      ======================================================== */

      if (
        sessionData.role ===
          "reviewer" &&
        sessionData.mustChangePassword ===
          true
      ) {
        router.replace(
          "/change-password"
        );

        return;
      }

      /* ========================================================
         STEP 7
         ADMIN
      ======================================================== */

      if (
        sessionData.role ===
        "admin"
      ) {
        router.replace(
          "/admin"
        );

        return;
      }

      /* ========================================================
         STEP 8
         SUPER ADMIN

         Keep this if your system uses super_admin.
         The admin pages should also validate this role.
      ======================================================== */

      if (
        sessionData.role ===
        "super_admin"
      ) {
        router.replace(
          "/admin"
        );

        return;
      }

      /* ========================================================
         STEP 9
         REVIEWER

         At this point mustChangePassword is either
         false or missing.
      ======================================================== */

      if (
        sessionData.role ===
        "reviewer"
      ) {
        router.replace(
          "/reviewer"
        );

        return;
      }

      /* ========================================================
         STEP 10
         UNKNOWN ROLE

         Never allow an authenticated Firebase account
         into the application without an approved role.
      ======================================================== */

      await signOut(auth);

      setError(
        "Your account is authenticated, but you do not have an authorized JFER role."
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "LOGIN: Authentication error:",
        error
      );

      let message =
        "Unable to sign in. Please check your credentials and try again.";

      if (
        error instanceof Error
      ) {
        const firebaseError =
          error as Error & {
            code?: string;
          };

        switch (
          firebaseError.code
        ) {
          case "auth/invalid-credential":

          case "auth/wrong-password":

          case "auth/user-not-found":

          case "auth/invalid-login-credentials":
            message =
              "Invalid email address or password.";
            break;

          case "auth/invalid-email":
            message =
              "Please enter a valid email address.";
            break;

          case "auth/user-disabled":
            message =
              "This account has been disabled. Please contact the administrator.";
            break;

          case "auth/too-many-requests":
            message =
              "Too many failed login attempts. Please try again later.";
            break;

          case "auth/network-request-failed":
            message =
              "Network error. Please check your internet connection and try again.";
            break;

          default:
            console.error(
              "LOGIN: Firebase error:",
              firebaseError
            );
        }
      }

      setError(
        message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <main className="h-dvh w-full overflow-hidden bg-white">

      <div className="flex h-full w-full">

        {/* =====================================================
            LEFT BRANDING PANEL
        ====================================================== */}

        <section
          className="
            relative
            hidden
            h-full
            w-[55%]
            overflow-hidden
            bg-[#111111]
            lg:flex
            lg:flex-col
          "
        >

          {/* Architectural lines */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.08]
            "
          >

            <div
              className="
                absolute
                left-[18%]
                top-0
                h-full
                w-px
                bg-white
              "
            />

            <div
              className="
                absolute
                left-[55%]
                top-0
                h-full
                w-px
                bg-white
              "
            />

            <div
              className="
                absolute
                bottom-[25%]
                left-0
                h-px
                w-full
                bg-white
              "
            />

          </div>

          {/* Decorative circles */}

          <div
            className="
              absolute
              -left-32
              -top-32
              h-[420px]
              w-[420px]
              rounded-full
              border
              border-white/[0.06]
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -right-40
              h-[480px]
              w-[480px]
              rounded-full
              border
              border-white/[0.06]
            "
          />

          {/* Main content */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              justify-between
              px-10
              py-10
              xl:px-14
              xl:py-12
            "
          >

            {/* =================================================
                TOP
            ================================================== */}

            <div>

              {/* Logo */}

              <div className="mb-8 flex h-16 w-16 items-center justify-center">

                <img
                  src="/Journel_logo.png"
                  alt="JFER Logo"
                  className="h-16 w-16 object-contain"
                />

              </div>

              <h2
                className="
                  text-2xl
                  font-medium
                  uppercase
                  tracking-[0.32em]
                  text-white
                "
              >
                Journal of Future
              </h2>

              <h2
                className="
                  mt-1
                  max-w-[520px]
                  text-[clamp(2rem,3.4vw,3.6rem)]
                  font-medium
                  uppercase
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-white
                "
              >
                Engineering
                <br />
                & <br />
                Research
              </h2>

              <div
                className="
                  mt-7
                  h-px
                  w-16
                  bg-[#d8b78d]
                "
              />

              <p
                className="
                  mt-6
                  max-w-[440px]
                  text-sm
                  leading-7
                  text-white/60
                  xl:text-base
                "
              >
                A platform for publishing,
                reviewing and discovering
                innovative research in
                engineering and technology.
              </p>

            </div>

            {/* =================================================
                CENTER VISUAL
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-[14%]
                right-[8%]
                hidden
                h-[42%]
                w-[42%]
                xl:block
              "
            >

              {/* Large document */}

              <div
                className="
                  absolute
                  left-[15%]
                  top-[15%]
                  h-[65%]
                  w-[58%]
                  rotate-[-7deg]
                  border
                  border-white/20
                  bg-white/[0.04]
                  shadow-2xl
                "
              >

                <div
                  className="
                    absolute
                    left-[12%]
                    right-[12%]
                    top-[15%]
                    h-px
                    bg-white/30
                  "
                />

                <div
                  className="
                    absolute
                    left-[12%]
                    right-[22%]
                    top-[25%]
                    h-px
                    bg-white/15
                  "
                />

                <div
                  className="
                    absolute
                    left-[12%]
                    right-[18%]
                    top-[33%]
                    h-px
                    bg-white/15
                  "
                />

                <div
                  className="
                    absolute
                    bottom-[15%]
                    left-[12%]
                    h-[22%]
                    w-[30%]
                    border
                    border-white/10
                  "
                />

                <div
                  className="
                    absolute
                    bottom-[15%]
                    right-[12%]
                    h-[22%]
                    w-[25%]
                    border
                    border-white/10
                  "
                />

              </div>

              {/* Open book */}

              <div
                className="
                  absolute
                  bottom-[10%]
                  right-[2%]
                  flex
                  h-[38%]
                  w-[65%]
                  rotate-[5deg]
                "
              >

                <div
                  className="
                    h-full
                    w-1/2
                    border
                    border-white/15
                    bg-white/[0.06]
                  "
                />

                <div
                  className="
                    h-full
                    w-1/2
                    border
                    border-white/15
                    bg-white/[0.08]
                  "
                />

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    h-full
                    w-px
                    bg-white/20
                  "
                />

              </div>

              {/* Gold accent */}

              <div
                className="
                  absolute
                  left-[5%]
                  top-[40%]
                  h-1
                  w-20
                  rotate-[-35deg]
                  bg-[#d8b78d]
                "
              />

            </div>

            {/* =================================================
                BOTTOM
            ================================================== */}

            <div>

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-[#d8b78d]
                "
              >
                Academic Leadership
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  text-white/40
                "
              >
                Editorial & Research
                Management System
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <section
          className="
            flex
            h-full
            min-h-0
            w-full
            flex-1
            items-center
            justify-center
            overflow-hidden
            bg-white
            px-6
            py-6
            sm:px-10
            lg:w-[45%]
            lg:flex-none
            xl:px-20
          "
        >

          <div
            className="
              flex
              max-h-full
              w-full
              max-w-[450px]
              flex-col
              justify-center
            "
          >

            {/* =================================================
                MOBILE LOGO
            ================================================== */}

            <div
              className="
                mb-8
                flex
                items-center
                gap-3
                lg:hidden
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#244e70]
                  text-[#244e70]
                "
              >

                <span className="text-[10px] font-bold">
                  JFER
                </span>

              </div>

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    tracking-[0.08em]
                    text-[#244e70]
                  "
                >
                  JFER
                </p>

                <p className="text-[10px] text-[#777777]">
                  Journal of Future Engineering & Research
                </p>

              </div>

            </div>

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="mb-8">

              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#244e70]
                "
              >
                Secure Access
              </p>

              <h2
                className="
                  mt-3
                  text-[clamp(2rem,3.2vw,2.8rem)]
                  font-medium
                  tracking-[-0.035em]
                  text-[#111111]
                "
              >
                Welcome back
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-[#666666]
                "
              >
                Sign in to access the JFER
                editorial management system.
              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p className="leading-5">
                  {error}
                </p>

              </div>
            )}

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#555555]
                  "
                >
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      text-[#244e70]
                    "
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    disabled={
                      loading
                    }
                    className="
                      h-12
                      w-full
                      border-0
                      border-b
                      border-[#d5d5d5]
                      bg-transparent
                      pl-8
                      pr-2
                      text-sm
                      text-[#111111]
                      outline-none
                      transition-colors
                      placeholder:text-[#999999]
                      focus:border-[#244e70]
                      disabled:opacity-60
                    "
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#555555]
                  "
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      text-[#244e70]
                    "
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={
                      loading
                    }
                    className="
                      h-12
                      w-full
                      border-0
                      border-b
                      border-[#d5d5d5]
                      bg-transparent
                      pl-8
                      pr-10
                      text-sm
                      text-[#111111]
                      outline-none
                      transition-colors
                      placeholder:text-[#999999]
                      focus:border-[#244e70]
                      disabled:opacity-60
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    disabled={
                      loading
                    }
                    className="
                      absolute
                      right-0
                      top-1/2
                      -translate-y-1/2
                      p-1
                      text-[#666666]
                      transition-colors
                      hover:text-[#244e70]
                      disabled:opacity-50
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}

                  </button>

                </div>

              </div>

              {/* =================================================
                  SUBMIT
              ================================================== */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  group
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  bg-[#111111]
                  px-6
                  text-sm
                  font-medium
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#244e70]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In

                    <ArrowRight
                      size={17}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    />

                  </>
                )}

              </button>

            </form>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="mt-8">

              <div
                className="
                  mb-5
                  h-px
                  w-12
                  bg-[#d8b78d]
                "
              />

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-[#999999]
                "
              >
                Authorized access only
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-[#aaaaaa]
                "
              >
                JFER Editorial Management System
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}