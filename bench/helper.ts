export function formatNumberWithUnderscores(num: number | undefined): string {
    const str = num.toString().split("").reverse().join(""); // Reverse the string
    const formatted = str.replace(/(\d{3})(?=\d)/g, '$1_').split("").reverse().join(""); // Add underscores and reverse back
    return formatted;
}