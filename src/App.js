import './App.css';
import { useRef, useState, useEffect } from 'react';

function App() {
  let pcRef = useRef(null);
  let [connectionMade, setConnectionMade] = useState(false);

  async function run() {
    if (pcRef.current)
      pcRef.current.close();
    let pc = new RTCPeerConnection();
    let dc = pc.createDataChannel("my data channel")
    dc.onopen = (ev) => {
      console.log(ev)
      dc.send("hello world!");
    }
    dc.onmessage = (ev) => {
      console.log(ev)
    }
    try {
      pc.onicegatheringstatechange = async (ev) => {
        console.log(pc.iceGatheringState)
        if (pc.iceGatheringState == "complete") {
          let response = await fetch("http://127.0.0.1:8080/", {
            method: "POST",
            body: JSON.stringify(pc.localDescription)
          })
          let answer = await response.json()
          pc.setRemoteDescription(answer)
          pcRef.current = pc;
        }
      }
      pc.oniceconnectionstatechange = (ev) => {
        console.log(pc.iceConnectionState)
        if (pc.iceConnectionState == "connected") {
          setConnectionMade(true);
        }
      }
      let offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    console.log("page loaded");
    return () => {
      if (pcRef.current)
        pcRef.current.close();
    }
  }, []);
  return (
    <div className="App">
      <button onClick={() => run()}>connect</button>
      <div>
        <input type='checkbox' checked={connectionMade} />
        <p>connected?</p>
      </div>
    </div>
  );
}

export default App;
