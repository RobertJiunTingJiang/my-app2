'use client'

import React from 'react';

const Game4Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">嵌入的 HTML 遊戲</h1>
      <div className="border-4 border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/*
          使用 <iframe> 嵌入位於 public/games/index.html 的遊戲。
          請確保 width 和 height 適合你的遊戲。
        */}
        <iframe
          src="/pub_game/enhanced_snake_game.html"
          title="Game 4"
          width="800"
          height="600"
          className="w-full h-full"
        ></iframe>
      </div>
      <p className="mt-4 text-sm text-gray-400">
        這個遊戲是透過 iframe 嵌入的。
      </p>
    </div>
  );
};

export default Game4Page;