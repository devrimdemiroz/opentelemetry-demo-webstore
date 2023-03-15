import {colors} from "./colors";

export function createDonutChart(node: any): string {
    const successCount = 9;
    const errorCount = 1;
    const total = successCount + errorCount;
    const size = 50;
    const lineWidth = 3;
    const radius = size / 2 - lineWidth / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");


    const successAngle = successCount / total * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, successAngle);
    // invisible
    ctx.strokeStyle = "rgba(0, 0, 0, 0)";
    ctx.stroke();

    // Draw error arc
    const errorAngle = errorCount / total * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, successAngle, successAngle + errorAngle);
    ctx.strokeStyle = colors["ERROR"];
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    return canvas.toDataURL();
}
