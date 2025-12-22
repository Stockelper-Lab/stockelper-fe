// 계정 설정 API
export async function updateAccountNickname(nickname: string): Promise<void> {
  const response = await fetch("/api/settings/account", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "닉네임 변경에 실패했습니다.");
  }
}

export async function updateAccountPassword(passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  const response = await fetch("/api/settings/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "비밀번호 변경에 실패했습니다.");
  }

  return data;
}

// KIS 설정 API
export async function updateKisSettings(settings: {
  kis_app_key: string;
  kis_app_secret: string;
  account_no: string;
}): Promise<void> {
  const response = await fetch("/api/settings/kis", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  const errorData = await response.json();

  if (!response.ok) {
    throw new Error(
      errorData.error || "KIS 정보 업데이트에 실패했습니다."
    );
  }
}

// Survey API
export async function fetchSurvey(): Promise<{ answer: unknown } | null> {
  const response = await fetch("/api/survey");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("기존 설문 정보를 불러오는 데 실패했습니다.");
  }

  return await response.json();
}

export async function updateSurvey(answer: unknown): Promise<void> {
  const response = await fetch("/api/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "설문 업데이트에 실패했습니다.");
  }
}

