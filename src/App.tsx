import { Component, createSignal, onCleanup } from 'solid-js';
import * as rrweb from 'rrweb';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import styles from './App.module.css';
import { RRWebEvent, formatEvent } from './eventFormatting';
import html2canvas from 'html2canvas';

const App: Component = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  let events: RRWebEvent[] = [];
  let stopFn: (() => void) | null = null;
  let player: rrwebPlayer | null = null;

  const takeScreenshot = async () => {
    const iframe = document.querySelector('#rrweb-player iframe') as HTMLIFrameElement;
    if (!iframe?.contentDocument?.body) {
      console.error('Iframe or its content not accessible');
      return;
    }
    console.log('Taking screenshot of iframe: ', iframe);

    try {
      // Get computed dimensions
      const rect = iframe.getBoundingClientRect();
      const contentRect = iframe.contentDocument.body.getBoundingClientRect();

      const canvas = await html2canvas(iframe.contentDocument.body, {
        width: contentRect.width,
        height: contentRect.height,
        background: undefined,
        // Special options for iframe capture
        useCORS: true,
        allowTaint: true,
      });

      const screenshot = canvas.toDataURL('image/png');

      // Create a temporary link to download the screenshot
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `todo-app-screenshot-${timestamp}.png`;
      link.href = screenshot;
      link.click();
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  window['takeScreenshot'] = takeScreenshot;

  const initializePlayer = (events: RRWebEvent[]) => {
    const playerDom = document.querySelector('#rrweb-player') as HTMLElement;
    if (!playerDom) {
      console.error('Player DOM element not found');
      return null;
    }

    try {
      console.log('Creating new player instance');
      playerDom.innerHTML = '';
      return new rrwebPlayer({
        target: playerDom,
        props: {
          events,
          width: 800,
          height: 450,
          autoPlay: true,
          showController: true,
        },
      });
    } catch (error) {
      console.error('Error creating player:', error);
      return null;
    }
  };

  // Add message handler for iframe events
  const setupMessageHandler = () => {
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'RRWEB_EVENT') {
        const event = e.data.event;
        events.push(event);
        console.log(formatEvent(event));
        
        if (events.length >= 2 && !player) {
          player = initializePlayer(events);
          if (!player) {
            console.error('Failed to initialize player');
            return;
          }
        }

        if (player) {
          player.addEvent(event);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  };

  const startRecording = () => {
    console.log('Starting recording...');
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe?.contentWindow) {
      console.error('No iframe found or contentWindow not accessible');
      return;
    }

    events = []; // Reset events
    console.log('Events array reset');

    // Initialize player before starting recording
    if (player) {
      console.log('Destroying existing player');
      player = null;
    }

    // Start recording in iframe
    iframe.contentWindow.postMessage({ type: 'START_RECORDING' }, '*');
    
    // Setup message handler for events
    const removeHandler = setupMessageHandler();
    stopFn = () => {
      iframe.contentWindow?.postMessage({ type: 'STOP_RECORDING' }, '*');
      removeHandler();
    };

    console.log('Recording started successfully');
    setIsRecording(true);
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    const iframe = document.querySelector('iframe');
    
    if (stopFn) {
      // Stop recording in iframe
      iframe?.contentWindow?.postMessage({ type: 'STOP_RECORDING' }, '*');
      // Remove message handler
      stopFn();
      stopFn = null;
      setIsRecording(false);
      console.log('Recording stopped, total events:', events.length);
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
      // player.destroy();
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

        <div class="rrweb-ignore">
          <div class={styles.playerContainer}>
            <h2>Replay</h2>
            <div id="rrweb-player"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
