import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const MentionInput = forwardRef(({
    value,
    onChange,
    onMentionsChange,
    projectMembers = [],
    placeholder,
    disabled
}, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => textareaRef.current);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        onChange(newValue);
        setCursorPosition(cursorPos);
        
        // Check for @ mentions
        checkForMentions(newValue, cursorPos);
    };

    const checkForMentions = (text, cursorPos) => {
        // Find the last @ before cursor position
        let mentionIndex = -1;
        for (let i = cursorPos - 1; i >= 0; i--) {
            if (text[i] === '@') {
                mentionIndex = i;
                break;
            }
            if (text[i] === ' ' || text[i] === '\n') {
                break;
            }
        }

        if (mentionIndex >= 0) {
            const searchTerm = text.slice(mentionIndex + 1, cursorPos).toLowerCase();
            
            if (searchTerm.length >= 0) {
                const filteredMembers = projectMembers.filter(member => {
                    const fullName = member.full_name.toLowerCase();
                    return fullName.includes(searchTerm);
                });

                setSuggestions(filteredMembers.slice(0, 8));
                setMentionStart(mentionIndex);
                setShowSuggestions(true);
                return;
            }
        }

        setShowSuggestions(false);
        setSuggestions([]);
        setMentionStart(-1);
    };

    const insertMention = (member) => {
        if (mentionStart === -1) return;

        const beforeMention = value.slice(0, mentionStart);
        const afterCursor = value.slice(cursorPosition);
        const mentionText = `@${member.full_name} `;
        
        const newValue = beforeMention + mentionText + afterCursor;
        const newCursorPos = mentionStart + mentionText.length;
        
        onChange(newValue);
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionStart(-1);

        // Update mentions array
        const currentMentions = extractMentions(newValue);
        onMentionsChange(currentMentions);

        // Focus and set cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const extractMentions = (text) => {
        const mentions = [];
        const mentionRegex = /@([A-Za-z\s]+)/g;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            const mentionName = match[1].trim();
            const member = projectMembers.find(m => 
                m.full_name === mentionName
            );
            if (member && !mentions.includes(member.id)) {
                mentions.push(member.id);
            }
        }

        return mentions;
    };

    const handleKeyDown = (e) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                e.preventDefault();
            }
        }
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow clicking
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="mention-input-container">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className="mention-textarea"
                rows={3}
            />
            
            {showSuggestions && suggestions.length > 0 && (
                <div className="mention-suggestions">
                    {suggestions.map((member) => (
                        <div
                            key={member.id}
                            className="mention-suggestion"
                            onClick={() => insertMention(member)}
                        >
                            <div className="member-avatar">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div className="member-info">
                                <div className="member-name">
                                    {member.full_name}
                                </div>
                                <div className="member-role">
                                    {member.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

MentionInput.displayName = 'MentionInput';

export default MentionInput;