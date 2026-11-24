"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  arrayRemove,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  LogOut,
  Package,
  Save,
  Trash2,
  Truck,
  Upload,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CancellableOrder,
  CancelOrderModal,
} from "@/components/orders/CancelOrderModal";
import { STORE_CONFIG } from "@/data/storeConfig";
import { auth, db } from "@/lib/firebase";

const phoneToEmail = (phone: string) => `${phone}@users.lenkastore.in`;

const DELIVERY_STEPS = [
  { id: "CONFIRMED", label: "Order Confirmed" },
  { id: "DISPATCHED", label: "Dispatched from Warehouse" },
  { id: "IN_TRANSIT", label: "Out for Delivery" },
  { id: "COMPLETED", label: "Delivery Completed" },
];

function getStepIndex(status?: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return 3;
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") return 2;
  if (status === "DISPATCHED") return 1;
  if (status === "CONFIRMED") return 0;
  return -1;
}

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

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  images?: string[];
}

interface OrderSummary {
  id: string;
  orderId?: string;
  totalAmount?: number;
  status?: string;
  expectedDeliveryDate?: string;
  trackingId?: string;
  cancelReason?: string;
  cancelComment?: string;
  items?: {
    id?: string;
    name: string;
    variant?: string;
    quantity?: number;
    qty?: number;
  }[];
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");

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

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CancellableOrder | null>(null);

