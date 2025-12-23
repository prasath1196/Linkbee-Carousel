/**
 * Helper: Parse Content
 * Returns raw text (markdown is handled by renderer)
 */
const parseText = (text) => {
    if (!text) return "";
    return text;
};

/**
 * SMART HELPER: Estimate Text Height
 * Calculates how tall a text block will be so we can push the next one down.
 */
const estimateHeight = (text, fontSize, containerWidth, lineHeight = 1.2) => {
    if (!text) return 0;

    // avg char width is roughly 0.5 to 0.6 of font size for most sans-serif fonts
    const avgCharWidth = fontSize * 0.6;
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);

    // Estimate lines (minimum 1)
    const lines = Math.ceil(text.length / charsPerLine) || 1;

    // Return height + a little buffer
    return (lines * fontSize * lineHeight) + 20;
};

/**
 * Layout Strategy: CLASSIC (Smart Stacking)
 */
const layoutClassic = (slide, theme, generateId) => {
    const elements = [];
    let currentY = 120; // Start Y

    // 1. TITLE
    // Dynamic Font Sizing: Shrink font if title is very long
    const isLongTitle = slide.title.length > 60;
    const titleFontSize = isLongTitle ? theme.title.fontSize * 0.75 : theme.title.fontSize;
    const titleHeight = estimateHeight(slide.title, titleFontSize, 920);

    elements.push({
        id: `title-${generateId()}`,
        type: "text",
        content: parseText(slide.title),
        x: 80,
        y: currentY,
        width: 920,
        height: titleHeight,
        fontSize: titleFontSize,
        fontFamily: theme.fontFamily,
        fontWeight: theme.title.fontWeight,
        color: theme.title.color,
        textAlign: 'left',
        zIndex: 10
    });

    // Move Y down by title height + gap
    currentY += titleHeight + 60;

    // 2. CONTENT LOOP
    if (slide.content && Array.isArray(slide.content)) {
        slide.content.forEach((item, i) => {
            const itemHeight = estimateHeight(item, theme.content.fontSize, 920);

            elements.push({
                id: `text-${generateId()}-${i}`,
                type: "text",
                content: parseText(item),
                x: 80,
                y: currentY,
                width: 920,
                height: itemHeight,
                fontSize: theme.content.fontSize,
                fontFamily: theme.fontFamily,
                fontWeight: theme.content.fontWeight,
                color: theme.content.color,
                textAlign: 'left',
                zIndex: 10
            });

            // Stack next item below this one
            currentY += itemHeight + 40;
        });
    }

    // Decorative Arrow
    elements.push({
        id: `deco-${generateId()}`,
        type: "text",
        content: "→",
        x: 880, y: 1150, width: 150, height: 150,
        fontSize: 120, fontFamily: 'Arial', color: theme.accentColor, textAlign: 'right', zIndex: 5
    });

    return elements;
};

/**
 * Layout Strategy: CENTERED (Smart Stacking)
 * Used by themes like "Luxe Gold"
 */
const layoutCentered = (slide, theme, generateId) => {
    const elements = [];

    // 1. TITLE (Centered Top)
    // Reduce font size aggressively if it's a massive title
    const isMassive = slide.title.length > 80;
    const titleFontSize = isMassive ? theme.title.fontSize * 0.6 : theme.title.fontSize;
    const titleHeight = estimateHeight(slide.title, titleFontSize, 980);

    // Center the title vertically in the top section if short, or start at top if long
    let startY = 300;
    if (titleHeight > 300) startY = 150; // Move up if it's huge

    elements.push({
        id: `title-${generateId()}`,
        type: "text",
        content: parseText(slide.title),
        x: 50,
        y: startY,
        width: 980,
        height: titleHeight,
        fontSize: titleFontSize,
        fontFamily: theme.fontFamily,
        fontWeight: theme.title.fontWeight,
        color: theme.title.color,
        textAlign: 'center',
        zIndex: 10
    });

    // 2. CONTENT (Stacked Below)
    let currentY = startY + titleHeight + 80; // Start content below title

    if (slide.content && Array.isArray(slide.content)) {
        slide.content.forEach((item, i) => {
            const itemHeight = estimateHeight(item, theme.content.fontSize, 880);

            elements.push({
                id: `text-${generateId()}-${i}`,
                type: "text",
                content: parseText(item),
                x: 100,
                y: currentY,
                width: 880,
                height: itemHeight,
                fontSize: theme.content.fontSize,
                fontFamily: theme.fontFamily,
                fontWeight: theme.content.fontWeight,
                color: theme.content.color,
                textAlign: 'center',
                zIndex: 10
            });

            currentY += itemHeight + 50;
        });
    }

    // Decorative Corner
    elements.push({
        id: `shape-${generateId()}`,
        type: "shape",
        x: 900, y: -100, width: 300, height: 300,
        backgroundColor: theme.accentColor,
        borderRadius: "50%",
        zIndex: 1
    });

    return elements;
};

/**
 * Layout Strategy: SIDEBAR (Smart Stacking)
 */
const layoutSidebar = (slide, theme, generateId) => {
    const elements = [];
    const PADDING = 100;
    let currentY = 250;

    // Sidebar Line
    elements.push({
        id: `shape-${generateId()}`,
        type: "shape",
        x: 40, y: 100, width: 10, height: 1150,
        backgroundColor: theme.accentColor,
        borderRadius: "4px",
        zIndex: 1
    });

    // 1. TITLE
    const titleHeight = estimateHeight(slide.title, theme.title.fontSize, 850);
    elements.push({
        id: `title-${generateId()}`,
        type: "text",
        content: parseText(slide.title),
        x: PADDING + 20,
        y: currentY,
        width: 850,
        height: titleHeight,
        fontSize: theme.title.fontSize,
        fontFamily: theme.fontFamily,
        fontWeight: theme.title.fontWeight,
        color: theme.title.color,
        textAlign: 'left',
        zIndex: 10
    });

    currentY += titleHeight + 80;

    // 2. CONTENT
    if (slide.content && Array.isArray(slide.content)) {
        slide.content.forEach((item, i) => {
            const itemHeight = estimateHeight(item, theme.content.fontSize, 850);

            elements.push({
                id: `text-${generateId()}-${i}`,
                type: "text",
                content: parseText(item),
                x: PADDING + 20,
                y: currentY,
                width: 850,
                height: itemHeight,
                fontSize: theme.content.fontSize,
                fontFamily: theme.fontFamily,
                fontWeight: theme.content.fontWeight,
                color: theme.content.color,
                textAlign: 'left',
                zIndex: 10
            });

            currentY += itemHeight + 50;
        });
    }

    return elements;
};

/**
 * MAIN CONVERTER
 */
export function aiToCanvasElements(slide, index, theme) {
    const generateId = () => Math.random().toString(36).substr(2, 9);
    const layoutType = theme?.layoutType || 'classic';

    switch (layoutType) {
        case 'centered': return { ...slide, elements: layoutCentered(slide, theme, generateId), backgroundColor: theme?.backgroundColor || "#ffffff" };
        case 'sidebar': return { ...slide, elements: layoutSidebar(slide, theme, generateId), backgroundColor: theme?.backgroundColor || "#ffffff" };
        default: return { ...slide, elements: layoutClassic(slide, theme, generateId), backgroundColor: theme?.backgroundColor || "#ffffff" };
    }
}
