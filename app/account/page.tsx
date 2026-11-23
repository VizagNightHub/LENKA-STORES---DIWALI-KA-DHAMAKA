"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  LogOut,
  Package,
  Save,
  Upload,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORE_CONFIG } from "@/data/storeConfig";
import { auth, db } from "@/lib/firebase";

const phoneToEmail = (phone: string) => `${phone}@users.lenkastore.in`;

interface CustomerProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  photo: string;
  pincode: string;
  state: string;
  district: string;
  city: string;
  streetRoad: string;
  landmark: string;
  address: string;
  wishlist?: string[];
}

interface OrderSummary {
  id: string;
  orderId?: string;
  totalAmount?: number;
  status?: string;
  expectedDeliveryDate?: string;
  trackingId?: string;
}

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 300;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Auth form fields
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupDob, setSignupDob] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        setUser(u);
        const snap = await getDoc(doc(db, "customers", u.uid));
        if (snap.exists()) {
          const data = snap.data() as CustomerProfile;
          setProfile(data);
          if (data.phone) {
            try {
              const oq = query(
                collection(db, "orders"),
                where("phone", "==", data.phone),
                limit(15)
              );
              const osnap = await getDocs(oq);
              setOrders(
                osnap.docs.map((d) => ({
                  id: d.id,
                  ...(d.data() as Omit<OrderSummary, "id">),
                }))
              );
            } catch {
              // Ignore order query errors
            }
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanPhone = loginPhone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      setAuthError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (loginPass.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, phoneToEmail(cleanPhone), loginPass);
    } catch {
      setAuthError("Incorrect mobile number or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanPhone = signupPhone.replace(/\D/g, "");
    if (!signupName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      setAuthError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (signupPass.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (signupPass !== signupConfirm) {
      setAuthError("Passwords do not match. Please enter the same password twice.");
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        phoneToEmail(cleanPhone),
        signupPass
      );
      const newProfile: CustomerProfile = {
        uid: cred.user.uid,
        name: signupName.trim(),
        phone: cleanPhone,
        email: signupEmail.trim(),
        dob: signupDob,
        photo: "",
        pincode: "",
        state: STORE_CONFIG.supportedStates[0],
        district: "",
        city: "",
        streetRoad: "",
        landmark: "",
        address: "",
        wishlist: [],
      };
      await setDoc(doc(db, "customers", cred.user.uid), {
        ...newProfile,
        createdAt: serverTimestamp(),
      });
      setProfile(newProfile);
    } catch {
      setAuthError("This mobile number is already registered, or connection failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const img = await compressAvatar(file);
    setProfile({ ...profile, photo: img });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSavingProfile(true);
    setSaveMsg("");
    try {
      await setDoc(
        doc(db, "customers", user.uid),
        { ...profile, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSaveMsg("Profile & address saved!");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F3] text-[#071410]">
        Loading account...
      </main>
    );
  }

  if (!user || !profile) {
    return (
      <main className="min-h-screen bg-[#FAF8F3] px-4 py-10 text-[#071410] sm:px-8">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0D211B]/70 hover:text-[#071410]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenka Store
          </Link>

          <div className="mt-6 rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF8F3] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError("");
                }}
                className={`cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "login"
                    ? "bg-[#071410] text-[#FFFDF2]"
                    : "text-[#0D211B]/70"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAuthError("");
                }}
                className={`cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "signup"
                    ? "bg-[#071410] text-[#FFFDF2]"
                    : "text-[#0D211B]/70"
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <h1 className="text-xl font-bold">Welcome Back</h1>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-Digit Mobile Number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 font-mono text-sm outline-none focus:border-[#C9A45C]"
                />
                <div className="relative">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 pr-11 text-sm outline-none focus:border-[#C9A45C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#0D211B]/60"
                  >
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-full bg-[#C9A45C] py-3 text-sm font-bold text-[#071410] hover:bg-[#d8b673] disabled:opacity-50"
                >
                  {submitting ? "Signing In..." : "Login to My Profile"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <h1 className="text-xl font-bold">Create Your Account</h1>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 text-sm outline-none focus:border-[#C9A45C]"
                />
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-Digit Mobile Number *"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 font-mono text-sm outline-none focus:border-[#C9A45C]"
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 text-sm outline-none focus:border-[#C9A45C]"
                />
                <div>
                  <label className="mb-1 block text-xs text-[#0D211B]/65">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={signupDob}
                    onChange={(e) => setSignupDob(e.target.value)}
                    className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPass1 ? "text" : "password"}
                    placeholder="Enter Password (min 6 chars) *"
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 pr-11 text-sm outline-none focus:border-[#C9A45C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass1((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#0D211B]/60"
                  >
                    {showPass1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPass2 ? "text" : "password"}
                    placeholder="Confirm Password *"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-3 pr-11 text-sm outline-none focus:border-[#C9A45C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass2((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#0D211B]/60"
                  >
                    {showPass2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-full bg-[#C9A45C] py-3 text-sm font-bold text-[#071410] hover:bg-[#d8b673] disabled:opacity-50"
                >
                  {submitting ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] px-4 py-10 text-[#071410] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0D211B]/70 hover:text-[#071410]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenka Store
          </Link>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#0D211B]/20 bg-white px-4 py-2 text-xs font-bold text-[#071410] hover:border-[#C9A45C]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Editable Profile & Saved Address */}
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm lg:col-span-7"
          >
            <div className="flex items-center gap-4">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full border-2 border-[#C9A45C] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#071410] text-[#C9A45C]">
                  <UserIcon className="h-7 w-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="font-mono text-xs text-[#0D211B]/65">+91 {profile.phone}</p>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#C9A45C] hover:underline">
                  <Upload className="h-3 w-3" /> Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
              <input
                type="text"
                maxLength={6}
                placeholder="6-Digit Pincode"
                value={profile.pincode}
                onChange={(e) =>
                  setProfile({ ...profile, pincode: e.target.value.replace(/\D/g, "") })
                }
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 font-mono text-sm outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-3 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              >
                {STORE_CONFIG.supportedStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="District"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-3 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
              <input
                type="text"
                placeholder="City / Town"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-3 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Street & Road No."
                value={profile.streetRoad}
                onChange={(e) => setProfile({ ...profile, streetRoad: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
              <input
                type="text"
                placeholder="Landmark"
                value={profile.landmark}
                onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
              />
            </div>

            <textarea
              rows={2}
              placeholder="House / Flat / Door No."
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
            />

            {saveMsg && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> {saveMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9A45C] py-3 text-sm font-bold text-[#071410] hover:bg-[#d8b673] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save Profile & Address"}
            </button>
          </form>

          {/* Right: Order History & Wishlist */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Package className="h-4 w-4 text-[#C9A45C]" /> My Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <p className="mt-3 text-xs text-[#0D211B]/60">No orders placed yet.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-[#0D211B]/10 bg-[#FAF8F3] p-3 text-xs"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="font-mono">{o.orderId || o.id}</span>
                        <span>₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="mt-1 text-[#0D211B]/70">
                        Status: <strong>{o.status || "PENDING_VERIFICATION"}</strong>
                      </p>
                      {o.expectedDeliveryDate && (
                        <p className="text-[#0D211B]/70">
                          Expected: {o.expectedDeliveryDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Heart className="h-4 w-4 text-[#C9A45C]" /> Saved Wishlist (
                {profile.wishlist?.length || 0})
              </h2>
              <p className="mt-2 text-xs text-[#0D211B]/65">
                Tap the heart icon on any product in Fashion, Electronics, or New Launch to save it here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