  useEffect(() => {
    let unsubOrders: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }

      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        setUser(u);
        const snap = await getDoc(doc(db, "customers", u.uid));
        if (snap.exists()) {
          const data = snap.data() as CustomerProfile;
          setProfile(data);

          if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
            const loaded: WishlistProduct[] = [];
            for (const pid of data.wishlist) {
              try {
                const psnap = await getDoc(doc(db, "products", pid));
                if (psnap.exists()) {
                  loaded.push({
                    id: psnap.id,
                    ...(psnap.data() as Omit<WishlistProduct, "id">),
                  });
                }
              } catch {
                // Ignore missing
              }
            }
            setWishlistItems(loaded);
          } else {
            setWishlistItems([]);
          }

          const phoneDigits =
            data.phone || u.email.replace("@users.lenkastore.in", "");
          if (phoneDigits) {
            const oq = query(
              collection(db, "orders"),
              where("phone", "==", phoneDigits),
              limit(20)
            );
            unsubOrders = onSnapshot(oq, (osnap) => {
              setOrders(
                osnap.docs.map((d) => ({
                  id: d.id,
                  ...(d.data() as Omit<OrderSummary, "id">),
                }))
              );
            });
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        setOrders([]);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
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
      router.push("/");
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
      router.push("/");
    } catch {
      setAuthError("This mobile number is already registered, or connection failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (!user) return;
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    await updateDoc(doc(db, "customers", user.uid), {
      wishlist: arrayRemove(productId),
    });
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
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] text-[#0B2219]">
        Loading account...
      </main>
    );
  }

  if (!user || !profile) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] px-4 py-10 text-[#0B2219] sm:px-8">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D54] hover:text-[#0B5D3B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenka Store
          </Link>

          <div className="mt-6 rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#F8FAF9] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError("");
                }}
                className={`cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "login"
                    ? "bg-[#0B5D3B] text-white"
                    : "text-[#4A5D54]"
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
                    ? "bg-[#0B5D3B] text-white"
                    : "text-[#4A5D54]"
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
                  className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 font-mono text-sm outline-none focus:border-[#0B5D3B]"
                />
                <div className="relative">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 pr-11 text-sm outline-none focus:border-[#0B5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4A5D54]"
                  >
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white hover:bg-[#08472D] disabled:opacity-50"
                >
                  {submitting ? "Signing In..." : "Login"}
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
                  className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 text-sm outline-none focus:border-[#0B5D3B]"
                />
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-Digit Mobile Number *"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 font-mono text-sm outline-none focus:border-[#0B5D3B]"
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 text-sm outline-none focus:border-[#0B5D3B]"
                />
                <div>
                  <label className="mb-1 block text-xs text-[#4A5D54]">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={signupDob}
                    onChange={(e) => setSignupDob(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPass1 ? "text" : "password"}
                    placeholder="Enter Password (min 6 chars) *"
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 pr-11 text-sm outline-none focus:border-[#0B5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass1((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4A5D54]"
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
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 pr-11 text-sm outline-none focus:border-[#0B5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass2((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4A5D54]"
                  >
                    {showPass2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white hover:bg-[#08472D] disabled:opacity-50"
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
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 pb-24 text-[#0B2219] sm:px-8 md:pb-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D54] hover:text-[#0B5D3B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenka Store
          </Link>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DCE5DF] bg-white px-4 py-2 text-xs font-bold text-[#0B2219] hover:border-[#0B5D3B]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Editable Profile & Saved Address */}
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm lg:col-span-6"
          >
            <div className="flex items-center gap-4">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full border-2 border-[#0B5D3B] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B]">
                  <UserIcon className="h-7 w-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="font-mono text-xs text-[#4A5D54]">+91 {profile.phone}</p>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#0B5D3B] hover:underline">
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
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
              <input
                type="text"
                maxLength={6}
                placeholder="6-Digit Pincode"
                value={profile.pincode}
                onChange={(e) =>
                  setProfile({ ...profile, pincode: e.target.value.replace(/\D/g, "") })
                }
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 font-mono text-sm outline-none focus:border-[#0B5D3B]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
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
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
              <input
                type="text"
                placeholder="City / Town"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Street & Road No."
                value={profile.streetRoad}
                onChange={(e) => setProfile({ ...profile, streetRoad: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
              <input
                type="text"
                placeholder="Landmark"
                value={profile.landmark}
                onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
              />
            </div>

            <textarea
              rows={2}
              placeholder="House / Flat / Door No."
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-sm outline-none focus:border-[#0B5D3B]"
            />

            {saveMsg && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0B5D3B]">
                <CheckCircle2 className="h-4 w-4" /> {saveMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white hover:bg-[#08472D] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save Profile & Address"}
            </button>
          </form>

          {/* Right: Live Order & Delivery Details + Saved Wishlist */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Package className="h-4 w-4 text-[#0B5D3B]" /> My Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <p className="mt-3 text-xs text-[#4A5D54]">No orders placed yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {orders.map((o) => {
                    const status = o.status || "PENDING_VERIFICATION";
                    const isCancelled = status === "CANCELLED";
                    const stepIdx = getStepIndex(status);
                    const canCancel =
                      !isCancelled &&
                      status !== "DELIVERED" &&
                      status !== "COMPLETED";

                    return (
                      <div
                        key={o.id}
                        className="rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 font-bold">
                          <span className="font-mono text-sm text-[#0B2219]">
                            {o.orderId || o.id}
                          </span>
                          <span className="text-sm text-[#0B5D3B]">
                            ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {Array.isArray(o.items) && o.items.length > 0 && (
                          <p className="mt-1.5 text-[11px] font-medium text-[#4A5D54]">
                            {o.items
                              .map(
                                (i) =>
                                  `${i.name}${i.variant ? ` (${i.variant})` : ""} × ${
                                    i.quantity ?? i.qty ?? 1
                                  }`
                              )
                              .join(", ")}
                          </p>
                        )}

                        {/* Direct Inline Delivery Timeline */}
                        {isCancelled ? (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-700">
                            <p className="flex items-center gap-1.5 font-bold">
                              <XCircle className="h-3.5 w-3.5 shrink-0" />
                              Order Cancelled
                            </p>
                            {o.cancelReason && (
                              <p className="mt-0.5 pl-5">Reason: {o.cancelReason}</p>
                            )}
                            {o.cancelComment && (
                              <p className="mt-0.5 pl-5 text-red-600">
                                Note: {o.cancelComment}
                              </p>
                            )}
                          </div>
                        ) : stepIdx === -1 ? (
                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#0B5D3B]/20 bg-[#EDF5F0] p-2.5 text-[11px] font-semibold text-[#0B5D3B]">
                            <Package className="h-3.5 w-3.5 shrink-0" />
                            Payment received — waiting for team verification.
                          </div>
                        ) : (
                          <div className="mt-3 space-y-1.5 rounded-xl border border-[#DCE5DF] bg-white p-3">
                            {DELIVERY_STEPS.map((st, idx) => {
                              const done = idx <= stepIdx;
                              return (
                                <div key={st.id} className="flex items-center gap-2">
                                  <CheckCircle2
                                    className={`h-4 w-4 shrink-0 ${
                                      done ? "text-[#0B5D3B]" : "text-[#DCE5DF]"
                                    }`}
                                  />
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      done ? "text-[#0B2219]" : "text-[#4A5D54]/45"
                                    }`}
                                  >
                                    {st.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(o.expectedDeliveryDate || o.trackingId) && (
                          <div className="mt-2.5 space-y-1 rounded-xl border border-[#DCE5DF] bg-white p-2.5 text-[11px]">
                            {o.expectedDeliveryDate && (
                              <p className="flex items-center gap-1.5 text-[#0B2219]">
                                <Calendar className="h-3.5 w-3.5 text-[#0B5D3B]" />
                                Expected Delivery:{" "}
                                <strong>{o.expectedDeliveryDate}</strong>
                              </p>
                            )}
                            {o.trackingId && (
                              <p className="flex items-center gap-1.5 font-mono text-[#0B5D3B]">
                                <Truck className="h-3.5 w-3.5" />
                                Tracking ID: <strong>{o.trackingId}</strong>
                              </p>
                            )}
                          </div>
                        )}

                        {canCancel && (
                          <div className="mt-3 flex justify-end border-t border-[#E6ECE8] pt-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setCancelTarget({
                                  id: o.id,
                                  orderId: o.orderId,
                                  totalAmount: o.totalAmount,
                                  items: o.items,
                                })
                              }
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-3 w-3" /> Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Heart className="h-4 w-4 text-[#0B5D3B]" /> Saved Wishlist (
                {wishlistItems.length})
              </h2>
              {wishlistItems.length === 0 ? (
                <p className="mt-2 text-xs text-[#4A5D54]">
                  Tap the heart icon on any product to save it here.
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] p-2.5"
                    >
                      <Link
                        href={`/${item.category}#product-${item.id}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <img
                          src={item.images?.[0] || "/images/new-launch.png"}
                          alt={item.name}
                          className="h-11 w-11 shrink-0 rounded-lg border border-[#DCE5DF] object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0B2219] hover:underline">
                            {item.name}
                          </p>
                          <p className="text-xs font-semibold text-[#0B5D3B]">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveWishlist(item.id)}
                        title="Remove from Wishlist"
                        className="cursor-pointer rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => setCancelTarget(null)}
        />
      )}
    </main>
  );
}
