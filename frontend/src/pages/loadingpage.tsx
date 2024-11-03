import React, { useEffect, useState } from "react";
import { Loader, Button, Header, Container } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "semantic-ui-css/semantic.min.css";
import { timeStamp } from "console";

interface CustomJwtPayload extends JwtPayload {
  email?: string;
  name?: string;
}

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [matchFound, setMatchFound] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [matchDeclined, setMatchDeclined] = useState(false);
  const [matchAccepted, setMatchAccepted] = useState(false);
  const [userAccepted, setUserAccepted] = useState(false);
  const location = useLocation();
  const requestData = location.state;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const disableBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/loading");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", disableBackButton);

    const jwtToken = localStorage.getItem("access_token");
    let decodedToken: CustomJwtPayload | null = null;
    if (jwtToken) {
      decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
    }

    const eventSource = new EventSource(
      `http://localhost:3009/rabbitmq/${decodedToken?.email}`
    );
    // console.log("connected");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data received is", data);
      if (data.event === "Match") {
        if (data.userEmail === decodedToken?.email) {
          setMatchFound(true);
          setMatchData(data);
          clearInterval(timer);
        } else {
          console.log("Error in handline Match event");
          console.log(data);
          console.log(decodedToken?.email);
        }
      } else if (data.event === "Decline") {
        if (data.userEmail === decodedToken?.email) {
          setMatchDeclined(true)
          clearInterval(timer);
        } else {
          console.log("Error in handline Decline event");
          console.log(data);
          console.log(decodedToken?.email);
        }
      } else if (data.event === "Accept") {
        if (data.userEmail === decodedToken?.email) {
          setMatchAccepted(true)
          if (userAccepted) {
            getCollabRoomId()
              .then((roomId) => {
                console.log("Room ID after fetching:", roomId); // Log the room ID
                if (roomId) {
                  navigate(`/collaboration-page/room_id/${roomId}`,  { state: requestData }); // Use the room ID for navigation
                } else {
                  console.error("No room ID returned"); // Handle case where no room ID was returned
                }
              })
              .catch((error) => {
                console.error("Error getting collab room:", error); // Handle any errors that occurred
              });
          }
          clearInterval(timer);
        } else {
          console.log("Error in handline Accept event");
          console.log(data);
          console.log(decodedToken?.email);
        }
      }
    };
    return () => {
      clearInterval(timer);
      eventSource.close();
    };
  }, [countdown, matchFound, matchDeclined, matchAccepted, userAccepted]);

  const resetTimer = () => {
    setCountdown(30);
    setMatchFound(false);
    setMatchDeclined(false);
    setMatchAccepted(false);
    setUserAccepted(false);
    setMatchData(null);
    const retryData = {
      ...requestData,
      timeStamp: new Date().toISOString(),
    };
    fetch("http://localhost:3009/rabbitmq/enter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(retryData),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Retry successful", result);
      })
      .catch((error) => {
        console.error("Error during retry:", error);
      });
  };

  const handleExit = () => {
    removeFromQueue().then(() => {
      navigate("/matching-page");
    });
  };

  const jwtToken = localStorage.getItem("access_token");
  let decodedToken: CustomJwtPayload | null = null;
  if (jwtToken) {
    decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
  }
  
  const removeFromQueue = async () => {
    const response = await fetch("http://localhost:3009/rabbitmq/remove_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail: decodedToken?.email }),
    });
    if (!response.ok) {
      console.error("Failed to remove user from queue");
    } else {
      console.log("User successfully removed from queue");
    }
  };

  const handleDecline = () => {
    console.log("DECLINE PRESSED")
    fetch("http://localhost:3009/rabbitmq/match_declined", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: matchData.matchEmail }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Decline post successful", result);
      })
      .catch((error) => {
        console.error("Error during decline post:", error);
      });
    setMatchDeclined(true)
  }

  const getCollabRoomId = (): Promise<string | null> => {
    return fetch("http://localhost:3009/rabbitmq/collab_room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail: matchData.userEmail, matchEmail: matchData.matchEmail }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Collab Room post successful", result);
        return result.room_id; // Return the room ID
      })
      .catch((error) => {
        console.error("Error during collab Room post:", error);
        return null; // Explicitly return null on error
      });
  };

  const handleAccept = () => {
    console.log("ACCEPT PRESSED")
    fetch("http://localhost:3009/rabbitmq/match_accepted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: matchData.matchEmail }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Accept post successful", result);
      })
      .catch((error) => {
        console.error("Error during accept post:", error);
      });
    setUserAccepted(true);

    if (matchAccepted) {
      getCollabRoomId()
        .then((roomId) => {
          console.log("Room ID after fetching:", roomId); // Log the room ID
          if (roomId) {
            navigate(`/collaboration-page/room_id/${roomId}`,  { state: requestData }); // Use the room ID for navigation
          } else {
            console.error("No room ID returned"); // Handle case where no room ID was returned
          }
        })
        .catch((error) => {
          console.error("Error getting collab room:", error); // Handle any errors that occurred
        });
    }
  }

  const conditionalRender = () => {
    if (!matchFound) {
      if (countdown > 0) {
        return (
          <Container textAlign="center">
            <Loader active inverted indeterminate size="massive" content={`Matching in ${countdown} seconds`}/>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "200px" }}>
            <Button color="red" size="large" onClick={handleExit}> Cancel Search </Button>
            </div>
          </Container>
        );
      } else if (countdown <= 0) {
        return (
          <Container textAlign="center">
            <Header as="h1" size="huge" style={{ color: "white" }}>
              Unable to find a match
            </Header>
            <Header as="h2" size="large" style={{ color: "white" }}>
              Retry matchmaking?
            </Header>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "20px" }}
            >
              <Button primary size="large" onClick={resetTimer}>
                Retry
              </Button>
              <Button
                color="red"
                size="large"
                onClick={() => navigate("/matching-page")}
              >
                Exit
              </Button>
            </div>
          </Container>
        );
      }
    } else if (matchFound) {

      if (matchDeclined) {
        return (
          <Container textAlign="center">
            <Header as="h1" size="huge" style={{ color: "white" }}>
              Match declined
            </Header>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "20px" }}
            >
              <Button primary size="large" onClick={resetTimer}>
                Retry
              </Button>
              <Button
                color="red"
                size="large"
                onClick={() => navigate("/matching-page")}
              >
                Exit
              </Button>
            </div>
          </Container>
        );
      } else if (userAccepted && !matchAccepted) {
        return (
          <Loader
            active
            inverted
            indeterminate
            size="massive"
            content={"Wating for match to accept"}
          />
        )

      } else if (!userAccepted && matchAccepted) {
        return (
          <Container textAlign="center" style={{ position: 'relative' }}>
            <Loader
              active
              inverted
              indeterminate
              size="massive"
              content="Match has accepted collaboration..."
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', zIndex: 2, marginTop: '250px' }} >
              <Button negative size="large" onClick={handleDecline}>
                Decline
              </Button>
              <Button positive size="large" onClick={handleAccept}>
                Accept
              </Button>
            </div>
          </Container >
        );

      } else {
        return (
          <Container textAlign="center">
            <Header as="h1" size="huge" style={{ color: "white" }}>
              Match Found
            </Header>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "20px" }}
            >
              <Button
                negative
                size="large"
                onClick={handleDecline}
              >
                Decline
              </Button>
              <Button
                positive
                size="large"
                onClick={handleAccept}
              >
                Accept
              </Button>
            </div>
          </Container>
        );
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white">
      {conditionalRender()}
    </div>
  );
};

export default LoadingPage;
