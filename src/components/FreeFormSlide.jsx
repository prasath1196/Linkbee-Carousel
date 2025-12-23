import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import { simpleMarkdownToHtml } from "../utils/markdown";

/**
 * FreeFormSlide Component
 * 
 * Renders a slide as a collection of free-form elements (Text, Image, Shapes).
 * Uses react-moveable for drag/resize/rotate interactions.
 * Selection state is managed by the parent (App.jsx).
 */
export default function FreeFormSlide({
    slide,
    onUpdate,
    scale = 1,
    isEditable = true,
    selectedElementId,
    onSelect
}) {
    const [target, setTarget] = useState(null);
    const containerRef = useRef(null);
    const elements = slide.elements || [];

    // Sync Moveable target with selectedElementId
    useEffect(() => {
        if (selectedElementId && containerRef.current) {
            const el = containerRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            setTarget(el);
        } else {
            setTarget(null);
        }
    }, [selectedElementId, elements]);

    const updateElement = (id, changes) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, ...changes } : el
        );
        onUpdate({ ...slide, elements: newElements });
    };

    const handleElementMouseDown = (e, elementId) => {
        e.stopPropagation(); // Stop drag/mouse events from bubbling
        if (!isEditable) return;
        onSelect(elementId);
    };

    const handleElementClick = (e) => {
        // CRITICAL FIX: Stop click propagation so container doesn't interpret this as a deselect
        e.stopPropagation();
    };

    const handleContainerClick = () => {
        if (isEditable) onSelect(null); // Deselect
    };

    const getTargetId = (targetElement) => {
        return targetElement.getAttribute("data-id");
    };

    // 1. Add this helper for Shapes
    const getShapeStyles = (el) => ({
        width: '100%',
        height: '100%',
        backgroundColor: el.backgroundColor,
        borderRadius: el.borderRadius || '0px',
        border: el.border || 'none',
        opacity: el.opacity || 1
    });

    return (
        <div
            className="free-form-slide-container"
            style={{
                width: "1080px",
                height: "1350px",
                backgroundColor: slide.backgroundColor || "#ffffff",
                position: "relative",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                overflow: "hidden",
                pointerEvents: 'auto'
            }}
            ref={containerRef}
            onClick={handleContainerClick}
        >
            {elements.map((el) => (
                <div
                    key={el.id}
                    data-id={el.id}
                    className="canvas-element"
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    onClick={handleElementClick}
                    style={{
                        position: "absolute",
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        // Text Styles
                        fontSize: `${el.fontSize}px`,
                        fontFamily: el.fontFamily || "Inter, sans-serif",
                        fontWeight: el.fontWeight,
                        color: el.color,
                        textAlign: el.textAlign,
                        lineHeight: el.lineHeight || 1.2,
                        // Shape Styles
                        transform: `rotate(${el.rotation || 0}deg)`,
                        zIndex: el.zIndex || 1,
                        // Flex alignment for text
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
                        whiteSpace: "pre-wrap",

                        // Interaction
                        cursor: isEditable ? "pointer" : "default",
                        outline: selectedElementId === el.id ? "2px solid #3b82f6" : "none",
                        userSelect: "none",
                        pointerEvents: 'auto'
                    }}
                >
                    {/* Render Text */}
                    {el.type === "text" && (
                        <span
                            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(el.content) }}
                            style={{
                                pointerEvents: 'none',
                                width: '100%',
                                // specific fix for highlighted text backgrounds like Screenshot 4
                                padding: el.padding || '0'
                            }}
                        />
                    )}

                    {/* Render Image */}
                    {el.type === "image" && (
                        <img src={el.src} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} alt="" />
                    )}

                    {/* NEW: Render Shape */}
                    {el.type === "shape" && (
                        <div style={getShapeStyles(el)} />
                    )}
                </div>
            ))}

            {isEditable && target && (
                <Moveable
                    target={target}
                    container={containerRef.current}
                    draggable={true}
                    resizable={true}
                    rotatable={true}
                    snappable={true}
                    bounds={{ left: 0, top: 0, right: 1080, bottom: 1350 }}

                    onDrag={(e) => {
                        e.target.style.left = `${e.left}px`;
                        e.target.style.top = `${e.top}px`;
                    }}
                    onDragEnd={(e) => {
                        const id = getTargetId(e.target);
                        const left = parseFloat(e.target.style.left);
                        const top = parseFloat(e.target.style.top);
                        if (!isNaN(left) && !isNaN(top)) {
                            updateElement(id, { x: left, y: top });
                        }
                    }}

                    onResize={(e) => {
                        e.target.style.width = `${e.width}px`;
                        e.target.style.height = `${e.height}px`;
                        e.target.style.transform = e.drag.transform;
                    }}
                    onResizeEnd={(e) => {
                        const id = getTargetId(e.target);
                        updateElement(id, {
                            width: e.lastEvent.width,
                            height: e.lastEvent.height,
                        });
                    }}

                    onRotate={(e) => {
                        e.target.style.transform = e.drag.transform;
                    }}
                />
            )}
        </div>
    );
}
