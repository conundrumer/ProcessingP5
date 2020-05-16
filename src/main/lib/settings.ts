import * as fileSystem from './file-system';

const remote = window.require('electron').remote;
const settings = remote.require('electron-settings');
const path = remote.require('path');
const fs = remote.require('fs');
const app = remote.app;

export const sketchMainFile = 'main.js';

const veryFirstSketchName = 'my-first-sketch/';
const defaultSketchesWorkspaceName = 'ProcessingP5/';


const keys = {
  baseSketchesPath: 'base-sketches-path',
  currentSketchPath: 'current-sketch-path',
};

// oh my this is a hot mess
export function initSettings(): void {
  console.log('settings.initSettings()');

  // useful for dev mode
  // settings.deleteAll();

  // first time opening the app
  if (!settings.has(keys.baseSketchesPath)) {
    const basePath = path
      .join(app.getPath('documents'), defaultSketchesWorkspaceName) as string;

    settings.set(keys.baseSketchesPath, basePath);

    try {
      fs.mkdirSync(basePath, {
        recursive: true
      });
      fileSystem.createNewSketch(veryFirstSketchName);
    } catch (e) {
      // the configuration might have disappeared but the
      // directories still exist
      console.error(e);
    }

  }

  const currentSketch = getCurrentSketchPath();

  // the previously open sketch doesn't exist anymore
  if (!fs.existsSync(currentSketch)) {
    // make sure the directory exists
    fs.mkdirSync(getBaseSketchesPath(), {
      recursive: true
    });

    const sketches = fs.readdirSync(getBaseSketchesPath());

    // open  the first available sketch
    if (sketches.length > 0) {
      setCurrentSketchPath(
        path.join(getBaseSketchesPath(), sketches[0]));
    } else {
      fileSystem.createNewSketch(veryFirstSketchName);
    }
  }
}

export function getBaseSketchesPath(): string {
  return settings.get(keys.baseSketchesPath);
}

export function getCurrentSketchPath(): string {
  return settings.get(keys.currentSketchPath);
}

export function setCurrentSketchPath(newPath: string): void {
  settings.set(keys.currentSketchPath, newPath);
}