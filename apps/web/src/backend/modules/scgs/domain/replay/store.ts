// Backward-compatible re-export of the filesystem replay store.
// New code should import from `../infrastructure/replay/filesystem-replay-store`
// or use `createReplayStore` from `../infrastructure/replay/replay-store.factory`.
export { FilesystemReplayStore as ReplayStore } from '../../infrastructure/replay/filesystem-replay-store';
