export type SectionId = "password" | "phishing" | "network" | "forensics";
export type Question = {
    id: string;
    sectionId: SectionId;
    category: string;
    difficulty: string;
    title: string;
    description: string;
    options: string[];
    answerIndex: number;
    explanation: string;
};
export type QuestionGroup = {
    id: string;
    name: string;
    order: number;
    questions: Question[];
};
