import './App.css';
import {useRef,useState,useEffect} from 'react';

function App() {
  let offerRef = useRef(null);
  let answerRef = useRef(null);
  let videoRef = useRef(null);
  let pcRef = useRef(null);
  let [isChecked,setIsChecked] = useState(false);

  let acceptOffer = async () => {
    if(pcRef.current)
      pcRef.current.close();
    let pc = new RTCPeerConnection();
    if(isChecked)
    {
      pc.addTrack((await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})).getVideoTracks()[0])

    }
    else 
    {
      pc.ontrack = (e)=>{
        videoRef.current.srcObject = e.streams[0];
      }
    }
    try {
    let offer = JSON.parse(offerRef.current.value);
    await pc.setRemoteDescription(offer);
    let answer = await pc.createAnswer()
    pc.setLocalDescription(answer)
    answerRef.current.value = JSON.stringify(answer)
    pcRef.current = pc;
    } catch(err) {
      console.error(err);
    }
  }
  useEffect(()=>{
    console.log("page loaded");
    return ()=>{
      if (pcRef.current)
        pcRef.current.close();
    }
  },[]);
  return (
    <div className="App">
      <textarea ref={offerRef} defaultValue={"offer json"}></textarea>
      <textarea ref={answerRef} defaultValue={"answer json"} readOnly></textarea>
      <button onClick={()=>acceptOffer()}>accept offer</button>
      <div>
      <input type='checkbox' onChange={()=>setIsChecked((prev)=>!prev)}/>
      <p>publish?</p>
      </div>
      <video autoPlay controls muted ref={videoRef} />
    </div>
  );
}

export default App;
