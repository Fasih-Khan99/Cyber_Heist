import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import firebaseConfigured from "@/lib/firebase";
import type { Question, QuestionGroup } from "@/types/game";
export async function fetchQuestionGroups(): Promise<QuestionGroup[]> {
    if (!firebaseConfigured || !db)
        throw new Error(
            "Firebase is not configured. Copy .env.example to .env.local and add your Firebase web configuration."
        );
    const snap = await getDocs(
        query(collection(db, "questionGroups"), orderBy("order", "asc"))
    );
    const groups = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as QuestionGroup)
    );
    const valid = groups.filter(
        (g) =>
            g.questions?.length === 8 &&
            ["password", "phishing", "network", "forensics"].every(
                (s) => g.questions.filter((q) => q.sectionId === s).length === 2
            )
    );
    if (valid.length !== 3)
        throw new Error(
            `Expected 3 groups with 8 questions each (2 per section); found ${valid.length}. Run npm run seed:questions.`
        );
    return valid;
}
export function chooseRandomGroup(groups: QuestionGroup[]): QuestionGroup {
    if (!groups.length) throw new Error("No question groups available");
    return groups[Math.floor(Math.random() * groups.length)];
}
