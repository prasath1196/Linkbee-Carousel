/**
 * Simple utility to convert basic Markdown to HTML.
 * Supports: **bold**, *italic*
 */
export function simpleMarkdownToHtml(text) {
    if (!text) return '';
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>');    // Italic
    return html;
}
