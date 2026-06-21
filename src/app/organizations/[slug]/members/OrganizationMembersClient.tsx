"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  inviteOrganizationMemberAction,
  updateOrganizationMemberRoleAction,
  removeOrganizationMemberAction,
} from "@/app/actions/organizations";
import {
  getOrganizationRoleLabel,
  getRoleBadgeColor,
  getMemberStatusLabel,
  ORGANIZATION_ROLES,
} from "@/lib/organization-labels";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Loader2,
  X,
  ChevronDown,
  Shield,
  Star,
} from "lucide-react";

type MemberData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  reputation: number;
  role: string;
  status: string;
  joinedAt: string;
};

type Props = {
  organization: { id: string; name: string; slug: string };
  members: MemberData[];
};

export default function OrganizationMembersClient({
  organization: org,
  members,
}: Props) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [invitePending, setInvitePending] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const handleInvite = useCallback(async () => {
    setInvitePending(true);
    setInviteError("");
    setInviteSuccess("");

    const form = new FormData();
    form.set("email", inviteEmail);
    form.set("role", inviteRole);
    const result = await inviteOrganizationMemberAction(org.id, form);

    setInvitePending(false);
    if (result.error) {
      setInviteError(result.error);
    } else {
      setInviteSuccess(result.message || "Membre ajouté !");
      setInviteEmail("");
      setShowInvite(false);
      router.refresh();
    }
  }, [org.id, inviteEmail, inviteRole, router]);

  const handleRoleChange = useCallback(
    async (memberId: string, newRole: string) => {
      const result = await updateOrganizationMemberRoleAction(
        org.id,
        memberId,
        newRole
      );
      if (result.error) alert(result.error);
      else router.refresh();
    },
    [org.id, router]
  );

  const handleRemove = useCallback(
    async (memberId: string, name: string) => {
      if (!confirm(`Retirer ${name} de l'organisation ?`)) return;
      const result = await removeOrganizationMemberAction(org.id, memberId);
      if (result.error) alert(result.error);
      else router.refresh();
    },
    [org.id, router]
  );

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link
              href={`/organizations/${org.slug}/dashboard`}
              className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tableau de bord
            </Link>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <Users className="w-6 h-6 text-tb-accent" />
              Membres — {org.name}
            </h1>
            <p className="text-tb-text-muted text-sm mt-1">
              {members.filter((m) => m.status === "ACTIVE").length} membre
              {members.filter((m) => m.status === "ACTIVE").length > 1 ? "s" : ""} actif
              {members.filter((m) => m.status === "ACTIVE").length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un membre
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="bg-white border border-tb-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-tb-text-primary">Ajouter un membre</h3>
            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-600">
                {inviteSuccess}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <input
                type="email"
                placeholder="Email du membre"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 min-w-[200px] bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2.5 text-sm text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
              >
                {Object.entries(ORGANIZATION_ROLES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={handleInvite}
                disabled={invitePending || !inviteEmail}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors disabled:opacity-50"
              >
                {invitePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Ajouter
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div className="bg-white border border-tb-border rounded-2xl overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-8 h-8 text-tb-border mx-auto mb-2" />
              <p className="text-tb-text-muted text-sm">Aucun membre pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-tb-border">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 hover:bg-tb-surface-elevated/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-tb-accent/10 border border-tb-accent/20 flex items-center justify-center text-sm font-bold text-tb-accent shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-tb-text-primary truncate">
                          {m.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                            m.role
                          )}`}
                        >
                          {getOrganizationRoleLabel(m.role)}
                        </span>
                        {m.status !== "ACTIVE" && (
                          <span className="text-xs text-tb-text-muted">
                            ({getMemberStatusLabel(m.status)})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-tb-text-muted mt-0.5">
                        {m.email} · depuis{" "}
                        {new Date(m.joinedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.role !== "OWNER" && m.status === "ACTIVE" && (
                      <>
                        <select
                          defaultValue={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="text-xs bg-tb-surface-elevated border border-tb-border rounded-lg px-2 py-1 text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
                        >
                          {Object.entries(ORGANIZATION_ROLES).map(([key, label]) => (
                            <option key={key} value={key} disabled={key === "OWNER"}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemove(m.id, m.name)}
                          className="p-1.5 rounded-lg text-tb-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Retirer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {m.role === "OWNER" && (
                      <Shield className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
