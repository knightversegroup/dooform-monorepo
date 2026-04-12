"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Crown,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@dooform/shared/auth/hooks";
import { useTier } from "@dooform/shared/auth/hooks";
import { apiClient } from "@dooform/shared/api/client";
import type { UserTierName } from "@dooform/shared/auth/types";

interface TierCardProps {
  name: string;
  tierKey: UserTierName;
  price: string;
  priceNote?: string;
  features: { label: string; included: boolean }[];
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  isCurrent: boolean;
  currentTier: UserTierName;
  isLoading: boolean;
  onSelect: (tier: UserTierName) => void;
}

function TierCard({
  name,
  tierKey,
  price,
  priceNote,
  features,
  icon,
  accentColor,
  bgColor,
  borderColor,
  isCurrent,
  currentTier,
  isLoading,
  onSelect,
}: TierCardProps) {
  const tierOrder: Record<UserTierName, number> = { free: 0, pro: 1, max: 2 };
  const isUpgrade = tierOrder[tierKey] > tierOrder[currentTier];
  const isDowngrade = tierOrder[tierKey] < tierOrder[currentTier];

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 ${
        isCurrent ? borderColor : "border-neutral-200"
      } ${bgColor} p-6 transition-all hover:shadow-lg`}
    >
      {isCurrent && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white ${accentColor}`}
        >
          แผนปัจจุบัน
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor} text-white`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-bold text-neutral-900">{name}</h3>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="text-3xl font-bold text-neutral-900">{price}</span>
        {priceNote && (
          <span className="text-sm text-neutral-500 ml-1">{priceNote}</span>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            {feature.included ? (
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-neutral-300 mt-0.5 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                feature.included ? "text-neutral-700" : "text-neutral-400"
              }`}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(tierKey)}
        disabled={isCurrent || isLoading}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
          isCurrent
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : isUpgrade
              ? `${accentColor} text-white hover:opacity-90`
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
        } disabled:opacity-60`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : isCurrent ? (
          "แผนปัจจุบัน"
        ) : isUpgrade ? (
          "อัปเกรด"
        ) : isDowngrade ? (
          "ดาวน์เกรด"
        ) : (
          "เลือกแผน"
        )}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { setAuthState, user, accessToken, refreshToken } = useAuth();
  const { tierName, monthlyUsage } = useTier();
  const [changingTo, setChangingTo] = useState<UserTierName | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTier, setPendingTier] = useState<UserTierName | null>(null);

  const tierOrder: Record<UserTierName, number> = { free: 0, pro: 1, max: 2 };

  const handleSelectTier = useCallback(
    (tier: UserTierName) => {
      if (tier === tierName) return;

      // If downgrading, show confirmation
      if (tierOrder[tier] < tierOrder[tierName]) {
        setPendingTier(tier);
        setShowConfirmDialog(true);
        return;
      }

      // Upgrade directly
      performTierChange(tier);
    },
    [tierName]
  );

  const performTierChange = useCallback(
    async (tier: UserTierName) => {
      setError(null);
      setChangingTo(tier);
      setShowConfirmDialog(false);

      try {
        const result = await apiClient.changeTier(tier);

        // Update auth state with new tokens and updated user tier
        if (user && result.access_token && result.refresh_token) {
          const updatedUser = {
            ...user,
            tier: result.tier,
          };
          setAuthState(updatedUser, result.access_token, result.refresh_token);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการเปลี่ยนแผน"
        );
      } finally {
        setChangingTo(null);
        setPendingTier(null);
      }
    },
    [user, setAuthState]
  );

  const tiers: Omit<TierCardProps, "isCurrent" | "currentTier" | "isLoading" | "onSelect">[] = [
    {
      name: "Free",
      tierKey: "free",
      price: "\u0E3F0",
      priceNote: "/เดือน",
      icon: <Zap className="w-5 h-5" />,
      accentColor: "bg-neutral-600",
      bgColor: "bg-white",
      borderColor: "border-neutral-600",
      features: [
        { label: "ส่งออกเป็น PDF เท่านั้น", included: true },
        { label: "เทมเพลตฟรีเท่านั้น", included: true },
        { label: "สร้างเอกสารไม่จำกัด", included: true },
        { label: "ลายน้ำ Dooform บน PDF", included: true },
        { label: "ส่งออกเป็น DOCX", included: false },
        { label: "ตัวแก้ไข PDF", included: false },
      ],
    },
    {
      name: "Pro",
      tierKey: "pro",
      price: "เร็วๆ นี้",
      priceNote: undefined,
      icon: <Crown className="w-5 h-5" />,
      accentColor: "bg-blue-600",
      bgColor: "bg-blue-50/30",
      borderColor: "border-blue-600",
      features: [
        { label: "ส่งออกเป็น PDF + DOCX", included: true },
        { label: "เทมเพลตทั้งหมด", included: true },
        { label: "200 เอกสาร/เดือน", included: true },
        { label: "ไม่มีลายน้ำ", included: true },
        { label: "ตัวแก้ไข PDF", included: true },
        { label: "สร้างเอกสารไม่จำกัด", included: false },
      ],
    },
    {
      name: "Max",
      tierKey: "max",
      price: "เร็วๆ นี้",
      priceNote: undefined,
      icon: <Sparkles className="w-5 h-5" />,
      accentColor: "bg-violet-600",
      bgColor: "bg-violet-50/30",
      borderColor: "border-violet-600",
      features: [
        { label: "ส่งออกเป็น PDF + DOCX", included: true },
        { label: "เทมเพลตทั้งหมด", included: true },
        { label: "สร้างเอกสารไม่จำกัด", included: true },
        { label: "ไม่มีลายน้ำ", included: true },
        { label: "ตัวแก้ไข PDF", included: true },
        { label: "สิทธิ์สูงสุดทุกฟีเจอร์", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1080px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            เลือกแผนที่เหมาะกับคุณ
          </h1>
          <p className="text-neutral-500 text-base">
            เลือกแผนการใช้งานที่ตอบโจทย์ความต้องการของคุณ
          </p>
        </div>

        {/* Usage info for Pro users */}
        {tierName === "pro" && monthlyUsage && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                การใช้งานรายเดือน
              </span>
              <span className="text-sm font-semibold text-blue-900">
                {monthlyUsage.used}/{monthlyUsage.limit}
              </span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (monthlyUsage.used / monthlyUsage.limit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <TierCard
              key={tier.tierKey}
              {...tier}
              isCurrent={tierName === tier.tierKey}
              currentTier={tierName}
              isLoading={changingTo === tier.tierKey}
              onSelect={handleSelectTier}
            />
          ))}
        </div>

        {/* FAQ / Notes */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-xs text-neutral-400">
            แผน Pro และ Max จะเปิดให้ใช้งานเร็วๆ นี้
            ขณะนี้ผู้ใช้ทุกคนสามารถใช้งานแผน Free ได้ฟรี
          </p>
        </div>
      </div>

      {/* Downgrade Confirmation Dialog */}
      {showConfirmDialog && pendingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              ยืนยันการดาวน์เกรด
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              คุณต้องการดาวน์เกรดจาก{" "}
              <span className="font-semibold">
                {tierName === "max" ? "Max" : "Pro"}
              </span>{" "}
              เป็น{" "}
              <span className="font-semibold">
                {pendingTier === "free" ? "Free" : "Pro"}
              </span>{" "}
              หรือไม่? คุณอาจสูญเสียสิทธิ์การใช้งานบางฟีเจอร์
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingTier(null);
                }}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => performTierChange(pendingTier)}
                disabled={changingTo !== null}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {changingTo ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "ยืนยันดาวน์เกรด"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
