import { Component, createSignal, onCleanup } from 'solid-js';
import * as rrweb from 'rrweb';
import rrwebPlayer from 'rrweb-player';
import styles from './App.module.css';

interface RRWebEvent {
  type: number;
  data: any;
  timestamp: number;
}

const App: Component = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  const [showPlayer, setShowPlayer] = createSignal(false);
  let events: RRWebEvent[] = [];
  let stopFn: (() => void) | null = null;
  let player: any = null;

  const startRecording = () => {
    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) return;

    events = []; // Reset events
    const recordingFn = rrweb.record({
      emit: (event) => {
        events.push(event);
      },
    });
    
    if (recordingFn) {
      stopFn = recordingFn;
      setIsRecording(true);
      setShowPlayer(false);
    }
  };

  const stopRecording = () => {
    if (stopFn) {
      stopFn();
      stopFn = null;
      setIsRecording(false);
      
      // Initialize player after a short delay to ensure DOM is ready
      setTimeout(() => {
        const playerDom = document.querySelector('#rrweb-player') as HTMLElement;
        if (playerDom && events.length > 0) {
          if (player) {
            player.destroy();
          }
          player = new rrwebPlayer({
            target: playerDom,
            props: {
              events,
              width: 1000,
              height: 600,
              autoPlay: true,
            },
          });
          setShowPlayer(true);
        }
      }, 100);
    }
  };

  onCleanup(() => {
    if (stopFn) {
      stopFn();
    }
    if (player) {
      player.destroy();
    }
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>RRWeb Demo with Todo App</h1>
      </header>
      
      <main class={styles.main}>
        <div class={styles.controls}>
          {!isRecording() ? (
            <button onClick={startRecording} class={styles.recordButton}>
              Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} class={styles.stopButton}>
              Stop Recording
            </button>
          )}
        </div>

        <div class={styles.iframeContainer}>
          <iframe 
            src="/todo.html" 
            width="100%" 
            height="400px"
            title="Todo App"
          />
        </div>

        {showPlayer() && (
          <div class={styles.playerContainer}>
            <h2>Replay</h2>
            <div id="rrweb-player"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
