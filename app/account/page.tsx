"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
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
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Heart,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  Truck,
  User as UserIcon,
  X,
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

const FAQS = [
  {
    q: "How do I pay for my order?",
    a: "All orders are prepaid via UPI (GPay, PhonePe, Paytm, BHIM). Enter your 12-digit UTR and upload the payment screenshot at checkout.",
  },
  {
    q: "Where do you deliver?",
    a: "Fashion Wear, Electronics, and New Launch ship Pan-India. Diwali Ka Dhamaka firework combos ship exclusively across Andhra Pradesh & Telangana.",
  },
  {
    q: "How do cancellations & refunds work?",
    a: "You can cancel any order before delivery directly from My Orders. Since orders are prepaid, share your UPI ID in the cancel note for a quick refund.",
  },
  {
    q: "How can I contact support?",
    a: "Message us anytime on WhatsApp (+91 8977627028) or email vardhansai8116@gmail.com with your Order ID.",
  },
];

function getStepIndex(status?: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return 3;
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") return 2;
  if (status === "DISPATCHED") return 1;
  if (status === "CONFIRMED") return 0;
  return -1;
}

type AccountSection = "ORDERS" | "WISHLIST" | "ADDRESS" | "SECURITY" | "FAQ";

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
  const [activeSection, setActiveSection] = useState<AccountSection>("ORDERS");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CancellableOrder | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityErr, setSecurityErr] = useState("");

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
    if (!file || !profile || !user) return;
    const img = await compressAvatar(file);
    const updated = { ...profile, photo: img };
    setProfile(updated);
    await setDoc(
      doc(db, "customers", user.uid),
      { photo: img, updatedAt: serverTimestamp() },
      { merge: true }
    );
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
      setSaveMsg("Saved!");
      setEditingProfile(false);
      setEditingAddress(false);
      setTimeout(() => setSaveMsg(""), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErr("");
    setSecurityMsg("");
    if (!user) return;
    if (newPassword.length < 6) {
      setSecurityErr("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityErr("Passwords do not match.");
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setSecurityMsg("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setSecurityErr("For security, please Sign Out and Log In again before changing your password.");
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

  const formattedAddress = [
    profile.address,
    profile.streetRoad,
    profile.landmark,
    profile.city,
    profile.district,
    profile.state,
    profile.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-3 py-6 pb-24 text-[#0B2219] sm:px-8 md:pb-12">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D54] hover:text-[#0B5D3B] sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenka Store
          </Link>
          {saveMsg && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF5F0] px-3 py-1 text-xs font-bold text-[#0B5D3B]">
              <CheckCircle2 className="h-3.5 w-3.5" /> {saveMsg}
            </span>
          )}
        </div>

        {/* 1. Top Compact User Profile Header (Editable Photo + Name + Compact Address Line) */}
        <section className="rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full border-2 border-[#0B5D3B] object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B] sm:h-20 sm:w-20">
                    <UserIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                )}
                <label
                  title="Edit Photo"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0B5D3B] text-white shadow hover:bg-[#08472D]"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h1 className="text-lg font-bold text-[#0B2219] sm:text-2xl">
                  {profile.name}
                </h1>
                <p className="font-mono text-xs text-[#4A5D54]">
                  +91 {profile.phone}
                  {profile.email ? ` • ${profile.email}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingProfile((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-1.5 text-xs font-bold text-[#0B5D3B] transition hover:border-[#0B5D3B]"
            >
              <Pencil className="h-3.5 w-3.5" />
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>

          {/* Inline Edit Profile (Only User Details) */}
          {editingProfile && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-4 grid gap-3 border-t border-[#E6ECE8] pt-4 sm:grid-cols-3"
            >
              <input
                type="text"
                placeholder="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-2 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="shrink-0 cursor-pointer rounded-xl bg-[#0B5D3B] px-4 py-2 text-xs font-bold text-white hover:bg-[#08472D]"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Compact 1-Line Address Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6ECE8] pt-3 text-xs">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-[#4A5D54]">
              <MapPin className="h-4 w-4 shrink-0 text-[#0B5D3B]" />
              <span className="truncate">
                {formattedAddress || "No saved delivery address yet."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSection("ADDRESS");
                setEditingAddress(true);
              }}
              className="shrink-0 cursor-pointer rounded-full border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-1 text-[11px] font-bold text-[#0B5D3B] hover:border-[#0B5D3B]"
            >
              {formattedAddress ? "Change" : "Add Address"}
            </button>
          </div>
        </section>

        {/* 2. Flipkart-Style Quick 2x2 / 4-Column Shortcuts */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {[
            {
              id: "ORDERS" as AccountSection,
              label: `Orders (${orders.length})`,
              icon: Package,
            },
            {
              id: "WISHLIST" as AccountSection,
              label: `Wishlist (${wishlistItems.length})`,
              icon: Heart,
            },
            {
              id: "ADDRESS" as AccountSection,
              label: "Saved Address",
              icon: MapPin,
            },
            {
              id: "FAQ" as AccountSection,
              label: "Help & FAQs",
              icon: HelpCircle,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition sm:text-sm ${
                  active
                    ? "border-[#0B5D3B] bg-[#0B5D3B] text-white shadow-sm"
                    : "border-[#DCE5DF] bg-white text-[#0B2219] hover:border-[#0B5D3B]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Main Flipkart-Style Split: Left Line-by-Line Menu + Right Active Content */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Line-by-Line Account Menu */}
          <aside className="rounded-2xl border border-[#DCE5DF] bg-white p-2 shadow-sm lg:col-span-4 lg:h-fit">
            {[
              {
                id: "ORDERS" as AccountSection,
                label: "My Orders & Delivery Status",
                icon: Package,
              },
              {
                id: "WISHLIST" as AccountSection,
                label: "Saved Wishlist & Favorites",
                icon: Heart,
              },
              {
                id: "ADDRESS" as AccountSection,
                label: "Manage Delivery Address",
                icon: MapPin,
              },
              {
                id: "SECURITY" as AccountSection,
                label: "Account Security & Password",
                icon: ShieldCheck,
              },
              {
                id: "FAQ" as AccountSection,
                label: "FAQs & Customer Support",
                icon: HelpCircle,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-[#EDF5F0] text-[#0B5D3B]"
                      : "text-[#0B2219] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#0B5D3B]" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#4A5D54]/60" />
                </button>
              );
            })}

            <div className="my-1.5 border-t border-[#E6ECE8]" />

            <Link
              href="/privacy"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#4A5D54] hover:bg-[#F8FAF9] hover:text-[#0B5D3B]"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" /> Privacy Policy
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#4A5D54] hover:bg-[#F8FAF9] hover:text-[#0B5D3B]"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" /> Terms &amp; Conditions
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Link>

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 sm:text-sm"
            >
              <span className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4" /> Sign Out
              </span>
            </button>
          </aside>

          {/* Right Active Section Panel */}
          <section className="rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:col-span-8">
            {activeSection === "ORDERS" && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <Package className="h-4 w-4 text-[#0B5D3B]" /> My Orders (
                  {orders.length})
                </h2>
                {orders.length === 0 ? (
                  <p className="mt-3 text-xs text-[#4A5D54]">
                    No orders placed yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
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
            )}

            {activeSection === "WISHLIST" && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <Heart className="h-4 w-4 text-[#0B5D3B]" /> Saved Wishlist (
                  {wishlistItems.length})
                </h2>
                {wishlistItems.length === 0 ? (
                  <p className="mt-3 text-xs text-[#4A5D54]">
                    Tap the heart icon on any product to save it here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] p-3"
                      >
                        <Link
                          href={`/product/${item.id}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <img
                            src={item.images?.[0] || "/images/new-launch.png"}
                            alt={item.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-[#DCE5DF] object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#0B2219] hover:underline sm:text-sm">
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
            )}

            {activeSection === "ADDRESS" && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                    <MapPin className="h-4 w-4 text-[#0B5D3B]" /> Delivery Address
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingAddress((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#DCE5DF] bg-[#F8FAF9] px-3 py-1 text-xs font-bold text-[#0B5D3B] hover:border-[#0B5D3B]"
                  >
                    {editingAddress ? (
                      <>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </>
                    )}
                  </button>
                </div>

                {!editingAddress ? (
                  <div className="mt-4 rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4 text-xs leading-relaxed text-[#4A5D54] sm:text-sm">
                    <p className="font-bold text-[#0B2219]">{profile.name}</p>
                    <p className="mt-1">
                      {formattedAddress || "No saved address yet. Click Edit to add one."}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#0B5D3B]">
                      Mobile: +91 {profile.phone}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-Digit Pincode"
                        value={profile.pincode}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 font-mono text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                      />
                      <select
                        value={profile.state}
                        onChange={(e) =>
                          setProfile({ ...profile, state: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
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
                        onChange={(e) =>
                          setProfile({ ...profile, district: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="City / Town"
                        value={profile.city}
                        onChange={(e) =>
                          setProfile({ ...profile, city: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Street & Road No."
                        value={profile.streetRoad}
                        onChange={(e) =>
                          setProfile({ ...profile, streetRoad: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Landmark"
                        value={profile.landmark}
                        onChange={(e) =>
                          setProfile({ ...profile, landmark: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="House / Flat / Door No."
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                    />
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0B5D3B] py-2.5 text-xs font-bold text-white hover:bg-[#08472D] sm:text-sm"
                    >
                      <Save className="h-4 w-4" />
                      {savingProfile ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeSection === "SECURITY" && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <Lock className="h-4 w-4 text-[#0B5D3B]" /> Account Security &amp;
                  Password
                </h2>
                <p className="text-xs text-[#4A5D54]">
                  Logged in with mobile number{" "}
                  <strong className="font-mono text-[#0B2219]">
                    +91 {profile.phone}
                  </strong>
                  . Update your password below anytime.
                </p>

                <form onSubmit={handleChangePassword} className="max-w-sm space-y-3">
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-2.5 text-xs outline-none focus:border-[#0B5D3B] sm:text-sm"
                  />
                  {securityErr && (
                    <p className="text-xs font-medium text-red-600">{securityErr}</p>
                  )}
                  {securityMsg && (
                    <p className="text-xs font-semibold text-[#0B5D3B]">
                      {securityMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-[#0B5D3B] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#08472D]"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {activeSection === "FAQ" && (
              <div className="space-y-3">
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <HelpCircle className="h-4 w-4 text-[#0B5D3B]" /> FAQs &amp; Help
                </h2>
                <div className="space-y-2.5">
                  {FAQS.map((item) => (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4"
                    >
                      <p className="text-xs font-bold text-[#0B2219] sm:text-sm">
                        {item.q}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#4A5D54]">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
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
