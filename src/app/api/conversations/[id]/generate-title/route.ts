import { updateConversationTitle } from "@/lib/chat-service";
import { NextRequest, NextResponse } from "next/server";

// 대화 첫 질문을 기반으로 제목 생성 API (백그라운드에서도 동작)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  try {
    const { firstMessage } = await request.json();

    if (!firstMessage || typeof firstMessage !== "string") {
      return NextResponse.json(
        { error: "첫 번째 메시지가 필요합니다." },
        { status: 400 }
      );
    }

    // LLM 엔드포인트 가져오기
    const LLM_ENDPOINT =
      process.env.LLM_ENDPOINT || process.env.NEXT_PUBLIC_LLM_ENDPOINT;

    if (!LLM_ENDPOINT) {
      // LLM 없으면 첫 메시지에서 제목 추출
      const fallbackTitle =
        firstMessage.length > 30
          ? firstMessage.substring(0, 30) + "..."
          : firstMessage;

      await updateConversationTitle(conversationId, fallbackTitle);

      return NextResponse.json({ title: fallbackTitle, streaming: false });
    }

    // LLM API 호출로 제목 생성
    const llmResponse = await fetch(`${LLM_ENDPOINT}/stock/generate-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: firstMessage,
      }),
    });

    // LLM 응답 확인
    if (!llmResponse.ok) {
      console.warn(`LLM 제목 생성 실패: ${llmResponse.status}, fallback 사용`);
      const fallbackTitle =
        firstMessage.length > 30
          ? firstMessage.substring(0, 30) + "..."
          : firstMessage;

      await updateConversationTitle(conversationId, fallbackTitle);
      return NextResponse.json({ title: fallbackTitle, streaming: false });
    }

    // 스트리밍 응답 처리
    if (llmResponse.body) {
      const reader = llmResponse.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      // ReadableStream으로 스트림 생성
      const stream = new ReadableStream({
        async start(controller) {
          let fullTitle = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (!line.trim() || line.trim() === "[DONE]") continue;

                let jsonStr = line.trim();
                if (jsonStr.startsWith("data: ")) {
                  jsonStr = jsonStr.substring(6);
                }

                if (jsonStr === "[DONE]") continue;

                try {
                  const event = JSON.parse(jsonStr);

                  if (event.type === "delta" && event.token) {
                    fullTitle += event.token;
                    // 각 토큰을 클라이언트로 전달
                    const sseData = `data: ${JSON.stringify({ type: "delta", token: event.token })}\n\n`;
                    controller.enqueue(encoder.encode(sseData));
                  }

                  if (event.type === "final" && event.title) {
                    fullTitle = event.title;
                    const sseData = `data: ${JSON.stringify({ type: "final", title: event.title })}\n\n`;
                    controller.enqueue(encoder.encode(sseData));
                  }
                } catch {
                  // JSON 파싱 실패 시 무시
                }
              }
            }

            // 최종 제목을 DB에 저장
            if (fullTitle.trim()) {
              await updateConversationTitle(conversationId, fullTitle.trim());
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            console.error("스트림 처리 오류:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 스트리밍이 아닌 일반 응답 처리
    const result = await llmResponse.json();
    const title = result.title || firstMessage.substring(0, 30);
    await updateConversationTitle(conversationId, title);

    return NextResponse.json({ title, streaming: false });
  } catch (error) {
    console.error("제목 생성 중 오류:", error);

    // 오류 시 fallback - 메시지를 기반으로 제목 생성
    const fallbackTitle = "새 대화";
    try {
      await updateConversationTitle(conversationId, fallbackTitle);
    } catch {
      // 업데이트 실패해도 응답은 반환
    }
    return NextResponse.json({ title: fallbackTitle, streaming: false });
  }
}
