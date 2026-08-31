
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  updatePassword,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  useRouter,
} from "next/navigation";

import {
  auth,
  firestore,
} from "@/lib/firebase";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
  Check,
  CircleAlert,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace("/login");
            return;
          }

          try {
            const userSnapshot =
              await getDoc(
                doc(
                  firestore,
                  "users",
                  currentUser.uid
                )
              );

            if (!userSnapshot.exists()) {
              router.replace("/login");
              return;
            }

            const data =
              userSnapshot.data();

            if (
              data.mustChangePassword !== true
            ) {
              router.replace("/reviewer");
              return;
            }

            setUser(currentUser);
          } catch {
            setError(
              "Unable to verify your account."
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength =
    Object.values(passwordChecks).filter(Boolean)
      .length;

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      setError("");

      if (!user) {
        return;
      }

      if (password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (password !== confirmPassword) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setSaving(true);

        await updatePassword(
          user,
          password
        );

        await updateDoc(
          doc(
            firestore,
            "users",
            user.uid
          ),
          {
            mustChangePassword: false,
            updatedAt: new Date(),
          }
        );

        router.replace("/reviewer");
      } catch (error: any) {
        console.error(error);

        if (
          error?.code ===
          "auth/requires-recent-login"
        ) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else {
          setError(
            error?.message ||
              "Unable to change password."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-10 h-10 rounded-full border-[3px] border-[#d9e2ea] border-t-[#244e70]"
          />

          <p className="text-sm text-[#777]">
            Verifying your account...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f8fa] flex items-center justify-center px-5 py-10">

      {/* Background decoration */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#244e70]/[0.06] blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6c8ca5]/[0.07] blur-3xl" />

        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[18%] left-[10%] w-24 h-24 rounded-3xl border border-[#244e70]/10 bg-white/30 backdrop-blur-sm"
        />

        <motion.div
          animate={{
            y: [0, 16, 0],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[16%] right-[10%] w-20 h-20 rounded-full border border-[#244e70]/10 bg-white/30 backdrop-blur-sm"
        />
      </div>

      {/* Main card */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-[26px] border border-[#e2e7eb] bg-white shadow-[0_25px_70px_rgba(20,40,55,0.10)]">

          {/* Top accent */}

          <div className="absolute top-0 left-0 right-0 h-1 bg-[#244e70]" />

          <div className="p-8 sm:p-9">

            {/* Logo */}

            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.12,
              }}
              className="flex items-center gap-3"
            >
              <div className="relative">

                <div className="w-12 h-12 rounded-[14px] bg-[#244e70] flex items-center justify-center shadow-lg shadow-[#244e70]/20">
                  <span className="text-white text-xl font-bold">
                    J
                  </span>
                </div>

                <div className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheck
                    size={13}
                    className="text-[#244e70]"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-[#172b3a]">
                  JFER
                </p>

                <p className="text-[11px] text-[#89939b]">
                  Journal Editorial System
                </p>
              </div>
            </motion.div>

            {/* Heading */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.18,
              }}
              className="mt-8"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#244e70]/[0.07] border border-[#244e70]/10">
                <LockKeyhole
                  size={12}
                  className="text-[#244e70]"
                />

                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#244e70]">
                  Account Security
                </span>
              </div>

              <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#111820]">
                Create a new password
              </h1>

              <p className="mt-2.5 text-[13px] leading-6 text-[#737d85]">
                Your temporary password needs to be
                replaced before you can continue to
                the reviewer portal.
              </p>
            </motion.div>

            {/* Error */}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                    <CircleAlert
                      size={17}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-xs leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* Password */}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#59636b]">
                  New Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa3aa]"
                  />

                  <input
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
                    placeholder="Enter your new password"
                    className="w-full h-12 rounded-xl border border-[#dfe4e8] bg-[#fbfcfd] pl-10 pr-11 text-sm text-[#18222b] placeholder:text-[#a7afb5] outline-none transition-all focus:border-[#244e70] focus:bg-white focus:ring-4 focus:ring-[#244e70]/[0.07]"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa3aa] hover:text-[#244e70] transition-colors"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {/* Strength */}

                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      className="mt-3"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(
                          (level) => (
                            <motion.div
                              key={level}
                              initial={{
                                scaleX: 0,
                              }}
                              animate={{
                                scaleX:
                                  level <= strength
                                    ? 1
                                    : 0.35,
                              }}
                              className="h-1 flex-1 rounded-full origin-left bg-[#dfe4e8]"
                            />
                          )
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-y-1.5">

                        {[
                          [
                            passwordChecks.length,
                            "8+ characters",
                          ],
                          [
                            passwordChecks.uppercase,
                            "Uppercase letter",
                          ],
                          [
                            passwordChecks.number,
                            "Number",
                          ],
                          [
                            passwordChecks.special,
                            "Special character",
                          ],
                        ].map(
                          ([valid, label]) => (
                            <div
                              key={
                                label as string
                              }
                              className="flex items-center gap-1.5"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                                  valid
                                    ? "bg-[#244e70]"
                                    : "bg-[#e5e8eb]"
                                }`}
                              >
                                <Check
                                  size={9}
                                  className="text-white"
                                />
                              </div>

                              <span className="text-[10px] text-[#7b858d]">
                                {label as string}
                              </span>
                            </div>
                          )
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#59636b]">
                  Confirm Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa3aa]"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    className={`w-full h-12 rounded-xl border bg-[#fbfcfd] pl-10 pr-11 text-sm text-[#18222b] placeholder:text-[#a7afb5] outline-none transition-all focus:bg-white focus:ring-4 ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/[0.07]"
                          : "border-red-300 focus:border-red-400 focus:ring-red-400/[0.07]"
                        : "border-[#dfe4e8] focus:border-[#244e70] focus:ring-[#244e70]/[0.07]"
                    }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa3aa] hover:text-[#244e70] transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {confirmPassword.length > 0 && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`mt-2 text-[10px] ${
                        passwordsMatch
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}

              <motion.button
                whileHover={{
                  y: -1,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                type="submit"
                disabled={
                  saving ||
                  !password ||
                  !confirmPassword
                }
                className="group relative w-full h-12 overflow-hidden rounded-xl bg-[#244e70] text-white text-sm font-semibold shadow-lg shadow-[#244e70]/20 transition-all hover:bg-[#1d425f] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                <AnimatePresence mode="wait">
                  {saving ? (
                    <motion.div
                      key="loading"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                      />

                      <span>
                        Updating password...
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>
                        Change Password
                      </span>

                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

            </form>

            {/* Security note */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
              }}
              className="mt-7 pt-5 border-t border-[#edf0f2]"
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#244e70]"
                />

                <p className="text-[10px] leading-5 text-[#8a939a]">
                  Your new password will be securely
                  updated and your temporary password
                  will no longer be valid.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Footer */}

        <p className="mt-5 text-center text-[10px] text-[#9ba3a9]">
          JFER Editorial Management System
        </p>
      </motion.div>
    </main>
  );
}