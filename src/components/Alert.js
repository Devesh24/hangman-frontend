import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { useAuth } from "../Hooks/auth";
import Confetti from "react-confetti";

export default function Alert({ gameOver, won, wordSet, score, word, userId, pastScores, highestScore }) {
  
  const { cookies } = useAuth();
  useEffect(() => {
    // to update the pastScores and highestScore of the user
    const updateData = async () => {
      try {
        const accessToken = cookies.token;
        
        //push the current score in pastScores
        pastScores.push({ 
            score: score, 
            date: Date.now()
        })
        const newPastScores = pastScores.slice(-10) // keeping only the last 10 scores
        let toUpdate

        if(score >= highestScore) //if current score is greater then prev highest score
        {
            toUpdate = {
                pastScores: newPastScores,
                highestScore: {
                    score: score, date: Date.now()
                }
            }
        }
        else
        {
          toUpdate = {
              pastScores: newPastScores
          }
        }

        // update in the db
        await axios.put(`${BASE_URL}/user/${userId}`, toUpdate, 
        {
            headers: {
                token: `Bearer ${accessToken}`,
            },
        })

      } catch (error) {
        console.log(error);
      }
    }
    if(gameOver) updateData()
  },[gameOver])

  // the action which button will perform in different caes
  const btnClick = async () => {
    if (gameOver) {
      window.location.reload();
    }
    if (won) {
      wordSet();
    }
  };

  let title = "";
  let btnTitle = "";
  if (gameOver) {
    title = "Game Over🤌";
    btnTitle = "Play Again";
  }
  if (won) {
    title = "Nice Guess👍";
    btnTitle = "Next";
  }

  // to set the width and height property for the confetti
  const [screenWidth, setScreenWidth] = useState(window.screen.width)
  const [screenHeight, setScreenHeight] = useState(window.screen.height)
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },[])
  
  return (
    <>
      {score+1 > highestScore && <Confetti width={screenWidth} height={screenHeight} />}
      <div className="gameOver">
      {score+1 > highestScore && <div style={{color: "greenyellow"}}>Congratulations!!! New Highscore Reached</div>}
        <div>{title}</div>
        <div className={`${gameOver ? 'd-flex' : 'd-none'} gap-2`}>
          <p>Correct Word : </p>
          <p>{word}</p>
        </div>
        <div className="d-flex gap-2">
          <p>Total Score :</p>
          <p>{won ? score + 1 : score}</p>
        </div>
        <div>
          <button className="btn" onClick={btnClick}>
            {btnTitle}
          </button>
        </div>
      </div>
    </>
  );
}
