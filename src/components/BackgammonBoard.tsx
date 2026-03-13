'use client'

import { useState } from 'react'
import { Dices } from 'lucide-react'

// Basic piece structure
interface Piece {
    id: string
    color: 'white' | 'black'
    position: number // 0-23 for points, -1 for bar, 24 for off-board
}

export default function BackgammonBoard() {
    const [dice, setDice] = useState<[number, number]>([6, 6])
    const [isRolling, setIsRolling] = useState(false)

    // Initial board setup (standard backgammon)
    const [pieces, setPieces] = useState<Piece[]>(() => {
        const initial: Piece[] = []
        let idCounter = 1

        const addPieces = (color: 'white' | 'black', count: number, pos: number) => {
            for (let i = 0; i < count; i++) {
                initial.push({ id: `p${idCounter++}`, color, position: pos })
            }
        }

        // White pieces
        addPieces('white', 2, 0)
        addPieces('white', 5, 11)
        addPieces('white', 3, 16)
        addPieces('white', 5, 18)

        // Black pieces
        addPieces('black', 2, 23)
        addPieces('black', 5, 12)
        addPieces('black', 3, 7)
        addPieces('black', 5, 5)

        return initial
    })

    const rollDice = () => {
        if (isRolling) return
        setIsRolling(true)

        let rolls = 0
        const interval = setInterval(() => {
            setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])
            rolls++
            if (rolls > 10) {
                clearInterval(interval)
                setIsRolling(false)
            }
        }, 50)
    }

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, pieceId: string) => {
        e.dataTransfer.setData('pieceId', pieceId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetPosition: number) => {
        e.preventDefault()
        const pieceId = e.dataTransfer.getData('pieceId')

        setPieces(prev => prev.map(p =>
            p.id === pieceId ? { ...p, position: targetPosition } : p
        ))
    }

    const renderPoint = (index: number, isTop: boolean) => {
        const pointPieces = pieces.filter(p => p.position === index)
        const isDark = (index % 2 === 0) !== isTop

        return (
            <div
                key={index}
                className="relative flex-1 flex flex-col items-center group cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
            >
                {/* SVG Triangle */}
                <div className={`absolute left-0 right-0 ${isTop ? 'top-0' : 'bottom-0'} h-[45%] w-full flex justify-center overflow-hidden pointer-events-none`}>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[90%] h-full">
                        <polygon
                            points={isTop ? "0,0 100,0 50,100" : "0,100 100,100 50,0"}
                            fill={isDark ? '#8B4513' : '#FDF5E6'} // Wood vs Cream
                            opacity="0.9"
                        />
                    </svg>
                </div>

                {/* Pieces Container */}
                <div className={`z-10 w-full h-[45%] flex flex-col ${isTop ? 'justify-start pt-1' : 'justify-end pb-1'} items-center gap-0.5`}>
                    {pointPieces.map((piece, i) => (
                        <div
                            key={piece.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, piece.id)}
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md border-2 border-white/20 cursor-grab active:cursor-grabbing flex-shrink-0 transition-transform hover:scale-105 z-20 ${piece.color === 'white' ? 'bg-stone-100 shadow-stone-800/40' : 'bg-stone-900 shadow-black'
                                }`}
                            style={{
                                marginTop: isTop && i > 0 ? '-12px' : 0,
                                marginBottom: !isTop && i > 0 ? '-12px' : 0,
                                zIndex: 10 + i
                            }}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
            {/* Dice Controls */}
            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg">
                <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                    Roll Dice
                </button>
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner border-2 border-stone-200 flex items-center justify-center text-2xl font-bold text-stone-800">
                        {dice[0]}
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner border-2 border-stone-200 flex items-center justify-center text-2xl font-bold text-stone-800">
                        {dice[1]}
                    </div>
                </div>
            </div>

            {/* The Board */}
            <div className="w-full aspect-[4/3] bg-[#A0522D] border-8 sm:border-[16px] border-[#5C3A21] rounded-sm shadow-2xl flex relative overflow-hidden">
                {/* Left Quadrant (Top and Bottom 6) */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex h-[45%]">
                        {[11, 10, 9, 8, 7, 6].map(i => renderPoint(i, true))}
                    </div>
                    <div className="flex h-[45%]">
                        {[12, 13, 14, 15, 16, 17].map(i => renderPoint(i, false))}
                    </div>
                </div>

                {/* The Bar */}
                <div className="w-8 sm:w-16 bg-[#5C3A21] h-full shadow-inner flex flex-col justify-center items-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, -1)}>
                    {/* Pieces on the bar */}
                    <div className="w-full flex flex-col items-center gap-1">
                        {pieces.filter(p => p.position === -1).map(piece => (
                            <div key={piece.id} draggable onDragStart={(e) => handleDragStart(e, piece.id)} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/20 cursor-grab z-20 ${piece.color === 'white' ? 'bg-stone-100' : 'bg-stone-900'}`} />
                        ))}
                    </div>
                </div>

                {/* Right Quadrant (Top and Bottom 6) */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex h-[45%]">
                        {[5, 4, 3, 2, 1, 0].map(i => renderPoint(i, true))}
                    </div>
                    <div className="flex h-[45%]">
                        {[18, 19, 20, 21, 22, 23].map(i => renderPoint(i, false))}
                    </div>
                </div>
            </div>

            <p className="text-gray-400 text-sm text-center px-4">
                Drag and drop pieces freely to play a hot-seat game with family!
            </p>
        </div>
    )
}
