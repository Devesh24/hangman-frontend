import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAuth } from "../Hooks/auth";
import Loader from "./Loader";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const { cookies } = useAuth();
  const [userData, setUserData] = useState({}); // to store the data of user that is logged in
  const [loading, setLoading] = useState(false);

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

  const [rankingsData, setRankingsData] = useState([]); // fetch leaderboard from db
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await axios.get(`${BASE_URL}/user`);
        setLoading(false);
        setRankingsData(data.data);
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
              <p className="profile_heading">Top 10 User Rankings</p>
              {rankingsData[0] &&
                rankingsData.map((item, ind) => (
                  <div className="profile_data_box">
                    <div className="profile_scoreBox">
                      <p>{item.name}</p>
                      <p style={{ color: "grey", fontSize: "1rem" }}>
                        ( {item.username} )
                      </p>
                    </div>
                    <p className="scoredigit">{item.highestScore.score}</p>
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

export default Leaderboard;
