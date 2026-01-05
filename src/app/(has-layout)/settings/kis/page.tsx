"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { updateKisSettings } from "@/lib/api/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../components/page-header";

export default function KisSettingsPage() {
  const { user, loading, error, refetch } = useUser();
  const queryClient = useQueryClient();
  const [showAppSecret, setShowAppSecret] = useState(false);

  const [kisAppKey, setKisAppKey] = useState("");
  const [kisAppSecret, setKisAppSecret] = useState("");
  const [accountNo, setAccountNo] = useState("");

  useEffect(() => {
    if (user) {
      setKisAppKey(user.kis_app_key || "");
      setKisAppSecret(user.kis_app_secret || "");
      setAccountNo(user.account_no || "");
    }
  }, [user]);

  // KIS 설정 업데이트 mutation
  const updateKisMutation = useMutation({
    mutationFn: updateKisSettings,
    onSuccess: () => {
      toast.success("KIS 정보가 성공적으로 업데이트되었습니다.");
      // 사용자 정보 캐시 무효화 및 리프레시
      queryClient.invalidateQueries({ queryKey: ["user"] });
      refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message || "알 수 없는 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateKisMutation.mutate({
      kis_app_key: kisAppKey,
      kis_app_secret: kisAppSecret,
      account_no: accountNo,
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-8" />

          <div className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading user data.</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="KIS 설정"
          description="한국투자증권 API 연동에 필요한 정보를 관리합니다."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kis-app-key">KIS APP Key</Label>
            <Input
              id="kis-app-key"
              value={kisAppKey}
              onChange={(e) => setKisAppKey(e.target.value)}
              placeholder="KIS APP Key를 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kis-app-secret">KIS APP Secret</Label>
            <div className="relative">
              <Input
                id="kis-app-secret"
                type={showAppSecret ? "text" : "password"}
                value={kisAppSecret}
                onChange={(e) => setKisAppSecret(e.target.value)}
                placeholder="KIS APP Secret을 입력하세요"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowAppSecret(!showAppSecret)}
              >
                {showAppSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-no">계좌번호</Label>
            <Input
              id="account-no"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder="계좌번호를 입력하세요 (예: 12345678-01)"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateKisMutation.isPending}>
              {updateKisMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
