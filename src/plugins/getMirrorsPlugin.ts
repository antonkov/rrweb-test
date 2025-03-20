import type { IMirror } from '@rrweb/types';

export const getMirrorsPlugin = {
  name: 'getMirrors',
  getMirror: (mirrors: { nodeMirror: IMirror<any> }) => {
    console.log('Mirrors:', mirrors);
  }
}; 