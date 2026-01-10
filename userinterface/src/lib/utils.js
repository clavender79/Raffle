export function formatRemainingTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;

    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (days > 0) parts.push(`${days} d`);
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} m`);
    parts.push(`${seconds} s`); // Always show seconds

    return parts.join(' ');
}