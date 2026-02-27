import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdfReport = async (e: any): Promise<Blob> => {
    let aiRecommendation = "<p><em>Loading AI recommendation...</em></p>";

    const rubricText = e.rubricBreakdown
        ? e.rubricBreakdown.map((r: any) => `${r.criterion}: ${r.score}/${r.max} - ${r.feedback}`).join("\n")
        : "No detailed breakdown available.";

    try {
        const prompt = `You are a helpful AI Coding Coach evaluating a student's submission.
Student: ${e.student || "N/A"}
Assignment: ${e.assignment || "N/A"}
Submission Type: ${e.submissionType || "N/A"}
Score: ${e.score || 0}%
Status: ${e.status || "N/A"}
Overall Feedback: ${e.feedback || "N/A"}
Rubric Breakdown:
${rubricText}

Based on this evaluation, write a concise, encouraging 2-3 paragraph recommendation for the student on how to improve. Focus on actionable advice and specifically address any criteria where they lost points. Format your response strictly using HTML tags (like <p>, <strong>, <ul>, <li>) and do not include markdown or external commentary.`;

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            aiRecommendation = data.response;
        } else {
            aiRecommendation = "<p><em>Failed to generate AI recommendation. Ensure Ollama is running with the llama3 model.</em></p>";
        }
    } catch (err) {
        console.error("Failed to fetch from Ollama", err);
        aiRecommendation = "<p><em>Failed to connect to local AI for recommendations. Check your connection to Ollama.</em></p>";
    }



    // Generate Rubric Table Rows
    let rubricRows = "";
    if (e.rubricBreakdown && e.rubricBreakdown.length > 0) {
        rubricRows = e.rubricBreakdown.map((r: any, index: number) => {
            const rowColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
            const scoreColor = r.score >= r.max * 0.8 ? '#10b981' : r.score >= r.max * 0.5 ? '#f59e0b' : '#ef4444';
            const scoreBg = r.score >= r.max * 0.8 ? '#d1fae5' : r.score >= r.max * 0.5 ? '#fef3c7' : '#fee2e2';
            return `
      <tr style="background-color: ${rowColor};">
        <td style="padding: 20px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0; width: 25%;">${r.criterion}</td>
        <td style="padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0; width: 15%;">
            <span style="background-color: ${scoreBg}; color: ${scoreColor}; padding: 6px 12px; border-radius: 9999px; font-weight: 800; display: inline-block;">
                ${r.score} / ${r.max}
            </span>
        </td>
        <td style="padding: 20px; color: #475569; font-size: 15px; border-bottom: 1px solid #e2e8f0; line-height: 1.6;">${r.feedback}</td>
      </tr>
    `}).join("");
    } else {
        rubricRows = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 30px; border-bottom: 1px solid #e2e8f0;">No detailed rubric breakdown available.</td></tr>`;
    }

    const isPass = e.status === 'Pass';
    const statusColor = isPass ? '#10b981' : '#ef4444';
    const statusBg = isPass ? '#d1fae5' : '#fee2e2';

    const htmlContent = `
    <div id="pdf-container" style="
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #ffffff;
        color: #0f172a;
        line-height: 1.6;
        width: 800px; /* Fixed width for consistent PDF rendering */
        padding: 40px;
        box-sizing: border-box;
    ">
        <div style="
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        ">
            <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Evaluation Report</h1>
            <p style="margin: 8px 0 0 0; color: #eff6ff; font-size: 16px; font-weight: 500;">${e.assignment || 'Assignment'} • ${e.submissionType || 'Type'}</p>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px;">
            <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Student</span>
                <span style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.student || 'N/A'}</span>
            </div>
            <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Filename</span>
                <span style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.filename || 'N/A'}</span>
            </div>
            <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #06b6d4;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Date Submitted</span>
                <span style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.submittedAt || 'N/A'}</span>
            </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 40px; padding: 30px; background: ${statusBg}; border: 2px dashed ${statusColor}; border-radius: 16px; margin-bottom: 40px;">
            <div style="text-align: center;">
                <div style="font-size: 14px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px;">Final Score</div>
                <div style="font-size: 56px; font-weight: 900; color: ${statusColor}; line-height: 1;">${e.score || 0}%</div>
            </div>
            <div style="height: 60px; width: 2px; background-color: ${statusColor}; opacity: 0.3;"></div>
            <div style="text-align: center;">
                <div style="font-size: 14px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px;">Status</div>
                <div style="font-size: 40px; font-weight: 900; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1;">${e.status || 'N/A'}</div>
            </div>
        </div>

        <h2 style="font-size: 22px; color: #1e293b; border-bottom: 3px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <span style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
            Rubric breakdown
        </h2>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <thead>
                <tr style="background: linear-gradient(to right, #1e293b, #334155); color: white;">
                    <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 15px;">Criterion</th>
                    <th style="padding: 16px; text-align: center; font-weight: 600; font-size: 15px; width: 120px;">Score</th>
                    <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 15px;">Detailed Feedback</th>
                </tr>
            </thead>
            <tbody>
                ${rubricRows}
            </tbody>
        </table>

        <h2 style="font-size: 22px; color: #1e293b; border-bottom: 3px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <span style="background: #eab308; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
            Overall Feedback
        </h2>
        <div style="background: #fffbeb; padding: 24px; border-left: 6px solid #f59e0b; border-radius: 8px; margin-bottom: 40px; font-size: 16px; color: #78350f; font-style: italic; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            "${e.feedback || 'No feedback provided.'}"
        </div>

        <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; border-radius: 16px; border: 1px solid #bae6fd; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <h2 style="margin-top: 0; color: #0284c7; border-bottom: none; font-size: 24px;">
                AI Coach Recommendations
            </h2>
            <div style="color: #0c4a6e; font-size: 16px; line-height: 1.7;">
                ${aiRecommendation}
            </div>
        </div>
        
        <div style="text-align: center; padding-top: 20px; margin-top: 40px; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; font-weight: 500;">
            Generated by MindFlow • ${new Date().toLocaleDateString()}
        </div>
    </div>
  `;

    // Create a temporary container
    const tempContainer = document.createElement('div');
    // Hide it so it doesn't mess up the actual UI but can still be rendered by html2canvas
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    const pdfContainer = document.getElementById('pdf-container');

    if (!pdfContainer) {
        document.body.removeChild(tempContainer);
        throw new Error("Failed to render PDF container");
    }

    // Generate canvas from HTML
    const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Initialize jsPDF with dynamic height to match the full content
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Instead of forcing A4 ('a4'), dynamically set the format dimensions
    const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'p' : 'l',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
    });

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Output as a Blob
    const blob = pdf.output('blob');

    // Clean up
    document.body.removeChild(tempContainer);

    return blob;
};
