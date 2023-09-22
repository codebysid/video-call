import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer.js";

const Room = () => {
  const [userJoinedID, setUserJoinedID] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const socket = useSocket();

  const handleUserJoined = (data) => {
    const { id } = data;
    setUserJoinedID(id);
  };

  const handleCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: userJoinedID, offer });
    setMyStream(stream);
  };

  const handleIncomingCall = async ({ from, offer }) => {
    setUserJoinedID(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  };

  const sendStreams = async () => {
    myStream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, myStream);
    });
  };

  const handleCallAccepted = async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
    sendStreams();
  };

  const handleNegoNeeded = async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: userJoinedID });
  };

  const handleNegoNeededIncoming = async ({ from, offer }) => {
    const answer = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, answer });
  };

  const handleNegoFinal = async ({ from, answer }) => {
    await peer.setLocalDescription(answer);
  };

  useEffect(() => {
    peer.peer.addEventListener("track", async (event) => {
      console.log("listening");
      const streams = event.streams[0];
      setRemoteStream(streams);
    });
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoFinal,
    handleNegoNeededIncoming,
  ]);
  return (
    <div>
      Room
      {userJoinedID ? `connected to ${userJoinedID}` : "No One is here"}
      {remoteStream && <button onClick={sendStreams}>Refresh</button>}
      {userJoinedID && <button onClick={handleCall}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="300px"
            width="500px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h2>Remote Stream</h2>
          <ReactPlayer
            playing
            muted
            height="300px"
            width="500px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default Room;
