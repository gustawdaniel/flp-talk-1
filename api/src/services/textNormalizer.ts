export function normalizeLLMToJson(llmResponse: string): string {
    if(llmResponse.startsWith("```json") && llmResponse.endsWith("```")) {
        return llmResponse.slice(8, -3).trim();
    }

    return llmResponse.trim();
}