import { Component, createSignal, onCleanup } from 'solid-js';
import * as rrweb from 'rrweb';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import styles from './App.module.css';

interface RRWebEvent {
  type: number;
  data: any;
  timestamp: number;
}

const App: Component = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  let events: RRWebEvent[] = [];
  let stopFn: (() => void) | null = null;
  let player: any = null;

  const startRecording = () => {
    console.log('Starting recording...');
    const iframe = document.querySelector('iframe');
    if (!iframe?.contentWindow) {
      console.error('No iframe found or contentWindow not accessible');
      return;
    }

    events = []; // Reset events
    console.log('Events array reset');

    const recordingFn = rrweb.record({
      emit: (event) => {
        events.push(event);
        console.log('Event recorded:', event.type, 'Total events:', events.length);
      },
    });

    if (recordingFn) {
      console.log('Recording started successfully');
      stopFn = recordingFn;
      setIsRecording(true);
    } else {
      console.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (stopFn) {
      stopFn();
      stopFn = null;
      setIsRecording(false);
      console.log('Recording stopped, total events:', events.length);

      // Initialize player after a short delay to ensure DOM is ready
      setTimeout(() => {
        console.log('Initializing player...');
        const playerDom = document.querySelector('#rrweb-player') as HTMLElement;
        console.log('Player DOM element:', playerDom);
        console.log('Events available:', events.length);

        if (playerDom && events.length > 0) {
          if (player) {
            console.log('Destroying existing player');
            player.destroy();
          }

          try {
            console.log('Creating new player instance');
            player = new rrwebPlayer({
              target: playerDom,
              props: {
                events,
                width: 800,
                height: 450,
                autoPlay: true,
                showController: true,
              },
            });
            console.log('Player created successfully');
          } catch (error) {
            console.error('Error creating player:', error);
          }
        } else {
          console.error('Player DOM not found or no events to replay');
          console.log('playerDom:', playerDom);
          console.log('events:', events);
        }
      }, 100);
    } else {
      console.warn('Stop function not found');
    }
  };

  onCleanup(() => {
    console.log('Cleaning up...');
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

        <div class={styles.playerContainer}>
          <h2>Replay</h2>
          <div id="rrweb-player"></div>
        </div>
      </main>
    </div>
  );
};

export default App;
