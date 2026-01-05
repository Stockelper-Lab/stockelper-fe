import { v4 as uuidv4 } from "uuid";

// 임시 대화 ID 관리
// 새 대화 클릭 시 DB에 저장하지 않고 임시 ID만 발급
// 첫 메시지 전송 시에만 실제 DB에 저장

const TEMP_CONVERSATION_PREFIX = "temp_";

// 임시 대화 ID 생성
export function generateTempConversationId(): string {
  return `${TEMP_CONVERSATION_PREFIX}${uuidv4()}`;
}

// 임시 대화 ID인지 확인
export function isTempConversation(conversationId: string): boolean {
  return conversationId.startsWith(TEMP_CONVERSATION_PREFIX);
}

// 실제 대화 ID 추출 (temp_ 제거)
export function extractRealConversationId(conversationId: string): string {
  if (isTempConversation(conversationId)) {
    return conversationId.substring(TEMP_CONVERSATION_PREFIX.length);
  }
  return conversationId;
}

