import { NextRequest } from "next/server";

// Next 서버를 통한 LLM API 호출 (스트리밍)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thread_id, message, human_feedback, user_id } = body;

    // 필수 파라미터 검증
    if (!thread_id || !message || user_id === undefined) {
      return new Response(
        JSON.stringify({ error: "필수 파라미터가 누락되었습니다." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 서버 사이드 환경 변수에서 LLM 엔드포인트 가져오기
    const LLM_ENDPOINT = process.env.LLM_ENDPOINT || process.env.NEXT_PUBLIC_LLM_ENDPOINT;
    
    if (!LLM_ENDPOINT) {
      return new Response(
        JSON.stringify({ error: "LLM 엔드포인트가 설정되지 않았습니다." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // LLM API 호출
    const llmResponse = await fetch(`${LLM_ENDPOINT}/stock/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thread_id,
        message,
        human_feedback: human_feedback ?? null,
        user_id,
      }),
    });

    if (!llmResponse.ok) {
      return new Response(
        JSON.stringify({ error: `LLM API 호출 실패: ${llmResponse.status}` }),
        {
          status: llmResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 스트리밍 응답을 클라이언트로 전달
    if (!llmResponse.body) {
      return new Response(
        JSON.stringify({ error: "응답 본문이 없습니다." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 스트리밍 응답을 그대로 전달
    return new Response(llmResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("채팅 API 라우트 오류:", error);
    return new Response(
      JSON.stringify({
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

