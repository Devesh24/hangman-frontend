import React, { useState, useEffect, useCallback } from "react";
import Hangman from "./Hangman";
import Keyboard from "./Keyboard";
import Word from "./Word";
import Alert from "./Alert";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { BASE_URL } from "../config";
import Navbar from "./Navbar";
import { useAuth } from "../Hooks/auth";
import Loader from "./Loader";

function Game() {
  const [loading, setLoading] = useState(false);
  const { cookies } = useAuth();
  const [userData, setUserData] = useState({}); // to store the data of user that is logged in

  useEffect(() => {
    //fetch the data of the logged in user using token stored in cookies
    //for authorization purposes, token is passed in header
    const fetchData = async () => {
      setLoading(true);
      try {
        const accessToken = cookies.token;
        const data = await axios.post(
          `${BASE_URL}/user`,
          {
            token: accessToken,
          },
          {
            headers: {
              token: `Bearer ${accessToken}`,
            },
          }
        );
        setLoading(false);
        setUserData(data.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const [Words, setWords] = useState([]); // array of all possible words
  const [word, setWord] = useState(""); // current word to guess
  const [wordObj, setWordObj] = useState({}); // object of the word to be guessed (word and hint)
  const [uniqueLetters, setUniqueLetters] = useState([]); // array of unique letters in the word to guess

  useEffect(() => {
    //fetch all the possible words from the database
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await axios.get(`${BASE_URL}/famousPerson`);
        setWords(data.data);
        setLoading(false);

        const temp = data.data[Math.floor(Math.random() * data.data.length)]; //choosing a random word from the array
        const tempWord = temp.name.toUpperCase();
        setWordObj(temp);
        setWord(tempWord);
        setUniqueLetters(
          tempWord
            .split("")
            .filter(
              (item, index) =>
                item !== " " && tempWord.split("").indexOf(item) === index
            )
        );
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  //code snippet for bootstrap popover - used in hint
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [score, setScore] = useState(0); // current score
  const [guessedLetters, setGuessedLetters] = useState([]); // array of the letters guessed by the user
  const [wrongGuess, setWrongGuess] = useState([]); // array of wrong guessed letters
  const [rightGuess, setRightGuess] = useState([]); // array of right guessed letters

  // function to reset all the values after each round
  const wordSet = () => {
    setLoading(true);
    setGuessedLetters([]);
    setWrongGuess([]);
    setRightGuess([]);

    const temp = Words[Math.floor(Math.random() * Words.length)];
    const tempWord = temp.name.toUpperCase();
    setWordObj(temp);
    setWord(tempWord);
    setUniqueLetters(
      tempWord
        .split("")
        .filter(
          (item, index) =>
            item !== " " && tempWord.split("").indexOf(item) === index
        )
    );
    setWon(false);

    setScore((prev) => prev + 1);
    setLoading(false);
  };

  // function to add a letter in suitable arrays(as defined above), when user make a guess
  const addLetter = (letter) => {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters((curr) => [letter, ...curr]);

      //if guess made is a right guess
      if (uniqueLetters.includes(letter) || word.includes(letter)) {
        setRightGuess((curr) => [letter, ...curr]);
      } else {
        //if guess made is a wrong guess
        setWrongGuess((curr) => [letter, ...curr]);
      }
    }
  };

  const [gameOver, setGameOver] = useState(false); // game over or not
  const [won, setWon] = useState(false); // round won or not
  useEffect(() => {
    if (wrongGuess.length >= 6) {
      setGameOver(true);
    } else if (
      uniqueLetters.length > 0 &&
      rightGuess.length === uniqueLetters.length
    ) {
      setWon(true);
    }
  }, [wrongGuess, rightGuess]);

  // adding keypress events
  useEffect(() => {
    const handler = (elem) => {
      const key = elem.key;

      if (!key.match(/^[a-z]$/)) return;
      elem.preventDefault();
      addLetter(key.toUpperCase());
    };

    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, uniqueLetters, guessedLetters]);

  return (
    <>
      <Navbar username={userData.name} />
      {loading ? <Loader /> :
        <>
          <div
            className="homeContainer"
            style={{ display: gameOver | won ? "none" : "flex" }}
          >
            <div>
              <Hangman
                wrongGuess={wrongGuess}
                word={word}
                guessedLetters={guessedLetters}
                score={score}
                hint={wordObj.hint}
              />
              <div className="score">
                <p>Current Score:</p>
                <p className="scoredigit">{score}</p>
              </div>
            </div>
            <div className="homeRight">
              <div className="hintBox">
                <div className="highestBox">
                  <div>Highest Score: </div>
                  <div className="scoredigit">
                    {userData.highestScore ? userData.highestScore.score : 0}
                  </div>
                </div>
                <p
                  className="hintButton"
                  aria-describedby={id}
                  variant="contained"
                  onClick={handleClick}
                >
                  <i class="fa-solid fa-lightbulb"></i>
                </p>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <Typography sx={{ p: 2 }}>{wordObj.hint}</Typography>
                </Popover>
              </div>
              <div className="wordToGuess">
                <Word word={word} guessedLetters={guessedLetters} />
              </div>
              <Keyboard addLetter={addLetter} guessedLetters={guessedLetters} />
            </div>
          </div>
          <div
            className="game"
            style={{ display: gameOver | won ? "flex" : "none" }}
          >
            <Alert
              gameOver={gameOver}
              won={won}
              wordSet={wordSet}
              score={score}
              word={word}
              userId={userData._id}
              pastScores={userData.pastScores}
              highestScore={userData.highestScore?.score}
            />
          </div>
        </>
      }
    </>
  );
}

export default Game;
