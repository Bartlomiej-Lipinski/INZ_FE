export interface QuizzesCreate {
    "title": string;
    "description": string;
    "questions": [
        {
            "type": number;
            "content": string;
            "options": [
                {
                    "text": string;
                    "isCorrect": boolean;
                }
            ],
            "correctTrueFalse": boolean;
        }
    ]
}

export interface QuizzesAnswer {
    "answers": [
        {
            "questionId": string;
            "selectedOptionId": string;
            "selectedTrueFalse": boolean;
        }
    ]
}