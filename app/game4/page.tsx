'use client'

import React from 'react';

const Game4Page = () => {
  return (
    // 使用 Flexbox 讓內容垂直置中並填滿整個螢幕高度
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 mt-12">嵌入的 HTML 遊戲</h1>
      
      {/*
        這個 div 是 iframe 的容器，它將填滿所有剩餘空間
      */}
      <div className="flex-grow flex items-center justify-center w-full h-full">
        {/*
          iframe 本身，使用 Tailwind CSS class 讓它填滿父容器
          `w-full` 和 `h-full` 非常重要
        */}
        <iframe
          src="/games/index.html"
          title="Game 4"
          className="w-full h-full border-4 border-gray-700 rounded-lg shadow-xl"
        ></iframe>
      </div>
      
      <p className="mt-4 mb-4 text-sm text-gray-400">
        這個遊戲是透過 iframe 嵌入的。
      </p>
    </div>
  );
};

export default Game4Page;