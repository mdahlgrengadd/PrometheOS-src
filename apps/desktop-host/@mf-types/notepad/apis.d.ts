
    export type RemoteKeys = 'notepad/App';
    type PackageType<T> = T extends 'notepad/App' ? typeof import('notepad/App') :any;