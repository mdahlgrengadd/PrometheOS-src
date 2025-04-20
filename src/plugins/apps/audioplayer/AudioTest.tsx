import React, { useEffect, useRef } from "react";

interface CustomWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

/**
 * A simple component to test different audio playback methods
 */
const AudioTest: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Path to the sample audio
  const audioPath = "/audio/sample1.mp3";

  // Test method 1: HTML Audio element with controls
  const testHTMLAudio = () => {
    console.log("Testing HTML Audio element");
    // The audio element is rendered with controls in the JSX
  };

  // Test method 2: Web Audio API oscillator (direct test tone)
  const testWebAudioAPI = () => {
    console.log("Testing Web Audio API oscillator");
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as CustomWindow).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.3; // 30% volume

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        console.log("Test tone finished");
      }, 1000);
      return true;
    } catch (error) {
      console.error("Test tone failed:", error);
      return false;
    }
  };

  // Test method 3: Programmatic HTML Audio element
  const testProgrammaticAudio = () => {
    console.log("Testing programmatic audio");
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.5;
      audio
        .play()
        .then(() => console.log("Programmatic audio playing"))
        .catch((err) => console.error("Programmatic audio failed:", err));
    } catch (error) {
      console.error("Programmatic audio creation failed:", error);
    }
  };

  // Test method 4: Check file existence with fetch
  const testFetchAudio = () => {
    console.log(`Testing fetch for file: ${audioPath}`);
    fetch(audioPath)
      .then((response) => {
        console.log(
          `Fetch response: ${response.status} ${response.statusText}`
        );
        if (response.ok) {
          console.log("File exists and is accessible");
        } else {
          console.error(
            `File error: ${response.status} ${response.statusText}`
          );
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };

  // Run tests on mount
  useEffect(() => {
    console.log("Running audio tests...");

    // Test fetch first to see if the file exists
    testFetchAudio();

    // Run test tone (doesn't depend on external file)
    testWebAudioAPI();

    // Try programmatic audio
    setTimeout(() => {
      testProgrammaticAudio();
    }, 2000); // Delay 2 seconds
  }, []);

  return (
    <div
      style={{
        margin: "20px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "5px",
      }}
    >
      <h2>Audio Testing Component</h2>
      <p>Testing audio playback with various methods.</p>
      <p>Check the console for detailed logs.</p>

      <h3>Method 1: HTML Audio Element</h3>
      <audio
        ref={audioRef}
        src={audioPath}
        controls
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={testWebAudioAPI}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Test Tone
        </button>

        <button
          onClick={testProgrammaticAudio}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Test Programmatic Audio
        </button>

        <button
          onClick={testFetchAudio}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Test File Fetch
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Audio path:</h3>
        <pre>{audioPath}</pre>
      </div>
    </div>
  );
};

export default AudioTest;
