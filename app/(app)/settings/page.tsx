"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/app/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/settings");
    }
  }, [authLoading, isAuthenticated, router]);

  // Loading state
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">ตั้งค่าระบบ</h1>
            <p className="text-sm text-gray-500">จัดการการตั้งค่าทั่วไปของระบบ</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* General Settings Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">การตั้งค่าทั่วไป</h2>
              <p className="text-sm text-gray-500 mt-1">ปรับแต่งการใช้งานระบบของคุณ</p>
            </div>
            <div className="px-6 py-8">
              <p className="text-sm text-gray-400 text-center">ยังไม่มีการตั้งค่าทั่วไป</p>
            </div>
          </div>

          {/* Admin Settings Section - Only visible to admins */}
          {(isAdmin || true)&& (
            <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">การตั้งค่าผู้ดูแลระบบ</h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">ฟังก์ชันพิเศษสำหรับผู้ดูแลระบบเท่านั้น</p>
              </div>
              <div className="divide-y divide-gray-200">
                {/* Console Link */}
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Console</h3>
                        <p className="text-sm text-gray-500">จัดการ Data Types, Filters และ Document Types</p>
                      </div>
                    </div>
                    <Link href="/console">
                      <Button variant="primary" size="sm">
                        เปิด Console
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* User Management */}
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-500">จัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
                      </div>
                    </div>
                    <Link href="/admin/users">
                      <Button variant="primary" size="sm">
                        จัดการผู้ใช้
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
