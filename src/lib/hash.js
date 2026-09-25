// Deterministic small-integer hash for a string, used to pick a stable
// "random-looking" rotation/offset for stickers and cards without
// re-randomizing on every render (or diverging between renders).
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Picks one of a small set of rotation values deterministically from a string.
const ROTATIONS = [-3, -2, -1, 0, 1, 2, 3];
export function rotationFor(str) {
    return ROTATIONS[hashString(str) % ROTATIONS.length];
}
