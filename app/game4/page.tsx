'use client'

import React from 'react';

const Game4Page = () => {
  return (
    // 外層容器填滿整個螢幕並使用 flexbox
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 mt-12">嵌入的 HTML 遊戲(0924_1124)</h1>
      
      {/* 這個 div 是 iframe 的容器，給予它 flex-grow 讓它佔據所有剩餘空間
        並使用 flexbox 讓 iframe 居中
      */}
      <div className="flex-grow flex justify-center w-full">
        {/*
          iframe 本身，我們將其寬高設定為 100vh 和 100% 的寬度，
          並使用一個 max-width 來限制其最大尺寸以確保不會過大
        */}
        <iframe
          src="/pub_game/enhanced_snake_game.html"
          title="Game 4"
          className="w-full h-[80vh] max-w-4xl border-4 border-gray-700 rounded-lg shadow-xl"
        ></iframe>
      </div>
      
      <p className="mt-4 mb-4 text-sm text-gray-400">
        這個遊戲是透過 iframe 嵌入的。
      </p>
    </div>
  );
};

export default Game4Page;