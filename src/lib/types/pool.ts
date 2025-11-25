export interface PoolCreate {
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