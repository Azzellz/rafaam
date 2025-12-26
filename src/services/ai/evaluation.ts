import { Language, PracticeLanguage, WritingEvaluation } from "../../types";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { getAIConfig } from "../storage";
import { getProviderForType } from "./providers";
import { writingEvaluationSchema } from "./schemas";

const getLanguageName = (lang: Language): string =>
    LANGUAGE_CONFIG[lang]?.aiName ?? LANGUAGE_CONFIG[Language.EN].aiName;

export const evaluateWriting = async (
    text: string,
    prompt: string,
    level: string,
    language: Language,
    practiceLanguage: PracticeLanguage
): Promise<WritingEvaluation> => {
    const aiConfig = await getAIConfig();
    const model = aiConfig.defaultModel;
    const langName = getLanguageName(language);
    const practiceConfig = PRACTICE_LANGUAGES[practiceLanguage];
    const targetLanguage = practiceConfig.targetLanguageName;
    const levelLabel = practiceConfig.levelSystemLabel;

    const evaluationPrompt = `Evaluate the following ${targetLanguage} text written by a ${levelLabel} level ${level} learner based on the prompt: "${prompt}".

User's text: "${text}"

Provide:
1. A corrected version of the text.
2. General feedback in ${langName}.
3. A score from 0 to 100.
4. A list of specific improvements or corrections in ${langName}.
`;

    const provider = await getProviderForType("text");
    return await provider.generateStructuredData<WritingEvaluation>(
        evaluationPrompt,
        writingEvaluationSchema,
        { model }
    );
};
