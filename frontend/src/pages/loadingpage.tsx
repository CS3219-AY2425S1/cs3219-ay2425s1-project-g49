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

    const jwtToken = localStorage.getItem("access_token");
    let decodedToken: CustomJwtPayload | null = null;
    if (jwtToken) {
      decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
    }

    const eventSource = new EventSource(
      `http://localhost:3009/rabbitmq/${decodedToken?.email}`
    );
    console.log("connected");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data received is", data);
      if (data.event === "Match") {
        if (data.userEmail === decodedToken?.email) {
          setMatchFound(true);
          setMatchData(data);
          clearInterval(timer);
        } else {
          console.log("Error");
          console.log(data.userEmail);
          console.log(decodedToken?.email);
        }
      } else if (data.event === "Decline") {
        if (data.userEmail === decodedToken?.email) {
          setMatchDeclined(true)
          clearInterval(timer);
        }
      }
    };

    return () => {
      clearInterval(timer);
      eventSource.close();
    };
  }, [countdown, matchFound, matchDeclined]);

  const resetTimer = () => {
    setCountdown(30);
    setMatchFound(false);
    setMatchDeclined(false);
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

  const conditionalRender = () => {
    if (countdown > 0 && !matchFound) {
      return (
        <Loader
          active
          inverted
          indeterminate
          size="massive"
          content={`Matching in ${countdown} seconds`}
        />
      );
    } else if (countdown <= 0 && !matchFound) {
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
    } else if (matchFound && matchDeclined) {
      console.log("match declined");
      console.log("count down is", countdown);
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
    } else {
      console.log("match found is", matchFound);
      console.log("count down is", countdown);
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
              onClick={() => navigate("/matching-page")}
            >
              Accept
            </Button>
          </div>
        </Container>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {conditionalRender()}
    </div>
  );
};

export default LoadingPage;
