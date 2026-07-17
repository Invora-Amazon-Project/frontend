"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getMeService, updateProfileService } from "@/lib/authService";
import { getUserSubscription, type UserSubscription } from "@/lib/services/userSubscriptionsService";
import {
  deleteSellerAccount,
  getSellerAccounts,
  updateSellerAccount,
  type SellerAccountRecord,
} from "@/lib/services/sellerAccountsService";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { renameCurrentWorkspace } from "@/lib/workspaceSlice";

// TODO: Replace with real API calls — GET /user/billing, GET /user/notification-preferences, GET /user/plan

type TabKey = "profile" | "company" | "amazon" | "notifications" | "plan";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile",       label: "Profile" },
  { key: "company",       label: "Company & Billing" },
  { key: "amazon",        label: "Amazon Connection" },
  { key: "notifications", label: "Notifications" },
  { key: "plan",          label: "Plan & Credits" },
];

// Mock plan data
const MOCK_PLAN = {
  name: "Pro",
  price: "$49",
  billing: "monthly",
  renewalDate: "August 13, 2026",
  creditsUsed: 38,
  creditsTotal: 50,
};

const MOCK_PAYMENT_HISTORY = [
  { date: "Jul 13, 2026", amount: "$49.00", status: "Paid",    invoice: "#INV-2026-007" },
  { date: "Jun 13, 2026", amount: "$49.00", status: "Paid",    invoice: "#INV-2026-006" },
  { date: "May 13, 2026", amount: "$49.00", status: "Paid",    invoice: "#INV-2026-005" },
];

