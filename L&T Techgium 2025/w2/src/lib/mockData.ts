export const mockStats = {
  totalSubmissions: 24,
  averageScore: 78,
  mostFailedCriterion: "Loop Logic",
  aiFeedbackGenerated: 19,
};

export const mockEvaluations = [
  { id: 1, student: "Alice Chen", assignment: "Sorting Algorithm", score: 85, status: "Pass", submissionType: "Flowchart", feedback: "Good job", submittedAt: "2024-03-10 14:30" },
  { id: 2, student: "Bob Martinez", assignment: "Binary Search Tree", score: 62, status: "Needs Revision", submissionType: "Pseudocode", feedback: "Check logic", submittedAt: "2024-03-12 09:15" },
  { id: 3, student: "Clara Davis", assignment: "Linked List Ops", score: 91, status: "Pass", submissionType: "Code", feedback: "Excellent", submittedAt: "2024-03-14 16:45" },
  { id: 4, student: "Derek Kim", assignment: "Sorting Algorithm", score: 55, status: "Needs Revision", submissionType: "Flowchart", feedback: "Review loop", submittedAt: "2024-03-11 11:20" },
  { id: 5, student: "Eva Johansson", assignment: "Binary Search Tree", score: 78, status: "Pass", submissionType: "Pseudocode", feedback: "Solid work", submittedAt: "2024-03-13 13:10" },
  { id: 6, student: "Frank Li", assignment: "Linked List Ops", score: 44, status: "Needs Revision", submissionType: "Code", feedback: "Major issues", submittedAt: "2024-03-15 10:05" },
];

export const mockCriteria = [
  { id: 1, name: "Loop Logic", weight: 30, indicators: ["Correct loop termination", "Proper iterator usage", "No infinite loops"] },
  { id: 2, name: "Variable Naming", weight: 20, indicators: ["Descriptive names", "Consistent casing", "No single-letter vars"] },
  { id: 3, name: "Decision Completeness", weight: 50, indicators: ["All branches covered", "Edge cases handled", "Default paths defined"] },
];

export const mockAssignments = [
  { id: 1, name: "Sorting Algorithm Flowchart" },
  { id: 2, name: "Binary Search Tree Pseudocode" },
  { id: 3, name: "Linked List Operations" },
];

export const mockRubrics = [
  { id: 1, name: "Algorithm Evaluation Rubric" },
  { id: 2, name: "Data Structure Rubric" },
];

export const mockCriterionFailureRate = [
  { criterion: "Loop Logic", rate: 60 },
  { criterion: "Variable Naming", rate: 25 },
  { criterion: "Decision Completeness", rate: 45 },
  { criterion: "Edge Cases", rate: 55 },
  { criterion: "Code Structure", rate: 30 },
];

export const mockPassFail = [
  { name: "Pass", value: 14, fill: "hsl(152 69% 41%)" },
  { name: "Needs Revision", value: 10, fill: "hsl(38 92% 50%)" },
];

export const mockHeatmap = [
  { student: "Alice", loopLogic: 9, naming: 8, decisions: 7, edgeCases: 6, structure: 9 },
  { student: "Bob", loopLogic: 4, naming: 7, decisions: 5, edgeCases: 3, structure: 6 },
  { student: "Clara", loopLogic: 8, naming: 9, decisions: 9, edgeCases: 8, structure: 10 },
  { student: "Derek", loopLogic: 3, naming: 6, decisions: 4, edgeCases: 5, structure: 5 },
  { student: "Eva", loopLogic: 7, naming: 8, decisions: 8, edgeCases: 7, structure: 7 },
  { student: "Frank", loopLogic: 2, naming: 5, decisions: 3, edgeCases: 4, structure: 4 },
];

export const mockChatHistory = [
  { role: "user" as const, message: "Why is my flowchart wrong?" },
  { role: "ai" as const, message: "Great question! Let me ask you this — what happens when x equals exactly 10? Look at your decision block: does it handle this specific boundary case? Think about whether your condition uses < or ≤." },
  { role: "user" as const, message: "I used x < 10, so 10 wouldn't enter the loop..." },
  { role: "ai" as const, message: "Exactly! Now, should 10 be included based on your problem statement? If the requirement says 'for all values up to and including 10', you'd need x ≤ 10. What would you change in your flowchart?" },
];

export const mockPseudocode = `FUNCTION bubbleSort(arr)
  n = LENGTH(arr)
  FOR i = 0 TO n - 1
    FOR j = 0 TO n - i - 2
      IF arr[j] > arr[j + 1]
        SWAP(arr[j], arr[j + 1])
      END IF
    END FOR
  END FOR
  RETURN arr
END FUNCTION

FUNCTION main()
  data = [64, 34, 25, 12, 22, 11, 90]
  sorted = bubbleSort(data)
  PRINT sorted
END FUNCTION`;

export const mockLinterResults = [
  { line: 3, type: "ok" as const, message: "Outer loop structure is correct." },
  { line: 4, type: "ok" as const, message: "Inner loop bounds are properly set." },
  { line: 5, type: "warning" as const, message: "Consider handling edge case where arr is empty." },
  { line: 12, type: "ok" as const, message: "Function terminates correctly." },
  { line: 15, type: "suggestion" as const, message: "Consider adding input validation for 'data'." },
];
