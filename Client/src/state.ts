type AppState = {
    userId?: number;
    mapId?: number;
    username?: string;
}

type AppStateListener = (state: AppState) => void

const appState: AppState = {};
const appStateListeners: AppStateListener[] = [];

function publishStateChange() {
    appStateListeners.forEach(
        listener => listener(appState)
    );
}

function getAppState() { return {...appState}; } //shallow copy

function setAppState(state: Partial<AppState>) {
    Object.assign(appState, state);
    publishStateChange();
}

function addAppStateListener(listener: AppStateListener) {
    appStateListeners.push(listener);
}

export const State = {
     get: getAppState,
     set: setAppState,
     addListener: addAppStateListener
};
