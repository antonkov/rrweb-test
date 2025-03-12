// Event type enums for better readability
export enum EventType {
  DomContentLoaded = 0,
  Load = 1,
  FullSnapshot = 2,
  IncrementalSnapshot = 3,
  Meta = 4,
  Custom = 5,
  Plugin = 6
}

export enum IncrementalSource {
  Mutation = 0,
  MouseMove = 1,
  MouseInteraction = 2,
  Scroll = 3,
  ViewportResize = 4,
  Input = 5,
  TouchMove = 6,
  MediaInteraction = 7,
  StyleSheetRule = 8,
  CanvasMutation = 9,
  Font = 10,
  Log = 11,
  Drag = 12,
  StyleDeclaration = 13
}

export enum MouseInteractionType {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DblClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchMove_Departed = 8,
  TouchEnd = 9,
  TouchCancel = 10,
}

export interface RRWebEvent {
  type: number;
  data: any;
  timestamp: number;
}

export const formatEvent = (event: RRWebEvent): string => {
  const time = new Date(event.timestamp).toISOString();
  let description = '';

  switch (event.type) {
    case EventType.DomContentLoaded:
      description = 'DOM Content Loaded';
      break;
    case EventType.Load:
      description = 'Page Load Complete';
      break;
    case EventType.FullSnapshot:
      description = 'Full Page Snapshot';
      break;
    case EventType.IncrementalSnapshot:
      const source = event.data.source;
      switch (source) {
        case IncrementalSource.Mutation:
          description = 'DOM Mutation';
          break;
        case IncrementalSource.MouseMove:
          description = `Mouse Move to (${event.data.positions?.[0]?.x ?? 'unknown'}, ${event.data.positions?.[0]?.y ?? 'unknown'})`;
          break;
        case IncrementalSource.MouseInteraction:
          const action = MouseInteractionType[event.data.type] || 'Unknown Interaction';
          description = `Mouse ${action} on element ${event.data.id}`;
          break;
        case IncrementalSource.Scroll:
          description = `Scroll to (${event.data.x}, ${event.data.y})`;
          break;
        case IncrementalSource.ViewportResize:
          description = `Viewport Resize to ${event.data.width}x${event.data.height}`;
          break;
        case IncrementalSource.Input:
          description = `Input Change on element ${event.data.id}`;
          break;
        case IncrementalSource.TouchMove:
          description = 'Touch Move';
          break;
        default:
          description = `Incremental Update (source: ${source})`;
      }
      break;
    case EventType.Meta:
      description = `Meta Event (width: ${event.data.width}, height: ${event.data.height})`;
      break;
    case EventType.Custom:
      description = 'Custom Event';
      break;
    case EventType.Plugin:
      description = 'Plugin Event';
      break;
    default:
      description = `Unknown Event Type: ${event.type}`;
  }

  return `[${time}] ${description}`;
}; 