import { ComputerIcon, InfoIcon } from "lucide-react";

const BacktestingPage = () => {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center shadow-lg shadow-zinc-500/20">
          <ComputerIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            백테스팅
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            백테스팅 결과를 확인합니다
          </p>
        </div>
      </div>

      {/* 설정 목록 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        <div className="flex items-center gap-2 justify-center h-full py-16">
          <InfoIcon className="size-4 text-zinc-700 dark:text-zinc-300" />
          <p className="text-base text-zinc-600 dark:text-zinc-300 font-semibold">
            백테스팅 기능은 현재 준비 중 입니다.
          </p>
        </div>
      </div>
    </div>
  )
};

export default BacktestingPage;