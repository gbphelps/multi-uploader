export default function formatBytes(bytes) {
    if (bytes > 1e9) return `${(bytes/1e6).toFixed(1)} GB`
    if (bytes > 1e6) return `${(bytes/1e6).toFixed(1)} MB`
    if (bytes > 1e3) return `${(bytes/1e3).toFixed(1)} KB`
    return `${Math.round(bytes/1e6)} bytes`
}