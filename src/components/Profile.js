import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAuth } from "../Hooks/auth";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const Profile = () => {
  const { cookies } = useAuth();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
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
        data.data.pastScores.reverse();
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <Navbar username={userData.name} />
      {loading ? (
        <Loader />
      ) : (
        <div className="profile_main_cont">
          <div className="profile_inner_cont">
            <div className="profile_data">
              <p className="profile_heading">Highest Score</p>
              <div className="profile_data_box">
                <div className="profile_scoreBox">
                  <p>Score: </p>
                  <p>
                    {userData.highestScore ? userData.highestScore.score : 0}
                  </p>
                </div>
                <p>
                  {userData.highestScore && userData.highestScore.score !== 0
                    ? new Date(userData.highestScore.date).toDateString()
                    : ""}
                </p>
              </div>
            </div>
            <div className="profile_data">
              <p className="profile_heading">Past Scores</p>
              {!loading &&
                userData.pastScores &&
                userData.pastScores.length === 0 && (
                  <div className="profile_data_box">
                    You have not played any game.
                  </div>
                )}
              {!loading &&
                userData.pastScores &&
                userData.pastScores.map((item, ind) => (
                  <div className="profile_data_box" key={ind}>
                    <div className="profile_scoreBox">
                      <p>Score: </p>
                      <p>{item.score}</p>
                    </div>
                    <p>{new Date(item.date).toDateString()}</p>
                  </div>
                ))}
            </div>
            <div>
              <Link to={"/hangman"} className="btn">
                Play Game
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
