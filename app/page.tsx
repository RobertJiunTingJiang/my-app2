'use client';

//rj

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">小小遊戲(game)選擇</h1>
      <div className="flex flex-col gap-4">
        <Link href="/game1">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            玩貪吃蛇
          </button>
        </Link>
        <Link href="/game2">
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            背英文單字
          </button>
        </Link>

// 在你的按鈕區塊中，新增以下程式碼：
<Link href="/game3">
  <button
    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
  >
    🕹️ 新遊戲模式
  </button>
</Link>


      </div>
      <footer className="mt-8 text-gray-600 text-sm">
        <p>作者：江俊廷</p>
        <p>日期：2025年9月24日</p>
      </footer>
    </div>
  );
}