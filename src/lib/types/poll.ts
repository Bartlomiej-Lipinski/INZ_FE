export interface PollCreate {
    question: string;
    options: [
        {
            id: string;
            text: string;
            votedUsers: [
                {
                    id: string;
                }
            ]
        }
    ]
}