// Toggle switch component
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const initialTab = TABS.some((t) => t.key === tabFromUrl) ? (tabFromUrl as TabKey) : "profile";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Profile state
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [phone, setPhone]                 = useState("");
  const [marketplace, setMarketplace]     = useState("amazon.com");
  const [currency, setCurrency]           = useState("USD");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError]   = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMeService();
        if (cancelled) return;
        setFirstName(me.first_name ?? "");
        setLastName(me.last_name ?? "");
        setEmail(me.email);
        setPhone(me.phone_number ?? "");
        setMarketplace(me.default_marketplace ?? "amazon.com");
        setCurrency(me.default_currency ?? "USD");
      } catch {
        if (!cancelled) setProfileError("Profil bilgileri yüklenemedi.");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Workspace state
  const dispatch = useAppDispatch();
  const {
    current: workspace,
    loading: workspaceLoading,
    renaming: workspaceSaving,
    renameError: workspaceError,
  } = useAppSelector((s) => s.workspace);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSaved, setWorkspaceSaved] = useState(false);

  useEffect(() => {
    if (workspace) setWorkspaceName(workspace.name);
  }, [workspace]);

  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) return;
    const result = await dispatch(renameCurrentWorkspace(workspaceName.trim()));
    if (renameCurrentWorkspace.fulfilled.match(result)) {
      setWorkspaceSaved(true);
      setTimeout(() => setWorkspaceSaved(false), 2500);
    }
  };

  // Subscription state (Plan & Credits tab)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUserSubscription()
      .then((sub) => {
        if (!cancelled) setSubscription(sub);
      })
      .catch(() => {
        if (!cancelled) setSubscription(null);
      })
      .finally(() => {
        if (!cancelled) setPlanLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Company state
  const [companyName, setCompanyName]     = useState("Gürel Trading Ltd.");
  const [vatNumber, setVatNumber]         = useState("TR-1234567890");
  const [billingAddress, setBillingAddress] = useState("123 Merchant Street\nIstanbul, 34000\nTurkey");
  const [billingEmail, setBillingEmail]   = useState("billing@gureltrading.com");
  const [billingSaved, setBillingSaved]   = useState(false);

  // Amazon connection state
  const [sellerAccounts, setSellerAccounts] = useState<SellerAccountRecord[]>([]);
  const [sellerAccountsLoading, setSellerAccountsLoading] = useState(true);
  const [sellerAccountsError, setSellerAccountsError] = useState("");
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSellerAccounts()
      .then((accounts) => {
        if (!cancelled) setSellerAccounts(accounts);
      })
      .catch((err) => {
        if (!cancelled) setSellerAccountsError(err.response?.data?.message ?? "Failed to load Amazon connections.");
      })
      .finally(() => {
        if (!cancelled) setSellerAccountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleActive = async (account: SellerAccountRecord) => {
    setTogglingId(account.id);
    try {
      const updated = await updateSellerAccount(account.id, { is_active: !account.is_active });
      setSellerAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      setSellerAccountsError("Failed to update connection status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    try {
      await deleteSellerAccount(id);
      setSellerAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setSellerAccountsError("Failed to disconnect Amazon account.");
    } finally {
      setDisconnectingId(null);
    }
  };

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    dailyPulse:        true,
    opportunities:     true,
    stock:             true,
    risk:              true,
    orderUpdates:      true,
    billingReminders:  true,
    announcements:     false,
    emailNotifications: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const setNotif = (key: keyof typeof notifPrefs, val: boolean) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      await updateProfileService({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        default_marketplace: marketplace,
        default_currency: currency,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setProfileError("Profil kaydedilemedi.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveBilling = () => {
    setBillingSaved(true);
    setTimeout(() => setBillingSaved(false), 2500);
  };

  const handleSaveNotif = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const creditsPercent = Math.round((MOCK_PLAN.creditsUsed / MOCK_PLAN.creditsTotal) * 100);

  const planName = subscription?.plan.name ?? MOCK_PLAN.name;
  const planPrice = subscription ? `$${subscription.plan.price}` : MOCK_PLAN.price;
  const planRenewalDate = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : MOCK_PLAN.renewalDate;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading font-semibold text-2xl">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account, billing, and preferences.</p>
      </div>

      <div className="flex items-start gap-6">
        {/* Left nav */}
        <nav className="w-48 shrink-0 bg-card-bg border border-border rounded-xl p-3 h-fit sticky top-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left text-sm py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? "bg-primary-light text-primary font-medium"
                  : "text-muted hover:text-body"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <>
              <div className="bg-card-bg border border-border rounded-xl p-6">
                <h2 className="text-heading font-semibold text-base mb-1">Workspace</h2>
                <p className="text-muted text-sm mb-4">The name of your workspace, visible to invited team members. Use the switcher in the sidebar to create or switch workspaces.</p>
                <div className="flex items-end gap-3">
                  <div className="flex-1 max-w-xs">
                    <Input
                      label="Workspace Name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      disabled={workspaceLoading}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveWorkspace}
                    disabled={workspaceLoading || workspaceSaving || !workspace}
                  >
                    {workspaceSaving ? "Saving..." : "Save"}
                  </Button>
                  {workspaceSaved && (
                    <span className="text-mint text-sm font-medium">Saved.</span>
                  )}
                  {workspaceError && (
                    <span className="text-rose text-sm font-medium">{workspaceError}</span>
                  )}
                </div>
              </div>

              <div className="bg-card-bg border border-border rounded-xl p-6">
              <h2 className="text-heading font-semibold text-base mb-5">Profile Information</h2>

              {/* Avatar */}
              <div className="flex flex-col items-start gap-2 mb-6">
                <div className="w-16 h-16 bg-primary-light text-primary text-xl font-bold rounded-full flex items-center justify-center select-none">
                  {firstName.trim() || lastName.trim() ? (
                    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase()
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                    </svg>
                  )}
                </div>
                <button className="text-xs text-primary hover:underline">
                  Change photo
                  {/* TODO: V2 feature */}
                </button>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-body">Email</label>
                  <div className="relative">
                    <input
                      readOnly
                      value={email}
                      className="w-full px-4 py-2.5 text-sm text-muted bg-section-bg border border-border rounded-lg outline-none cursor-not-allowed pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-xs text-muted">Contact support to change your email.</p>
                </div>
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                />
              </div>

              {/* Single-column selects */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-body">Default Marketplace</label>
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="amazon.com">amazon.com (US)</option>
                    <option value="amazon.co.uk">amazon.co.uk (UK)</option>
                    <option value="amazon.de">amazon.de (Germany)</option>
                    <option value="amazon.fr">amazon.fr (France)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-body">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveProfile}
                  disabled={profileLoading || profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Profile"}
                </Button>
                {profileSaved && (
                  <span className="text-mint text-sm font-medium">Changes saved.</span>
                )}
                {profileError && (
                  <span className="text-rose text-sm font-medium">{profileError}</span>
                )}
              </div>
              </div>
            </>
          )}

          {/* ── COMPANY & BILLING ── */}
          {activeTab === "company" && (
            <div className="bg-card-bg border border-border rounded-xl p-6">
              <h2 className="text-heading font-semibold text-base mb-5">Company & Billing</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  label="VAT / Tax Number"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="e.g. TR-1234567890"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-body block mb-1.5">Billing Address</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary resize-none placeholder:text-placeholder"
                  placeholder="Street, City, Postal Code, Country"
                />
              </div>

              <div className="mb-6">
                <Input
                  label="Billing Email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  type="email"
                  hint="Invoices will be sent to this address."
                />
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleSaveBilling}>
                  Save Billing Info
                </Button>
                {billingSaved && (
                  <span className="text-mint text-sm font-medium">Changes saved.</span>
                )}
              </div>
            </div>
          )}

          {/* ── AMAZON CONNECTION ── */}
          {activeTab === "amazon" && (
            <div className="bg-card-bg border border-border rounded-xl p-6">
              <h2 className="text-heading font-semibold text-base mb-5">Amazon Connection</h2>

              {sellerAccountsError && (
                <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg mb-4">{sellerAccountsError}</p>
              )}

              {sellerAccountsLoading ? (
                <p className="text-muted text-sm py-4">Loading Amazon connections…</p>
              ) : sellerAccounts.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {sellerAccounts.map((account) => (
                    <div key={account.id} className="flex items-start justify-between p-4 bg-section-bg border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-card-bg rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-peach font-black text-base leading-none">a</span>
                        </div>
                        <div>
                          <p className="text-heading text-sm font-medium">{account.marketplace_id}</p>
                          <p className="text-muted text-xs mt-0.5">Seller ID: {account.seller_id}</p>
                          <p className="text-muted text-xs mt-0.5">
                            Connected on{" "}
                            {new Date(account.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(account)}
                          disabled={togglingId === account.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
                            account.is_active ? "bg-mint-bg text-mint" : "bg-rose-bg text-rose"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full inline-block ${account.is_active ? "bg-mint" : "bg-rose"}`} />
                          {account.is_active ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          disabled={disconnectingId === account.id}
                          className="text-sm font-medium border border-border rounded-lg px-3 py-1.5 text-rose hover:bg-rose-bg transition-colors"
                        >
                          {disconnectingId === account.id ? "Disconnecting…" : "Disconnect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-14 h-14 bg-section-bg rounded-full flex items-center justify-center mb-4">
                    <span className="text-peach font-black text-2xl leading-none">a</span>
                  </div>
                  <p className="text-heading font-medium text-sm mb-2">Connect your Amazon Seller account</p>
                  <p className="text-muted text-sm max-w-xs mb-6">
                    Connect your Amazon Seller account to enable inventory sync and listing data.
                  </p>
                  <Button variant="primary" size="md" disabled title="Coming soon — the Amazon OAuth connection flow isn't available yet.">
                    Connect Amazon Account
                  </Button>
                  <p className="text-muted text-xs mt-3">Coming soon.</p>
                </div>
              )}

              <p className="text-muted text-xs mt-5 border-t border-border pt-4">
                MarginLane uses Amazon SP-API to read inventory and listing data. We never write to your listings without your explicit action.
              </p>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="bg-card-bg border border-border rounded-xl p-6">
              <h2 className="text-heading font-semibold text-base mb-1">Notification Preferences</h2>
              <p className="text-muted text-sm mb-5">Choose which alerts you want to receive.</p>

              <div className="space-y-0">
                {(
                  [
                    { key: "dailyPulse",        label: "Daily Pulse alerts",              desc: "Stock alerts, reorder candidates, and new opportunities" },
                    { key: "opportunities",      label: "Opportunity alerts",              desc: "Price changes that hit your target ROI" },
                    { key: "stock",              label: "Stock alerts",                    desc: "Low stock and stockout warnings" },
                    { key: "risk",               label: "Risk alerts",                     desc: "Profit drops, Amazon competition, and buy box changes" },
                    { key: "orderUpdates",       label: "Order updates",                   desc: "Status changes on your supplier orders" },
                    { key: "billingReminders",   label: "Billing reminders",               desc: "Renewal notices and payment confirmations" },
                    { key: "announcements",      label: "Product team announcements",      desc: "New features and platform updates" },
                  ] as { key: keyof typeof notifPrefs; label: string; desc: string }[]
                ).map((item, idx, arr) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between py-3.5 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <div>
                      <p className="text-body text-sm font-medium">{item.label}</p>
                      <p className="text-muted text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifPrefs[item.key]}
                      onChange={(val) => setNotif(item.key, val)}
                    />
                  </div>
                ))}
              </div>

              {/* Email notifications */}
              <div className="mt-5 pt-5 border-t border-border">
                <h3 className="text-heading font-medium text-sm mb-3">Delivery</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body text-sm font-medium">Email notifications</p>
                    <p className="text-muted text-xs mt-0.5">Receive alerts to halenur.gurel@hotmail.com</p>
                  </div>
                  <Toggle
                    checked={notifPrefs.emailNotifications}
                    onChange={(val) => setNotif("emailNotifications", val)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button variant="primary" size="md" onClick={handleSaveNotif}>
                  Save Preferences
                </Button>
                {notifSaved && (
                  <span className="text-mint text-sm font-medium">Preferences saved.</span>
                )}
              </div>
            </div>
          )}

          {/* ── PLAN & CREDITS ── */}
          {activeTab === "plan" && (
            <div className="space-y-5">
              {/* Current plan */}
              <div className="bg-card-bg border border-border rounded-xl p-6">
                <h2 className="text-heading font-semibold text-base mb-5">Current Plan</h2>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {planLoading ? "..." : planName}
                    </span>
                    <div>
                      <p className="text-heading font-bold text-xl">
                        {planLoading ? "..." : planPrice}
                        <span className="text-muted text-sm font-normal ml-1">/ {MOCK_PLAN.billing}</span>
                      </p>
                      <p className="text-muted text-xs mt-0.5">
                        {planLoading ? "Loading..." : `Renews on ${planRenewalDate}`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/manage-plan"
                    onClick={() => sessionStorage.setItem("manage-plan-from", "/dashboard/settings?tab=plan")}
                  >
                    <Button variant="primary" size="md">Change Plan</Button>
                  </Link>
                </div>

                {/* Credits bar */}
                <div className="bg-section-bg rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-body text-sm font-medium">Analysis Credits</p>
                    <p className="text-muted text-xs">
                      <span className="text-heading font-semibold">{MOCK_PLAN.creditsUsed}</span>
                      /{MOCK_PLAN.creditsTotal} used this month
                    </p>
                  </div>
                  <div className="h-2.5 bg-border rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        creditsPercent >= 90 ? "bg-rose" : creditsPercent >= 70 ? "bg-peach" : "bg-primary"
                      }`}
                      style={{ width: `${creditsPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted text-xs">
                      {MOCK_PLAN.creditsTotal - MOCK_PLAN.creditsUsed} credits remaining
                    </p>
                    <Button variant="outline" size="sm">Purchase Credits</Button>
                  </div>
                </div>
              </div>

              {/* Payment history */}
              <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-heading font-semibold text-base">Payment History</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-section-bg">
                      <th className="text-left text-xs font-semibold text-muted px-6 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-muted px-6 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-muted px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-muted px-6 py-3">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PAYMENT_HISTORY.map((row, idx) => (
                      <tr key={idx} className={idx < MOCK_PAYMENT_HISTORY.length - 1 ? "border-b border-border" : ""}>
                        <td className="px-6 py-3.5 text-body text-sm">{row.date}</td>
                        <td className="px-6 py-3.5 text-body text-sm font-medium">{row.amount}</td>
                        <td className="px-6 py-3.5">
                          <span className="bg-mint-bg text-mint text-xs font-medium px-2 py-0.5 rounded-full">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <button className="text-primary text-xs font-medium hover:underline">
                            Download {row.invoice}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast placeholder — used by save handlers */}
    </div>
  );
}
