import React from 'react';
import {GroupFeedItemResponseDto} from "@/lib/types/feedDtos";
import FeedItemComponent from "@/app/group-menu/feedItem-component";

interface FeedListProps {
    items: GroupFeedItemResponseDto[];
    userId: string;
    groupColor: string;
    expandedComments: Set<string>;
    newComment: Record<string, string>;
    onLike: (itemId: string) => void;
    onToggleComments: (itemId: string) => void;
    onCommentChange: (itemId: string, value: string) => void;
    onAddComment: (itemId: string) => void;
    onOpenMenu: (event: React.MouseEvent<HTMLElement>, itemId: string) => void;
    menuAnchor: { el: HTMLElement; itemId: string } | null;
    onCloseMenu: () => void;
    onEditPost: () => void;
    onDeletePost: () => void;
}

export default function FeedListComponent({
                                     items,
                                     userId,
                                     groupColor,
                                     expandedComments,
                                     newComment,
                                     onLike,
                                     onToggleComments,
                                     onCommentChange,
                                     onAddComment,
                                     onOpenMenu,
                                     menuAnchor,
                                     onCloseMenu,
                                     onEditPost,
                                     onDeletePost,
                                 }: FeedListProps) {
    return (
        <div>
            {items.map(item => (
                <div key={item.id} style={{marginBottom: '16px'}}>
                    <FeedItemComponent
                        item={item}
                        userId={userId}
                        groupColor={groupColor}
                        expanded={expandedComments.has(item.id)}
                        newComment={newComment[item.id] || ''}
                        onLike={onLike}
                        onToggleComments={onToggleComments}
                        onCommentChange={onCommentChange}
                        onAddComment={onAddComment}
                        onOpenMenu={onOpenMenu}
                        menuAnchor={menuAnchor && menuAnchor.itemId === item.id ? menuAnchor : null}
                        onCloseMenu={onCloseMenu}
                        onEditPost={onEditPost}
                        onDeletePost={onDeletePost}
                    />
                </div>
            ))}
        </div>
    );
}
