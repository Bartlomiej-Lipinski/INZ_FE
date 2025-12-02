export interface PollCreate {
    question: string;
    options: Array<{
        id: string;
        text: string;
        votedUsers: Array<{
            id: string;
        }>
    }>
}