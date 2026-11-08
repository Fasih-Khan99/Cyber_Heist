import admin from "firebase-admin";
import { readFile } from "node:fs/promises";
const keyPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";
let credential;
try {
    credential = JSON.parse(await readFile(keyPath, "utf8"));
} catch {
    console.error(
        `Cannot read ${keyPath}. Download a service-account JSON key from Firebase Console > Project settings > Service accounts.`
    );
    process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(credential) });
const db = admin.firestore();
const groups = [
    {
        id: "groupA",
        name: "Set A",
        order: 1,
        questions: [
            {
                id: "a-password-1",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "EASY",
                title: "Which password would be hardest for an attacker to guess?",
                description: "Select the strongest credential.",
                options: ["password123", "T!m3$Vault#92x", "alex2008", "qwerty!"],
                answerIndex: 1,
                explanation:
                    "A long, unique password with varied character types is harder to guess.",
            },
            {
                id: "a-password-2",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "MEDIUM",
                title:
                    "An employee reuses a password across work email and a shopping site. What is the main risk?",
                description: "The shopping site has reported a data breach.",
                options: [
                    "The password becomes longer",
                    "Attackers may try the leaked password on the work account",
                    "The email account deletes itself",
                    "The computer runs more slowly",
                ],
                answerIndex: 1,
                explanation:
                    "Credential stuffing tests leaked username and password pairs against other services.",
            },
            {
                id: "a-phishing-3",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "EASY–MEDIUM",
                title:
                    "A bank email asks you to verify your account through an unfamiliar link. What should you do?",
                description:
                    "The message uses urgent language and threatens account suspension.",
                options: [
                    "Click the link immediately",
                    "Reply with your password",
                    "Report it and verify through the bank’s official channel",
                    "Forward it to colleagues",
                ],
                answerIndex: 2,
                explanation:
                    "Avoid suspicious links and verify requests through a trusted, independent channel.",
            },
            {
                id: "a-phishing-4",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "MEDIUM",
                title: "Which email detail is the strongest phishing warning sign?",
                description:
                    "You receive an unexpected message about an attached invoice.",
                options: [
                    "A greeting using your first name",
                    "A sender domain that subtly misspells the real company domain",
                    "A standard company footer",
                    "A message sent during office hours",
                ],
                answerIndex: 1,
                explanation:
                    "Lookalike domains are commonly used to impersonate legitimate organisations.",
            },
            {
                id: "a-network-5",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "MEDIUM",
                title:
                    "Your firewall detects repeated connection attempts from an unknown external IP. What is the best response?",
                description: "The attempts target a restricted internal service.",
                options: [
                    "Disable the firewall",
                    "Block the suspicious source and alert the security team",
                    "Allow all traffic",
                    "Share server credentials",
                ],
                answerIndex: 1,
                explanation:
                    "Contain suspicious traffic and escalate it for investigation.",
            },
            {
                id: "a-network-6",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "MEDIUM",
                title:
                    "A workstation needs to communicate with a database server. Which firewall rule follows least privilege?",
                description: "Only the application service should reach the database.",
                options: [
                    "Allow every port from every network",
                    "Allow the required database port only from the authorised application server",
                    "Disable network filtering",
                    "Allow all inbound traffic temporarily",
                ],
                answerIndex: 1,
                explanation:
                    "Least privilege limits access to the smallest necessary source, destination and service.",
            },
            {
                id: "a-forensics-7",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "Which event in the access logs is the strongest indicator of account compromise?",
                description:
                    "Review the events and identify the most suspicious activity.",
                options: [
                    "A successful login from the user’s usual device and location",
                    "A password reset requested by the user",
                    "A failed login after a mistyped password",
                    "A successful login from an unrecognised device in another country",
                ],
                answerIndex: 3,
                explanation:
                    "An unexpected successful login from a new device and distant location warrants investigation.",
            },
            {
                id: "a-forensics-8",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "You suspect a laptop is compromised. What should an investigator do first to preserve useful evidence?",
                description: "The device may contain volatile evidence.",
                options: [
                    "Immediately wipe the hard drive",
                    "Document the condition and follow an approved evidence-preservation and acquisition process",
                    "Let the user continue working normally",
                    "Delete suspicious files",
                ],
                answerIndex: 1,
                explanation:
                    "Documenting and preserving evidence helps maintain integrity and chain of custody.",
            },
        ],
    },
    {
        id: "groupB",
        name: "Set B",
        order: 2,
        questions: [
            {
                id: "b-password-1",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "EASY",
                title: "Which practice best protects a new online account?",
                description: "You are creating credentials for an important service.",
                options: [
                    "Use your birthday",
                    "Use a unique, long password stored in a password manager",
                    "Reuse your email password",
                    "Write the password on a public noticeboard",
                ],
                answerIndex: 1,
                explanation:
                    "A unique password reduces the impact of a breach on another account.",
            },
            {
                id: "b-password-2",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "EASY–MEDIUM",
                title:
                    "What is the main security benefit of multi-factor authentication (MFA)?",
                description: "A password alone may be stolen or guessed.",
                options: [
                    "It removes the need for updates",
                    "It requires another proof of identity beyond the password",
                    "It makes every website anonymous",
                    "It guarantees phishing is impossible",
                ],
                answerIndex: 1,
                explanation:
                    "MFA adds another verification factor, making password-only compromise less useful.",
            },
            {
                id: "b-phishing-3",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "MEDIUM",
                title:
                    "A colleague sends an unexpected file-sharing link and asks you to sign in. What is safest?",
                description: "The request is unusual for this colleague.",
                options: [
                    "Enter your credentials",
                    "Check with the colleague through a separate trusted channel",
                    "Forward the link to everyone",
                    "Turn off endpoint protection",
                ],
                answerIndex: 1,
                explanation:
                    "Verify unexpected requests using a separate trusted communication channel.",
            },
            {
                id: "b-phishing-4",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "MEDIUM",
                title:
                    "A website URL uses a misspelled version of a familiar brand name. What might this indicate?",
                description:
                    "The page looks almost identical to the genuine login page.",
                options: [
                    "A harmless design update",
                    "A lookalike or typosquatting domain",
                    "A guaranteed secure website",
                    "A faster connection",
                ],
                answerIndex: 1,
                explanation:
                    "Typosquatting domains imitate trusted names to mislead visitors.",
            },
            {
                id: "b-network-5",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "MEDIUM",
                title: "Why should an organisation segment its internal network?",
                description:
                    "A single compromised device should not expose every system.",
                options: [
                    "To make all devices public",
                    "To limit lateral movement and isolate sensitive systems",
                    "To remove authentication",
                    "To increase open ports",
                ],
                answerIndex: 1,
                explanation:
                    "Segmentation reduces an attacker’s ability to move between network zones.",
            },
            {
                id: "b-network-6",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "HARD",
                title:
                    "A public server only needs to accept HTTPS traffic. What inbound policy is best?",
                description: "Apply a minimal-access firewall configuration.",
                options: [
                    "Allow all TCP and UDP ports",
                    "Allow inbound HTTPS only and deny other unsolicited inbound traffic",
                    "Allow remote administration from any IP",
                    "Disable logging",
                ],
                answerIndex: 1,
                explanation:
                    "A default-deny approach with a narrowly permitted HTTPS service reduces exposure.",
            },
            {
                id: "b-forensics-7",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "Why is a cryptographic hash calculated when acquiring a forensic disk image?",
                description:
                    "Investigators need to demonstrate evidence has not changed.",
                options: [
                    "To encrypt the image automatically",
                    "To verify the integrity of the acquired evidence",
                    "To identify the user password",
                    "To improve disk performance",
                ],
                answerIndex: 1,
                explanation:
                    "Matching hashes provide evidence that the image has remained unchanged.",
            },
            {
                id: "b-forensics-8",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "Many failed logins are followed by one successful login from the same unfamiliar IP. What should be investigated?",
                description: "The pattern may indicate a password attack.",
                options: [
                    "Monitor brightness",
                    "Possible brute-force or password-spraying activity followed by account access",
                    "Printer installation",
                    "The clock format",
                ],
                answerIndex: 1,
                explanation:
                    "Repeated failures followed by success can indicate an account attack that succeeded.",
            },
        ],
    },
    {
        id: "groupC",
        name: "Set C",
        order: 3,
        questions: [
            {
                id: "c-password-1",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "EASY",
                title: "Which password is the safest choice for a personal account?",
                description: "Choose the best credential practice.",
                options: [
                    "Summer2026",
                    "A unique passphrase generated and stored by a password manager",
                    "The same password used at work",
                    "Your phone number",
                ],
                answerIndex: 1,
                explanation:
                    "A unique generated password or long passphrase makes guessing and reuse attacks harder.",
            },
            {
                id: "c-password-2",
                sectionId: "password",
                category: "PASSWORD SECURITY",
                difficulty: "MEDIUM",
                title:
                    "You receive an MFA approval prompt that you did not initiate. What should you do?",
                description: "Several unexpected prompts have appeared.",
                options: [
                    "Approve it to stop the prompts",
                    "Deny it and report the incident; change credentials through the official process",
                    "Share the prompt code with a caller",
                    "Ignore all future security notifications",
                ],
                answerIndex: 1,
                explanation:
                    "Unexpected MFA prompts can indicate someone already knows your password.",
            },
            {
                id: "c-phishing-3",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "EASY–MEDIUM",
                title:
                    "A delivery text says a small fee is required and provides a shortened link. What is safest?",
                description: "You are not expecting a payment request.",
                options: [
                    "Pay through the link",
                    "Use the courier’s official app or website to check independently",
                    "Reply with card details",
                    "Send the text to your contacts",
                ],
                answerIndex: 1,
                explanation:
                    "Check delivery information independently rather than using an unsolicited link.",
            },
            {
                id: "c-phishing-4",
                sectionId: "phishing",
                category: "PHISHING DETECTION",
                difficulty: "HARD",
                title:
                    "An email attachment claims to be an urgent invoice, but the file extension is unexpected. What should you do?",
                description: "The sender is not recognised.",
                options: [
                    "Enable macros",
                    "Do not open it; report it using the organisation’s security process",
                    "Rename it and run it",
                    "Upload it to a public file-sharing site",
                ],
                answerIndex: 1,
                explanation:
                    "Unexpected attachments can deliver malware; report them through approved channels.",
            },
            {
                id: "c-network-5",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "MEDIUM",
                title:
                    "You must access work resources using public Wi-Fi. Which action best reduces risk?",
                description: "You are working remotely.",
                options: [
                    "Disable device security",
                    "Use the organisation-approved VPN and avoid sensitive work on untrusted networks",
                    "Share files in open public folders",
                    "Turn off screen locking",
                ],
                answerIndex: 1,
                explanation:
                    "An approved VPN protects traffic in transit, but caution is still needed on untrusted networks.",
            },
            {
                id: "c-network-6",
                sectionId: "network",
                category: "NETWORK DEFENCE",
                difficulty: "HARD",
                title:
                    "An intrusion detection system alerts on unusual outbound data transfer. What should responders prioritise?",
                description: "The destination and volume are not recognised.",
                options: [
                    "Delete the alert",
                    "Investigate and contain suspected exfiltration while preserving relevant logs",
                    "Increase the transfer limit",
                    "Disable monitoring",
                ],
                answerIndex: 1,
                explanation:
                    "Unusual outbound traffic may indicate exfiltration and needs timely containment and investigation.",
            },
            {
                id: "c-forensics-7",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "Why should investigators record who handled digital evidence and when?",
                description: "Evidence may be reviewed in a formal investigation.",
                options: [
                    "To make the report longer",
                    "To maintain a documented chain of custody",
                    "To allow anyone to edit evidence",
                    "To avoid timestamps",
                ],
                answerIndex: 1,
                explanation:
                    "A chain of custody documents evidence handling and supports its credibility.",
            },
            {
                id: "c-forensics-8",
                sectionId: "forensics",
                category: "DIGITAL FORENSICS",
                difficulty: "HARD",
                title:
                    "A user reports encrypted files and a ransom note. What is a sensible immediate response?",
                description: "The incident may be ransomware.",
                options: [
                    "Pay immediately",
                    "Follow the incident response plan, isolate affected systems where appropriate, and notify the response team",
                    "Delete all logs",
                    "Connect backup drives to every affected machine",
                ],
                answerIndex: 1,
                explanation:
                    "Containment and escalation help limit spread and preserve evidence; follow the response plan.",
            },
        ],
    },
];
for (const group of groups) {
    if (group.questions.length !== 8)
        throw new Error(`${group.id} must have 8 questions`);
    for (const section of ["password", "phishing", "network", "forensics"]) {
        if (group.questions.filter((q) => q.sectionId === section).length !== 2)
            throw new Error(`${group.id} must have 2 ${section} questions`);
    }
    await db
        .collection("questionGroups")
        .doc(group.id)
        .set({
            name: group.name,
            order: group.order,
            questions: group.questions,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    console.log(`Uploaded ${group.id}: 8 questions`);
}
console.log("Seed complete: 3 groups × 8 questions = 24 questions.");
process.exit(0);


