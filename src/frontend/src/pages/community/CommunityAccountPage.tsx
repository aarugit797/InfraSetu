import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import { CalendarDays, LogOut, Mail, Phone, Shield, User } from "lucide-react";

export default function CommunityAccountPage() {
  const { currentUser, logout } = useAuth();

  const user = currentUser ?? {
    id: "u7",
    name: "Sunita Verma",
    email: "community@demo.com",
    role: "community" as const,
    phone: "+91-9810001007",
    joinedAt: Date.now() - 120 * 86400000,
  };

  const joinDate = new Date(user.joinedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="community-account.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Account</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Your community portal profile
        </p>
      </div>

      {/* Avatar + name card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center">
          <User className="w-10 h-10 text-amber-600" />
        </div>
        <div className="text-center">
          <p className="text-slate-800 text-lg font-bold">{user.name}</p>
          <Badge
            className={`text-xs px-2 py-0.5 border mt-1 ${getRoleBadgeColor(user.role)}`}
            data-ocid="community-account.role-badge"
          >
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>
      </div>

      {/* Profile details */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4"
        data-ocid="community-account.details"
      >
        <h2 className="font-semibold text-slate-800 text-sm">
          Profile Details
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                Email
              </p>
              <p className="text-slate-800 text-sm font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                Phone
              </p>
              <p className="text-slate-800 text-sm font-medium">
                {user.phone ?? "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                Role
              </p>
              <p className="text-slate-800 text-sm font-medium">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                Member Since
              </p>
              <p className="text-slate-800 text-sm font-medium">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl gap-2"
        onClick={logout}
        data-ocid="community-account.logout-button"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </Button>
    </div>
  );
}
