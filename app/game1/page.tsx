'use client'

import React, { useState, useEffect, useCallback } from 'react'

// 定義蛇節點的型別
interface SnakeSegment {
  x: number;
  y: number;
}
interface Direction {
  x: number;
  y: number;
}

const BOARD_SIZE = 20
const INITIAL_SNAKE: SnakeSegment[] = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = { x: 0, y: -1 }
const GAME_SPEED = 150

export default function SnakeGame() {
  const [snake, setSnake] = useState<SnakeSegment[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<SnakeSegment>({ x: 5, y: 5 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // 生成隨機食物位置
  const generateFood = useCallback((currentSnake: SnakeSegment[]): SnakeSegment => {
    let newFood: SnakeSegment
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // 重置遊戲
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(generateFood(INITIAL_SNAKE)) // 修正：重置時重新生成食物
    setGameOver(false)
    setScore(0)
    setIsPlaying(false)
    setIsPaused(false)
  }, [generateFood])

  // 開始/暫停遊戲
  const startGame = () => {
    if (gameOver) {
      resetGame()
      setIsPlaying(true)
    } else {
      setIsPlaying(true)
      setIsPaused(prev => !prev)
    }
  }

  // 鍵盤控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) {
        if (e.key === ' ' && isPlaying) {
          setIsPaused(prev => !prev)
        }
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setDirection(prev => (prev.y !== 1 ? { x: 0, y: -1 } : prev))
          break
        case 'ArrowDown':
          e.preventDefault()
          setDirection(prev => (prev.y !== -1 ? { x: 0, y: 1 } : prev))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setDirection(prev => (prev.x !== 1 ? { x: -1, y: 0 } : prev))
          break
        case 'ArrowRight':
          e.preventDefault()
          setDirection(prev => (prev.x !== -1 ? { x: 1, y: 0 } : prev))
          break
        case ' ':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, isPaused])

  // 遊戲循環
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return

    const gameLoop = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake]
        const head = { ...newSnake[0] }
        head.x += direction.x
        head.y += direction.y

        // 檢查邊界碰撞
        if (
          head.x < 0 || head.x >= BOARD_SIZE ||
          head.y < 0 || head.y >= BOARD_SIZE ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true)
          setIsPlaying(false)
          return currentSnake
        }
        
        newSnake.unshift(head)

        // 檢查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10)
          setFood(generateFood(newSnake))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, GAME_SPEED)

    return () => clearInterval(gameLoop)
  }, [direction, food, isPlaying, isPaused, gameOver, generateFood])
  
  // 移動端控制按鈕的觸控處理
  const handleTouch = useCallback((newDirection: Direction) => {
    if (isPlaying && !isPaused) {
      setDirection(newDirection);
    }
  }, [isPlaying, isPaused]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-green-400">貪吃蛇遊戲</h1>
      
      <div className="mb-4 text-xl">
        分數: <span className="text-yellow-400 font-bold">{score}</span>
      </div>

      {gameOver && (
        <div className="mb-4 text-red-400 text-xl font-bold">
          遊戲結束！
        </div>
      )}

      {isPaused && isPlaying && (
        <div className="mb-4 text-yellow-400 text-xl font-bold">
          遊戲暫停
        </div>
      )}

      <div
        className="grid bg-gray-800 border-2 border-green-400 p-2 mb-6"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
          gap: '1px'
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const x = index % BOARD_SIZE
          const y = Math.floor(index / BOARD_SIZE)
          
          const isSnakeHead = snake.length > 0 && snake[0].x === x && snake[0].y === y
          const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y)
          const isFood = food.x === x && food.y === y

          let cellClass = 'w-5 h-5 '
          
          if (isSnakeHead) {
            cellClass += 'bg-green-300 rounded-sm'
          } else if (isSnakeBody) {
            cellClass += 'bg-green-500 rounded-sm'
          } else if (isFood) {
            cellClass += 'bg-red-500 rounded-full'
          } else {
            cellClass += 'bg-gray-700'
          }

          return (
            <div
              key={index}
              className={cellClass}
            />
          )
        })}
      </div>

      <div className="flex gap-4 mb-6">
        {!isPlaying ? (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition-colors"
          >
            {gameOver ? '重新開始' : '開始遊戲'}
          </button>
        ) : (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-lg transition-colors"
          >
            {isPaused ? '繼續' : '暫停'}
          </button>
        )}
      </div>

      <div className="text-center text-sm text-gray-400 max-w-md">
        <p className="mb-2">使用方向鍵控制蛇的移動</p>
        <p className="mb-2">按空格鍵暫停/繼續遊戲</p>
        <p>吃到紅色食物可以增長身體並獲得分數</p>
      </div>

      {/* 移動端控制按鈕 */}
      <div className="md:hidden mt-6">
        <div className="grid grid-cols-3 gap-2 w-48">
          <div></div>
          <button
            onTouchStart={() => handleTouch({ x: 0, y: -1 })}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded text-2xl"
          >
            ↑
          </button>
          <div></div>
          <button
            onTouchStart={() => handleTouch({ x: -1, y: 0 })}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded text-2xl"
          >
            ←
          </button>
          <button
            onTouchStart={() => setIsPaused(prev => !prev)}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded text-xs"
          >
            暫停
          </button>
          <button
            onTouchStart={() => handleTouch({ x: 1, y: 0 })}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded text-2xl"
          >
            →
          </button>
          <div></div>
          <button
            onTouchStart={() => handleTouch({ x: 0, y: 1 })}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded text-2xl"
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>
    </div>
  )
}