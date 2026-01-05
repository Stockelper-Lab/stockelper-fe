"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import {
  updateAccountNickname,
  updateAccountPassword,
} from "@/lib/api/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../components/page-header";

export default function AccountSettingsPage() {
  const { user, loading, refetch } = useUser();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
    }
  }, [user]);

  // 닉네임 변경 mutation
  const updateNicknameMutation = useMutation({
    mutationFn: updateAccountNickname,
    onSuccess: () => {
      toast.success("닉네임이 성공적으로 변경되었습니다.");
      // 사용자 정보 캐시 무효화 및 리프레시
      queryClient.invalidateQueries({ queryKey: ["user"] });
      refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message || "알 수 없는 오류가 발생했습니다.");
    },
  });

  // 비밀번호 변경 mutation
  const updatePasswordMutation = useMutation({
    mutationFn: updateAccountPassword,
    onSuccess: (data) => {
      toast.success(data.message);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "알 수 없는 오류가 발생했습니다.");
    },
  });

  const handleNicknameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname === user?.nickname) {
      toast.error("새 닉네임을 입력하거나 기존과 다른 닉네임을 사용해주세요.");
      return;
    }
    updateNicknameMutation.mutate(nickname);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    updatePasswordMutation.mutate(passwordData);
  };

  if (loading) {
    return (
      <div className="p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            title="계정 설정"
            description="개인 정보를 수정하고, 계정을 관리합니다."
          />
          <div className="mt-8 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="계정 설정"
          description="개인 정보를 수정하고, 계정을 관리합니다."
        />

        <div className="mt-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>닉네임 변경</CardTitle>
              <CardDescription>
                서비스에서 사용할 닉네임을 변경할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleNicknameChange}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="nickname">새 닉네임</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="새 닉네임을 입력하세요"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  type="submit"
                  disabled={updateNicknameMutation.isPending}
                >
                  {updateNicknameMutation.isPending
                    ? "저장 중..."
                    : "닉네임 저장"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                보안을 위해 주기적으로 비밀번호를 변경하는 것을 권장합니다.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">현재 비밀번호</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="현재 비밀번호"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">새 비밀번호</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="새 비밀번호"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending
                    ? "변경 중..."
                    : "비밀번호 변경"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>투자 성향 설문</CardTitle>
              <CardDescription>
                투자 성향 설문을 다시 진행하여 프로필을 업데이트할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t px-6 py-4">
              <Link href="/settings/survey">
                <Button variant="outline">설문 다시하기</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
