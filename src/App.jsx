import { useState } from "react"
import { clsx } from "clsx"
import { languages } from "./languages"
import { getFarewellText, getRandomWord } from "./utils"
import Confetti from "react-confetti"
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";



export default function AssemblyEndgame() {
    // State values
    const [currentWord, setCurrentWord] = useState(() => getRandomWord())
    const [guessedLetters, setGuessedLetters] = useState([])

    // Derived values
    const wrongGuessCount =
    guessedLetters.filter(letter => !currentWord.includes(letter)).length
    const numGuessesLeft = languages.length -  1
    const currentNumGuessesLeft = numGuessesLeft - wrongGuessCount 
    const isGameWon =
        currentWord.split("").every(letter => guessedLetters.includes(letter))
    const isGameLost = wrongGuessCount >= numGuessesLeft
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    const handleKeyDown = (event, letter) => {
        if (event.key.toLowerCase() === letter.toLowerCase() || event.key === "Enter" || event.key === " ") {
            addGuessedLetter(letter);
        }
    };
    

    function startNewGame() {
        setCurrentWord(getRandomWord())
        setGuessedLetters([])
    }

    const languageElements = languages.map((lang, index) => {
        const isLanguageLost = index < wrongGuessCount
        const styles = {
            backgroundColor: lang.backgroundColor,
            color: lang.color
        }
        const className = clsx("chip", isLanguageLost && "lost")
        return (
            
            <span
                className={className}
                style={styles}
                key={lang.name}
            >
                {lang.name}
            </span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return (
            <span key={index} className={letterClassName}>
                {shouldRevealLetter ? letter.toUpperCase() : ""}
            </span>
        )
    })

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
            <button
                className={className}
                key={letter}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
                onKeyDown={(event) => handleKeyDown(event, letter)}
                tabIndex={0}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        }
        if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            )
        }

        return null
    }

    return (
        <main>
            {isLastGuessIncorrect && <div key={wrongGuessCount} className={`red-flash-overlay active`}></div>}
            {
                isGameWon && 
                    <Confetti
                        recycle={false}
                        numberOfPieces={1000}
                    />
            }
 {isGameLost && (
    <Particles
        id="tsparticles"
        options={{
            particles: {
                number: { value: 150 },
                color: { value: ["#800", "#600", "#333"] }, // Dark red & gray
                opacity: { value: 0.8, anim: { enable: true, speed: 0.5 } },
                move: { enable: true, speed: 3, direction: "bottom" },
                size: { value: 5, random: true },
                life: { duration: 10, count: 5 }, // Disappear after 2 seconds
            },
            detectRetina: true,
        }}
    />
)}



            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within {numGuessesLeft} attempts to keep the
                programming world safe from Assembly!</p>
            </header>

            <section
                aria-live="polite"
                role="status"
                className="attemptsLeft"
            >
                <h2>{currentNumGuessesLeft} attempts left</h2>
            </section>
            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section className="language-chips">
                {languageElements}
            </section>

            <section className="word">
                {letterElements}
            </section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <section
                className="sr-only"
                aria-live="polite"
                role="status"
            >
                <p>
                    {currentWord.includes(lastGuessedLetter) ?
                        `Correct! The letter ${lastGuessedLetter} is in the word.` :
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`
                    }
                    You have {currentNumGuessesLeft} attempts left.
                </p>
                <p>Current word: {currentWord.split("").map(letter =>
                    guessedLetters.includes(letter) ? letter + "." : "blank.")
                    .join(" ")}</p>

            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>

            {isGameOver &&
                <button
                    className="new-game"
                    onClick={startNewGame}
                >New Game</button>}
        </main>
    )
}
